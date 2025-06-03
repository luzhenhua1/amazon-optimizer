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

    console.log('收到解析请求:', { url, targetMarket });

    if (!url) {
      return NextResponse.json(
        { error: '请提供Amazon商品链接' },
        { status: 400 }
      );
    }

    // 开发环境下使用测试数据
    if (process.env.NODE_ENV === 'development' && url.includes('test')) {
      console.log('使用测试数据模式');
      
      const testProductInfo: ProductInfo = {
        title: "Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, Warmer & Sterilizer, 6 Quart, Stainless Steel/Black",
        description: "The Instant Pot Duo Plus is a 9-in-1 multi-use programmable cooker that replaces 9 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, sterilizer, warmer, and sous vide. Features 15 one-touch smart programs for pressure cooking ribs, soups, beans, rice, poultry, yogurt, desserts and more. Duo Plus has an advanced microprocessor that monitors pressure, temperature, keeps time, and adjusts heating intensity and duration to achieve your desired results every time.",
        keywords: ["instant pot", "pressure cooker", "electric", "multi cooker", "kitchen appliance", "cooking", "rice cooker", "slow cooker", "steamer", "yogurt maker"],
        category: "home",
        targetMarket: targetMarket || 'us',
        price: 69.99,
        images: ["https://m.media-amazon.com/images/I/71T1770jSML._AC_SL1500_.jpg"],
        reviews: 15420,
        rating: 4.6,
        amazonUrl: url,
        asin: "B075CYMYK6"
      };

      return NextResponse.json({
        success: true,
        data: testProductInfo,
        message: '测试数据加载成功'
      });
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
      
      // 如果是反爬虫错误，返回友好的测试建议
      if (scrapeError instanceof Error && scrapeError.message.includes('反爬虫')) {
        console.log('触发反爬虫保护，建议使用测试模式');
        return NextResponse.json({
          error: '当前无法访问Amazon，请使用测试链接',
          suggestion: 'https://www.amazon.com/test/dp/B075CYMYK6',
          testMode: true
        }, { status: 429 });
      }
      
      // 对于生产环境，如果爬虫失败，提供备用的测试数据
      if (process.env.NODE_ENV === 'production') {
        console.log('生产环境爬虫失败，使用备用数据');
        const fallbackProductInfo: ProductInfo = {
          title: "Amazon商品信息 - " + (asin || '示例'),
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
      
      throw scrapeError;
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
        details: '请检查链接是否正确，或稍后重试。推荐使用测试链接。'
      },
      { status: statusCode }
    );
  }
} 