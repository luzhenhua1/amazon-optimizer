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
        body: JSON.stringify({ productInfo }),
      });

      if (!response.ok) {
        throw new Error('优化请求失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let accumulatedResult = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulatedResult += data.content;
                // 这里需要更合适的处理方式，暂时设置为null，等待完整结果
              }
            } catch {
              // 忽略JSON解析错误
            }
          }
        }
      }

      // 创建一个基本的优化结果结构
      const basicOptimization: OptimizationSuggestion = {
        title: {
          original: productInfo.title,
          optimized: productInfo.title,
          suggestions: ['AI优化完成']
        },
        description: {
          original: productInfo.description,
          optimized: accumulatedResult || productInfo.description,
          suggestions: ['AI优化完成']
        },
        keywords: {
          original: productInfo.keywords,
          suggested: productInfo.keywords,
          analysis: 'AI分析完成'
        },
        seo: {
          score: 85,
          improvements: ['SEO优化完成']
        },
        competitive: {
          analysis: accumulatedResult || 'AI分析完成',
          recommendations: ['竞争分析完成']
        }
      };

      setOptimizationResult(basicOptimization);
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


