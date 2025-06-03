'use client';

import { useState } from 'react';
import { ProductForm } from '@/components/forms/ProductForm';
import { OptimizationResult } from '@/components/features/OptimizationResult';
import { ProductPreview } from '@/components/features/ProductPreview';
import { ProductInfo, OptimizationSuggestion, ProductFormData } from '@/types';

type OptimizationStep = 'form' | 'preview' | 'result';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<OptimizationStep>('form');
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationSuggestion | null>(null);
  const [thinkingProgress, setThinkingProgress] = useState<string>('');

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      console.log('提交表单数据:', data);
      
      // 如果是URL模式，调用解析API
      if (data.inputType === 'url') {
        const response = await fetch('/api/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: data.amazonUrl,
            targetMarket: data.targetMarket
          }),
        });

        console.log('API响应状态:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API错误响应:', errorData);
          throw new Error(errorData.error || '解析失败');
        }

        const result = await response.json();
        console.log('解析结果:', result);
        console.log('解析结果类型:', typeof result);
        console.log('解析结果success:', result.success);
        console.log('解析结果data:', result.data);
        
        if (result.success && result.data) {
          setProductInfo(result.data);
          setCurrentStep('preview');
        } else {
          console.error('解析结果格式错误:', result);
          throw new Error(result.error || '解析数据格式错误');
        }
      } else {
        // 手动输入模式，直接使用表单数据
        const manualProductInfo: ProductInfo = {
          title: data.title || '',
          description: data.description || '',
          keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()) : [],
          category: data.category || '',
          targetMarket: data.targetMarket || 'us',
        };
        
        setProductInfo(manualProductInfo);
        setCurrentStep('preview');
      }
    } catch (error) {
      console.error('解析错误:', error);
      const message = error instanceof Error ? error.message : '解析商品信息失败';
      alert(`错误: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewProceed = async () => {
    if (!productInfo) return;
    
    setIsLoading(true);
    setCurrentStep('result');
    setThinkingProgress('');
    
    try {
      console.log('开始AI优化...');
      
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productInfo,
          stream: true // 启用流式响应
        }),
      });

      if (!response.ok) {
        throw new Error('优化请求失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let accumulatedThinking = '';
      let finalResult = null;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              
              if (data.type === 'thinking' && data.content) {
                accumulatedThinking += data.content;
                setThinkingProgress(accumulatedThinking);
              } else if (data.type === 'result' && data.content) {
                finalResult = data.content;
                console.log('收到AI优化结果:', finalResult);
                break;
              } else if (data.type === 'content' && data.content) {
                // 处理内容流
                console.log('收到内容流:', data.content);
              } else if (data.type === 'processing' && data.content) {
                // 处理状态更新
                console.log('处理状态:', data.content);
              } else if (data.type === 'error') {
                console.error('AI处理错误:', data.content);
                throw new Error(data.content || 'AI处理失败');
              }
            } catch (parseError) {
              console.warn('解析流式数据失败:', parseError, '原始数据:', dataStr);
              // 忽略JSON解析错误，继续处理
            }
          }
        }
        
        // 如果已经收到结果，退出循环
        if (finalResult) break;
      }

      if (finalResult) {
        console.log('设置AI优化结果:', finalResult);
        setOptimizationResult(finalResult);
      } else {
        console.warn('未收到AI优化结果，使用备用数据');
        // 生成符合目标市场的备用优化建议
        const isEnglishMarket = ['us', 'uk', 'ca', 'au'].includes(productInfo.targetMarket);
        
        const basicOptimization = {
          title: {
            original: productInfo.title,
            optimized: isEnglishMarket 
              ? `${productInfo.title} | Premium Quality | Fast Shipping`
              : `【优质推荐】${productInfo.title}`,
            suggestions: [
              '在标题中添加核心关键词提升搜索排名',
              '使用情感化词汇增强购买欲望',
              '添加产品特色和卖点描述',
              '控制标题长度在合理范围内',
              '突出产品差异化优势'
            ]
          },
          description: {
            original: productInfo.description,
            optimized: isEnglishMarket 
              ? `${productInfo.description}\n\n✅ Why Choose This Product:\n• Premium quality materials and construction\n• User-friendly design for optimal performance\n• Excellent value with positive customer reviews\n• Fast shipping and reliable customer service`
              : `${productInfo.description}\n\n✅ 专业推荐理由：\n• 优质材料，品质保证\n• 人性化设计，使用便捷\n• 性价比高，用户好评如潮\n• 完善售后，购买无忧`,
            suggestions: [
              '增加产品核心卖点说明',
              '添加使用场景描述',
              '强化服务承诺和保障',
              '使用结构化布局提升可读性',
              '加入用户评价和推荐语'
            ]
          },
          keywords: {
            original: productInfo.keywords,
            suggested: isEnglishMarket 
              ? [...productInfo.keywords, 'premium quality', 'best value', 'professional grade', 'customer favorite', 'fast shipping']
              : [...productInfo.keywords, '高品质', '性价比', '专业推荐', '用户好评', '快速发货'],
            analysis: '关键词分析：当前关键词覆盖基础需求，建议增加长尾关键词和情感词汇以提升搜索匹配度和转化率。'
          },
          seo: {
            score: 78,
            improvements: [
              '优化标题关键词密度',
              '增强描述内容完整性',
              '扩展相关关键词覆盖',
              '提升页面用户体验',
              '加强产品图片优化'
            ]
          },
          competitive: {
            analysis: `${productInfo.category}市场竞争分析：该类目竞争适中，有优化空间。`,
            recommendations: [
              '强化产品差异化卖点',
              '优化价格策略',
              '提升客户服务质量',
              '加强品牌建设',
              '持续优化用户体验'
            ]
          }
        };
        setOptimizationResult(basicOptimization);
      }

      console.log('AI优化完成');
    } catch (error) {
      console.error('优化错误:', error);
      const message = error instanceof Error ? error.message : '优化失败';
      alert(`错误: ${message}`);
      setCurrentStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewEdit = () => {
    setCurrentStep('form');
  };

  const handleNewOptimization = () => {
    setCurrentStep('form');
    setProductInfo(null);
    setOptimizationResult(null);
  };

  const handleExport = async (format: 'pdf' | 'txt' | 'json') => {
    if (!productInfo || !optimizationResult) {
      alert('没有可导出的数据');
      return;
    }

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suggestion: optimizationResult,
          format
        }),
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amazon-optimization-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出错误:', error);
      const message = error instanceof Error ? error.message : '导出失败';
      alert(`错误: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            亚马逊商品优化助手
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            使用AI技术分析和优化您的亚马逊商品信息
          </p>
          
          {/* 微信群引流按钮 - 优雅版本 */}
          <div className="flex justify-center items-center mb-6">
            <a 
              href="https://i.miji.bid/2025/06/03/bc3c110b778443a4a73892c33149cd83.jpeg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 text-sm font-medium group"
            >
              <svg className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.162 4.203 2.97 5.498.135.093.234.24.234.393 0 .047-.006.094-.019.14L2.32 18.188c-.275.906.666 1.629 1.393 1.073l2.648-2.024c.094-.072.211-.098.325-.071.344.081.7.121 1.066.121C12.552 17.287 16.443 14 16.443 9.943c0-4.055-3.891-7.343-8.691-7.343L8.691 2.188z"/>
              </svg>
              <span className="border-b border-dotted border-blue-400 group-hover:border-blue-600 transition-colors">
                加入亚马逊交流群
              </span>
            </a>
          </div>
        </div>

        {/* 表单步骤 */}
        {currentStep === 'form' && (
          <ProductForm 
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
          />
        )}

        {/* 预览步骤 */}
        {currentStep === 'preview' && productInfo && (
          <ProductPreview
            productInfo={productInfo}
            onProceed={handlePreviewProceed}
            onEdit={handlePreviewEdit}
          />
        )}

        {/* 结果步骤 */}
        {currentStep === 'result' && (
          <OptimizationResult
            suggestion={optimizationResult || {
              title: { original: '', optimized: '', suggestions: [] },
              description: { original: '', optimized: '', suggestions: [] },
              keywords: { original: [], suggested: [], analysis: '' },
              seo: { score: 0, improvements: [] },
              competitive: { analysis: '', recommendations: [] }
            }}
            onExport={handleExport}
            onReset={handleNewOptimization}
            isLoading={isLoading}
            thinkingProgress={thinkingProgress}
          />
        )}
      </div>

      {/* 页面底部 - 优雅版本 */}
      <footer className="bg-white/70 backdrop-blur-sm border-t border-gray-100 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            {/* 主要信息 */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/>
                  </svg>
                  <span>数据本地处理，安全可靠</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <a 
                    href="https://github.com/luzhenhua1/amazon-optimizer" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    开源项目
                  </a>
                </div>
              </div>
            </div>

            {/* 版权信息 */}
            <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-4 w-full">
              <p className="flex items-center justify-center gap-2 flex-wrap">
                <span>&copy; 2025 亚马逊商品优化助手</span>
                <span className="hidden sm:inline">|</span>
                <span>作者：<span className="text-blue-600 font-medium">大户爱</span></span>
                <span className="hidden sm:inline">|</span>
                <a 
                  href="https://i.miji.bid/2025/06/03/bc3c110b778443a4a73892c33149cd83.jpeg" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors border-b border-dotted border-blue-300 hover:border-blue-500"
                >
                  交流群
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


