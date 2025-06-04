'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  FileText, 
  Target, 
  Download,
  CheckCircle,
  RotateCcw,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { OptimizationSuggestion } from '@/types';

interface OptimizationResultProps {
  suggestion: OptimizationSuggestion;
  onExport?: (format: 'pdf' | 'txt' | 'json') => void;
  onReset?: () => void;
  isLoading?: boolean;
  thinkingProgress?: string;
}

export function OptimizationResult({ 
  suggestion, 
  onExport, 
  onReset, 
  isLoading = false,
  thinkingProgress = ''
}: OptimizationResultProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'txt' | 'json'>('pdf');

  // 如果正在加载，显示AI思考状态
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* AI思考过程卡片 */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                AI 智能优化分析中
              </CardTitle>
            </div>
            <p className="text-gray-600 leading-relaxed">
              🧠 运用先进AI模型深度分析您的商品信息<br/>
              📊 全方位评估：内容优化、SEO策略、竞争分析、用户体验
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 进度指示器 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">优化进度</span>
                <span className="text-blue-600 font-semibold">分析中...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-2.5 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
            </div>

            {/* 思考内容区域 */}
            <div className="bg-white/80 rounded-xl p-6 border border-blue-100 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                实时分析过程
              </h4>
              <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed min-h-32 max-h-64 overflow-y-auto bg-gray-50/80 rounded-lg p-4 border border-gray-200">
                {thinkingProgress || '🚀 初始化AI分析引擎...\n🔍 加载商品优化模型...\n📋 准备多维度评估框架...'}
              </div>
            </div>

            {/* 状态指示器 */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/60 to-blue-50/60 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-700 font-medium">深度分析中，请稍候...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full font-medium">
                  ⚡ DeepSeek V3
                </div>
              </div>
            </div>

            {/* 技术说明 */}
            <div className="text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                采用DeepSeek V3先进推理模型，为您提供专业的亚马逊商品优化建议
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSEOScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSEOScoreText = (score: number) => {
    if (score >= 85) return '优秀';
    if (score >= 70) return '良好';
    return '需要改进';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 结果概览卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              优化结果概览
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getSEOScoreColor(suggestion.seo.score)}>
                SEO分数: {suggestion.seo.score}/100 - {getSEOScoreText(suggestion.seo.score)}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm text-gray-600">标题优化</div>
              <div className="text-base font-semibold">已优化</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm text-gray-600">关键词</div>
              <div className="text-base font-semibold">{suggestion.keywords.suggested.length} 个推荐</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm text-gray-600">描述</div>
              <div className="text-base font-semibold">已重写</div>
            </div>
          </div>

          {/* 核心改进建议 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🎯 核心改进建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestion.seo.improvements.slice(0, 6).map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* 标题优化详情 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📝 标题优化详情
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">原始标题</h3>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm">{suggestion.title.original}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-green-700">✨ 优化后标题</h3>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm">{suggestion.title.optimized}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">主要改进方向</h3>
            <ul className="space-y-1">
              {suggestion.title.suggestions.slice(0, 4).map((sug, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 描述优化详情 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📋 描述优化详情
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">原始描述</h3>
            <div className="p-4 bg-gray-50 rounded-lg border max-h-32 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{suggestion.description.original}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-green-700">✨ 优化后描述</h3>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 max-h-40 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{suggestion.description.optimized}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">主要改进方向</h3>
            <ul className="space-y-1">
              {suggestion.description.suggestions.slice(0, 4).map((sug, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 关键词优化 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🏷️ 关键词优化策略
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">推荐关键词</h4>
            <div className="flex flex-wrap gap-2">
              {suggestion.keywords.suggested.slice(0, 12).map((keyword, index) => (
                <Badge key={index} variant="default" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">策略分析</h4>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm whitespace-pre-wrap">{suggestion.keywords.analysis}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 竞争分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🏆 竞争分析与建议
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">市场分析</h4>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm whitespace-pre-wrap">{suggestion.competitive.analysis}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">竞争策略建议</h4>
            <ul className="space-y-1">
              {suggestion.competitive.recommendations.slice(0, 5).map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => onExport?.('txt')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              导出报告
            </Button>
            <Button
              variant="outline"
              onClick={() => onExport?.('json')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              下载数据
            </Button>
            <Button onClick={onReset} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              重新优化
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 