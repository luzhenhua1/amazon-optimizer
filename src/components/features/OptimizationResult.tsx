'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  FileText, 
  Target, 
  Download,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { OptimizationSuggestion } from '@/types';

interface OptimizationResultProps {
  suggestion: OptimizationSuggestion;
  onExport?: (format: 'pdf' | 'txt' | 'json') => void;
  onReset?: () => void;
}

export function OptimizationResult({ 
  suggestion, 
  onExport, 
  onReset 
}: OptimizationResultProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSEOScoreText = (score: number) => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    return '需要改进';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 结果概览卡片 - 简化版 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              优化结果
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getSEOScoreColor(suggestion.seo.score)}>
                SEO分数: {suggestion.seo.score}/100 - {getSEOScoreText(suggestion.seo.score)}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </CardContent>
      </Card>

      {/* 详细结果展示 - 精简版 */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">总览</TabsTrigger>
              <TabsTrigger value="title">标题</TabsTrigger>
              <TabsTrigger value="description">描述</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🎯 核心改进</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {suggestion.seo.improvements.slice(0, 4).map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 关键词优化</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">推荐关键词</h4>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.keywords.suggested.slice(0, 8).map((keyword, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="title" className="space-y-4">
              <div className="grid gap-4">
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
                  <h3 className="font-medium mb-2">主要改进</h3>
                  <ul className="space-y-1">
                    {suggestion.title.suggestions.slice(0, 3).map((sug, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="description" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium mb-2">原始描述</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border max-h-24 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{suggestion.description.original}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-green-700">✨ 优化后描述</h3>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 max-h-32 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{suggestion.description.optimized}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">主要改进</h3>
                  <ul className="space-y-1">
                    {suggestion.description.suggestions.slice(0, 3).map((sug, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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