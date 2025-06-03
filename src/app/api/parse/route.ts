import { NextRequest, NextResponse } from 'next/server';
import { scrapeAmazonProductWithRetry, extractASIN, detectAmazonSite } from '@/lib/amazonScraper';

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

    if (!url) {
      return NextResponse.json(
        { error: '请提供Amazon商品链接' },
        { status: 400 }
      );
    }

    // 验证是否为Amazon链接
    const amazonSite = detectAmazonSite(url);
    if (!amazonSite) {
      return NextResponse.json(
        { error: '请提供有效的Amazon商品链接' },
        { status: 400 }
      );
    }

    // 提取ASIN
    const asin = extractASIN(url);
    if (!asin) {
      return NextResponse.json(
        { error: '无法从链接中提取商品ASIN' },
        { status: 400 }
      );
    }

    console.log(`开始解析Amazon商品: ${asin} from ${amazonSite}`);

    // 使用爬虫获取商品信息
    const productInfo = await scrapeAmazonProductWithRetry(url, targetMarket || 'US');

    console.log(`解析成功: ${productInfo.title}`);

    return NextResponse.json({
      success: true,
      data: productInfo,
      message: '商品信息解析成功'
    });

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
        error: errorMessage,
        details: '请检查链接是否正确，或稍后重试'
      },
      { status: statusCode }
    );
  }
} 