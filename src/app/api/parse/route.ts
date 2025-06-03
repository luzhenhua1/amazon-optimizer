import { NextRequest, NextResponse } from 'next/server';
import { scrapeAmazonProductWithRetry, extractASIN, detectAmazonSite } from '@/lib/amazonScraper';
import { ProductInfo } from '@/types';

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: Request) {
  try {
    const { url, targetMarket } = await request.json();

    console.log('收到解析请求:', { url, targetMarket });

    if (!url) {
      return NextResponse.json(
        { error: '请提供Amazon商品链接' },
        { status: 400 }
      );
    }

    // 验证是否为Amazon链接
    const amazonSite = detectAmazonSite(url);
    if (!amazonSite) {
      console.log('无效的Amazon链接:', url);
      return NextResponse.json(
        { error: '请提供有效的Amazon商品链接' },
        { status: 400 }
      );
    }

    // 提取ASIN
    const asin = extractASIN(url);
    if (!asin) {
      console.log('无法提取ASIN:', url);
      return NextResponse.json(
        { error: '无法从链接中提取商品ASIN' },
        { status: 400 }
      );
    }

    console.log(`开始解析Amazon商品: ${asin} from ${amazonSite}`);

    try {
      // 使用爬虫获取商品信息
      const productInfo = await scrapeAmazonProductWithRetry(url, targetMarket || 'US');

      console.log(`解析成功: ${productInfo.title.substring(0, 50)}...`);

      return NextResponse.json({
        success: true,
        data: productInfo,
        message: '商品信息解析成功'
      });
    } catch (scrapeError) {
      console.error('爬虫错误:', scrapeError);
      
      // 如果是反爬虫错误，提供备用数据以保证服务可用
      if (scrapeError instanceof Error && scrapeError.message.includes('反爬虫')) {
        console.log('触发反爬虫保护，使用备用数据');
        
        const fallbackProductInfo: ProductInfo = {
          title: `${amazonSite}商品 - ${asin}`,
          description: "由于网络限制，暂时无法获取完整商品信息。这是一个演示数据，展示AI优化功能。在正常情况下，系统会自动提取真实的Amazon商品信息，包括标题、描述、价格、评分等详细信息。",
          keywords: ["amazon", "商品", "优化", asin || "示例"],
          category: "general",
          targetMarket: targetMarket || 'us',
          price: 99.99,
          images: [],
          reviews: 100,
          rating: 4.5,
          amazonUrl: url,
          asin: asin || 'DEMO001'
        };

        return NextResponse.json({
          success: true,
          data: fallbackProductInfo,
          message: '网络限制，使用演示数据',
          isDemo: true
        });
      }
      
      // 对于其他错误，也提供备用数据确保服务稳定
      console.log('爬虫失败，使用备用数据确保服务可用');
      const fallbackProductInfo: ProductInfo = {
        title: `Amazon商品信息 - ${asin || '示例'}`,
        description: "由于网络限制，暂时无法获取完整商品信息。这是一个演示数据，展示AI优化功能。在实际使用中，系统会自动提取真实的Amazon商品信息。",
        keywords: ["amazon", "商品", "优化", "示例"],
        category: "general",
        targetMarket: targetMarket || 'us',
        price: 99.99,
        images: [],
        reviews: 100,
        rating: 4.5,
        amazonUrl: url,
        asin: asin || 'DEMO001'
      };

      return NextResponse.json({
        success: true,
        data: fallbackProductInfo,
        message: '使用演示数据（网络限制）',
        isDemo: true
      });
    }

  } catch (error) {
    console.error('解析API错误:', error);
    
    const errorMessage = error instanceof Error ? error.message : '解析失败';
    
    // 根据错误类型返回不同的状态码
    let statusCode = 500;
    if (errorMessage.includes('无法从URL中提取ASIN') || 
        errorMessage.includes('不支持的Amazon站点')) {
      statusCode = 400;
    } else if (errorMessage.includes('反爬虫系统拦截')) {
      statusCode = 429; // Too Many Requests
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: '请检查链接是否正确，或稍后重试。'
      },
      { status: statusCode }
    );
  }
} 