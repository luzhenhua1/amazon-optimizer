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

      // 创建思考过程的显示容器
      const thinkingOverlay = document.createElement('div');
      thinkingOverlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
      thinkingOverlay.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div class="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 class="font-semibold text-lg">DeepSeek-R1 正在深度思考</h3>
            </div>
            <p class="text-blue-100 text-sm mt-1">AI正在分析您的商品信息，生成专业优化建议...</p>
          </div>
          <div class="p-6 max-h-96 overflow-y-auto">
            <div id="thinking-content" class="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
              🤔 正在启动DeepSeek-R1推理引擎...
            </div>
          </div>
          <div class="p-4 border-t bg-gray-50 text-center">
            <div class="flex items-center justify-center gap-2 text-xs text-gray-500">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
              <span>深度推理中，请稍候...</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(thinkingOverlay);

      const thinkingContent = document.getElementById('thinking-content');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'thinking' && data.content) {
                accumulatedThinking += data.content;
                if (thinkingContent) {
                  thinkingContent.textContent = accumulatedThinking;
                  thinkingContent.scrollTop = thinkingContent.scrollHeight;
                }
              } else if (data.type === 'result' && data.content) {
                finalResult = data.content;
                break;
              }
            } catch {
              // 忽略JSON解析错误
            }
          }
        }
      }

      // 移除思考过程覆盖层
      setTimeout(() => {
        document.body.removeChild(thinkingOverlay);
      }, 1000);

      if (finalResult) {
        setOptimizationResult(finalResult);
      } else {
        throw new Error('未收到AI优化结果');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            亚马逊商品优化助手
          </h1>
          <p className="text-xl text-gray-600">
            使用AI技术分析和优化您的亚马逊商品信息
          </p>
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
        {currentStep === 'result' && optimizationResult && (
          <OptimizationResult
            suggestion={optimizationResult}
            onExport={handleExport}
            onReset={handleNewOptimization}
          />
        )}
      </div>
    </div>
  );
}


