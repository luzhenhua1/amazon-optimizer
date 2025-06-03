'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  MessageCircle, 
  DollarSign, 
  Package, 
  ExternalLink, 
  Tag 
} from 'lucide-react';
import { ProductInfo } from '@/types';

interface ProductPreviewProps {
  productInfo: ProductInfo;
  onProceed: () => void;
  onEdit: () => void;
}

export function ProductPreview({ productInfo, onProceed, onEdit }: ProductPreviewProps) {
  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatRating = (rating: number | null | undefined) => {
    if (!rating) return 'N/A';
    return rating.toFixed(1);
  };

  const formatReviews = (reviews: number | null | undefined) => {
    if (!reviews) return '暂无评论';
    if (reviews >= 1000) {
      return `${(reviews / 1000).toFixed(1)}K`;
    }
    return reviews.toString();
  };

  // 智能图片URL处理（Vercel友好）
  const getOptimizedImageUrl = (originalUrl: string) => {
    if (!originalUrl) return null;
    
    // 对于Amazon图片，尝试直接访问
    if (originalUrl.includes('images-amazon') || originalUrl.includes('ssl-images-amazon')) {
      // 移除可能的尺寸限制，获取更好的图片
      return originalUrl.replace(/\._[A-Z0-9,_]+_\./, '.');
    }
    
    return originalUrl;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          商品信息预览
        </CardTitle>
        <p className="text-sm text-gray-600">
          已成功解析商品信息，请确认信息正确后继续进行AI优化
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基础信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 商品图片 */}
          <div className="space-y-4">
            {productInfo.images && productInfo.images.length > 0 ? (
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getOptimizedImageUrl(productInfo.images[0]) || undefined}
                  alt={productInfo.title}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    // 尝试其他图片
                    const currentIndex = parseInt(e.currentTarget.dataset.index || '0');
                    const nextIndex = currentIndex + 1;
                    
                    if (nextIndex < (productInfo.images?.length || 0)) {
                      e.currentTarget.src = getOptimizedImageUrl(productInfo.images![nextIndex]) || '';
                      e.currentTarget.dataset.index = nextIndex.toString();
                    } else {
                      // 所有图片都失败，显示占位符
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gray-100">
                            <div class="text-center">
                              <svg class="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                              </svg>
                              <p class="text-sm text-gray-500">商品图片</p>
                            </div>
                          </div>
                        `;
                      }
                    }
                  }}
                  data-index="0"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">暂无图片</p>
                </div>
              </div>
            )}
            
            {/* 快捷信息 */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{formatPrice(productInfo.price)}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">{formatRating(productInfo.rating)}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded col-span-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">{formatReviews(productInfo.reviews)}</span>
              </div>
            </div>
          </div>

          {/* 商品详情 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 标题 */}
            <div>
              <h3 className="font-semibold text-lg mb-2">商品标题</h3>
              <p className="text-gray-800 leading-relaxed">{productInfo.title}</p>
            </div>

            {/* 分类和市场 */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {productInfo.category}
              </Badge>
              <Badge variant="outline">
                目标市场: {productInfo.targetMarket}
              </Badge>
              {productInfo.asin && (
                <Badge variant="outline">
                  ASIN: {productInfo.asin}
                </Badge>
              )}
            </div>

            {/* 关键词 */}
            {productInfo.keywords && productInfo.keywords.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">提取的关键词</h4>
                <div className="flex flex-wrap gap-2">
                  {productInfo.keywords.slice(0, 10).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {productInfo.keywords.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{productInfo.keywords.length - 10} 更多
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* 描述预览 */}
            <div>
              <h4 className="font-medium mb-2">商品描述</h4>
              <div className="p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {productInfo.description.length > 300 
                    ? productInfo.description.substring(0, 300) + '...' 
                    : productInfo.description}
                </p>
              </div>
            </div>

            {/* Amazon链接 */}
            {productInfo.amazonUrl && (
              <div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(productInfo.amazonUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  查看原始Amazon页面
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onEdit} className="flex-1">
            修改信息
          </Button>
          <Button onClick={onProceed} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            继续AI优化
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 