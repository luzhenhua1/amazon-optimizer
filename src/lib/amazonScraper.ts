import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';
import { ProductInfo } from '@/types';

// Amazon站点配置
const AMAZON_SITES = {
  'amazon.com': { domain: 'amazon.com', currency: 'USD', locale: 'en-US' },
  'amazon.co.uk': { domain: 'amazon.co.uk', currency: 'GBP', locale: 'en-GB' },
  'amazon.de': { domain: 'amazon.de', currency: 'EUR', locale: 'de-DE' },
  'amazon.fr': { domain: 'amazon.fr', currency: 'EUR', locale: 'fr-FR' },
  'amazon.co.jp': { domain: 'amazon.co.jp', currency: 'JPY', locale: 'ja-JP' },
  'amazon.ca': { domain: 'amazon.ca', currency: 'CAD', locale: 'en-CA' },
  'amazon.com.au': { domain: 'amazon.com.au', currency: 'AUD', locale: 'en-AU' },
  'amazon.in': { domain: 'amazon.in', currency: 'INR', locale: 'en-IN' },
};

// 请求头配置
const getRandomHeaders = () => {
  const userAgent = new UserAgent();
  return {
    'User-Agent': userAgent.toString(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
  };
};

// 从URL提取ASIN
export function extractASIN(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/ASIN\/([A-Z0-9]{10})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// 检测Amazon站点
export function detectAmazonSite(url: string): string | null {
  for (const domain of Object.keys(AMAZON_SITES)) {
    if (url.includes(domain)) {
      return domain;
    }
  }
  return null;
}

// 清理文本内容
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

// 解析价格
function parsePrice(priceText: string): number | null {
  if (!priceText) return null;
  
  console.log(`解析价格文本: "${priceText}"`);
  
  // 移除所有非数字、小数点和逗号的字符
  const cleanPrice = priceText
    .replace(/[^\d.,]/g, '')
    .replace(/,(?=\d{3})/g, '') // 移除千位分隔符，但保留小数点前的逗号
    .replace(/\.(?=.*\.)/g, ''); // 如果有多个小数点，只保留最后一个
  
  console.log(`清理后的价格: "${cleanPrice}"`);
  
  if (!cleanPrice) return null;
  
  const price = parseFloat(cleanPrice);
  
  // 验证价格的合理性
  if (isNaN(price) || price <= 0 || price > 50000) {
    console.log(`价格无效或超出合理范围: ${price}`);
    return null;
  }
  
  return price;
}

// 解析评分
function parseRating(ratingText: string): number | null {
  if (!ratingText) return null;
  
  console.log(`解析评分文本: "${ratingText}"`);
  
  // 匹配评分模式：如 "4.5 out of 5 stars" 或 "4.5"
  const patterns = [
    /(\d+\.?\d*)\s*out\s*of\s*5/i,
    /(\d+\.?\d*)\s*stars?/i,
    /(\d+\.?\d*)/
  ];
  
  for (const pattern of patterns) {
    const match = ratingText.match(pattern);
    if (match) {
      const rating = parseFloat(match[1]);
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        console.log(`成功解析评分: ${rating}`);
        return rating;
      }
    }
  }
  
  console.log(`评分解析失败: "${ratingText}"`);
  return null;
}

// 解析评论数量
function parseReviewCount(reviewText: string): number | null {
  if (!reviewText) return null;
  
  console.log(`解析评论数文本: "${reviewText}"`);
  
  // 匹配各种评论数格式
  const patterns = [
    /(\d{1,3}(?:,\d{3})*)\s*review/i, // "1,234 reviews"
    /(\d{1,3}(?:,\d{3})*)\s*rating/i, // "1,234 ratings" 
    /(\d+)\s*customer/i, // "123 customer reviews"
    /(\d{1,3}(?:,\d{3})*)/g // 任何数字（作为最后手段）
  ];
  
  for (const pattern of patterns) {
    const match = reviewText.match(pattern);
    if (match) {
      // 移除逗号并转换为数字
      const cleanNumber = match[1].replace(/,/g, '');
      const count = parseInt(cleanNumber);
      
      if (!isNaN(count) && count > 0 && count < 10000000) { // 合理范围
        console.log(`成功解析评论数: ${count}`);
        return count;
      }
    }
  }
  
  console.log(`评论数解析失败: "${reviewText}"`);
  return null;
}

// 主要的爬虫函数
export async function scrapeAmazonProduct(url: string, targetMarket: string): Promise<ProductInfo> {
  const asin = extractASIN(url);
  if (!asin) {
    throw new Error('无法从URL中提取ASIN');
  }

  const site = detectAmazonSite(url);
  if (!site) {
    throw new Error('不支持的Amazon站点');
  }

  try {
    console.log(`开始爬取Amazon商品: ${asin} from ${site}`);
    
    // 构建请求URL（使用更简洁的产品页面URL）
    const productUrl = `https://${site}/dp/${asin}`;
    
    const response = await fetch(productUrl, {
      method: 'GET',
      headers: getRandomHeaders(),
      // 适配Vercel: 减少超时时间
      signal: AbortSignal.timeout(8000), // 8秒超时（为Vercel 10秒限制留余量）
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 检测是否被反爬虫系统拦截
    if ($('title').text().includes('Robot') || html.includes('captcha')) {
      throw new Error('被Amazon反爬虫系统拦截，请稍后重试');
    }

    // 提取商品标题
    const title = cleanText(
      $('#productTitle').text() ||
      $('[data-automation-id="product-title"]').text() ||
      $('.product-title').text() ||
      $('h1').first().text() ||
      ''
    );

    // 提取商品描述
    let description = '';
    
    // 尝试多种描述选择器
    const descriptionSelectors = [
      '#feature-bullets ul li span',
      '.a-unordered-list.a-vertical li span',
      '#productDescription p',
      '.product-description',
      '.aplus-v2 .celwidget',
    ];

    for (const selector of descriptionSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        const descriptions = elements.map((_, el) => cleanText($(el).text())).get();
        description = descriptions.filter(d => d && d.length > 10).join('\n');
        if (description.length > 50) break; // 找到足够的描述就停止
      }
    }

    // 如果还是没有描述，尝试获取产品特性
    if (!description) {
      const features = $('#feature-bullets li').map((_, el) => {
        const text = cleanText($(el).text());
        return text.length > 10 ? text : null;
      }).get().filter(Boolean);
      
      description = features.join('\n');
    }

    // 提取价格 - 更全面的选择器
    const priceSelectors = [
      '.a-price .a-offscreen', // 主要价格
      '.a-price-whole', // 整数部分
      '.a-price-range .a-offscreen', // 价格区间
      '#priceblock_dealprice', // 特价
      '#priceblock_ourprice', // 原价
      '.a-price.a-text-price .a-offscreen', // 文本价格
      '.a-price-current .a-offscreen', // 当前价格
      'span[data-a-color="price"]', // 颜色标记的价格
      '.a-offscreen[aria-hidden="true"]', // 隐藏的价格文本
    ];

    let price: number | null = null;
    for (const selector of priceSelectors) {
      const priceElement = $(selector).first();
      if (priceElement.length > 0) {
        const priceText = priceElement.text().trim();
        console.log(`尝试价格选择器 "${selector}": "${priceText}"`);
        price = parsePrice(priceText);
        if (price && price > 0) {
          console.log(`成功解析价格: $${price}`);
          break;
        }
      }
    }

    // 如果还是没有找到价格，尝试页面中所有包含货币符号的文本
    if (!price) {
      $('span, div').each((_, el) => {
        const text = $(el).text();
        if (text.match(/\$[\d,]+\.?\d*/)) {
          const potentialPrice = parsePrice(text);
          if (potentialPrice && potentialPrice > 0 && potentialPrice < 10000) { // 合理价格范围
            price = potentialPrice;
            console.log(`通过模糊匹配找到价格: $${price}`);
            return false; // 跳出循环
          }
        }
      });
    }

    // 提取评分 - 更全面的选择器
    const ratingSelectors = [
      '[data-hook="average-star-rating"] .a-sr-only',
      '.a-icon-alt', // 星级图标的alt文本
      '.reviewCountTextLinkedHistogram .a-sr-only',
      '[data-hook="rating-out-of-text"]',
      '.a-star-medium .a-sr-only',
      '.cr-widget-summary .a-sr-only',
    ];

    let rating: number | null = null;
    for (const selector of ratingSelectors) {
      const ratingElement = $(selector).first();
      if (ratingElement.length > 0) {
        const ratingText = ratingElement.text().trim();
        console.log(`尝试评分选择器 "${selector}": "${ratingText}"`);
        rating = parseRating(ratingText);
        if (rating && rating > 0) {
          console.log(`成功解析评分: ${rating}`);
          break;
        }
      }
    }

    // 提取评论数量 - 更全面的选择器
    const reviewSelectors = [
      '[data-hook="total-review-count"]',
      '#acrCustomerReviewText',
      '.reviewCountTextLinkedHistogram',
      '[data-hook="total-review-count"] .a-sr-only',
      '.cr-widget-summary a[href*="reviews"]',
      'a[data-hook="see-all-reviews-link"]',
      'span[data-hook="total-review-count"]',
      '.a-link-normal[href*="#customerReviews"]',
    ];

    let reviews: number | null = null;
    for (const selector of reviewSelectors) {
      const reviewElement = $(selector).first();
      if (reviewElement.length > 0) {
        const reviewText = reviewElement.text().trim();
        console.log(`尝试评论选择器 "${selector}": "${reviewText}"`);
        reviews = parseReviewCount(reviewText);
        if (reviews && reviews > 0) {
          console.log(`成功解析评论数: ${reviews}`);
          break;
        }
      }
    }

    // 如果还是没有找到评论数，尝试查找包含"reviews"的文本
    if (!reviews) {
      $('span, a').each((_, el) => {
        const text = $(el).text();
        if (text.includes('review') && text.match(/[\d,]+/)) {
          const potentialReviews = parseReviewCount(text);
          if (potentialReviews && potentialReviews > 0) {
            reviews = potentialReviews;
            console.log(`通过模糊匹配找到评论数: ${reviews}`);
            return false;
          }
        }
      });
    }

    // 提取图片 - 改进选择器和处理防盗链
    const images: string[] = [];
    const imageSelectors = [
      '#landingImage', // 主图
      'img[data-a-image-name="landingImage"]',
      '.imgTagWrapper img',
      '#imageBlock img',
      '.a-dynamic-image',
      'img[data-old-hires]', // 高分辨率图片
      'img[src*="images-amazon"]', // Amazon CDN图片
    ];

    const foundImages = new Set<string>(); // 去重

    for (const selector of imageSelectors) {
      $(selector).each((_, el) => {
        const src = $(el).attr('data-src') || 
                   $(el).attr('src') || 
                   $(el).attr('data-old-hires') ||
                   $(el).attr('data-a-dynamic-image');
        
        if (src) {
          let imageUrl = src;
          
          // 处理相对URL
          if (src.startsWith('//')) {
            imageUrl = 'https:' + src;
          } else if (src.startsWith('/')) {
            imageUrl = `https://${site}${src}`;
          }
          
          // 只添加有效的Amazon图片URL
          if (imageUrl.includes('images-amazon') || imageUrl.includes('ssl-images-amazon')) {
            // 尝试获取更高分辨率的图片
            const highResUrl = imageUrl.replace(/\._[A-Z0-9,_]+_\./, '.');
            foundImages.add(highResUrl);
          }
        }
      });
    }

    // 将Set转换为数组并限制数量
    images.push(...Array.from(foundImages).slice(0, 5));
    
    console.log(`找到 ${images.length} 张图片`);
    images.forEach((img, index) => {
      console.log(`图片 ${index + 1}: ${img.substring(0, 100)}...`);
    });

    // 自动推断分类
    let category = 'general';
    const titleLower = title.toLowerCase();
    const descriptionLower = description.toLowerCase();
    const text = `${titleLower} ${descriptionLower}`;

    if (text.includes('电子') || text.includes('electronic') || text.includes('phone') || text.includes('computer')) {
      category = 'electronics';
    } else if (text.includes('服装') || text.includes('clothing') || text.includes('shirt') || text.includes('dress')) {
      category = 'clothing';
    } else if (text.includes('家居') || text.includes('home') || text.includes('kitchen') || text.includes('furniture')) {
      category = 'home';
    } else if (text.includes('书') || text.includes('book') || text.includes('novel')) {
      category = 'books';
    } else if (text.includes('运动') || text.includes('sport') || text.includes('fitness') || text.includes('gym')) {
      category = 'sports';
    } else if (text.includes('美容') || text.includes('beauty') || text.includes('cosmetic') || text.includes('skincare')) {
      category = 'beauty';
    } else if (text.includes('汽车') || text.includes('automotive') || text.includes('car') || text.includes('vehicle')) {
      category = 'automotive';
    }

    // 从标题和描述中提取关键词
    const extractKeywords = (text: string): string[] => {
      const words = text
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中文字符
        .split(/\s+/)
        .filter(word => word.length > 2 && word.length < 20);
      
      // 去重并限制数量
      return [...new Set(words)].slice(0, 10);
    };

    const keywords = extractKeywords(`${title} ${description}`);

    console.log(`爬取完成: ${title.substring(0, 50)}...`);

    return {
      title: title || `Amazon商品 ${asin}`,
      description: description || '暂无商品描述',
      keywords,
      category,
      targetMarket,
      price: price ?? undefined,
      images: images.slice(0, 5), // 限制图片数量
      reviews: reviews || 0,
      rating: rating || 0,
      amazonUrl: url,
      asin,
    };

  } catch (error) {
    console.error('爬取失败:', error);
    
    // 如果爬取失败，返回基础信息
    throw new Error(`爬取失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 带重试机制的爬虫函数（Vercel优化版）
export async function scrapeAmazonProductWithRetry(
  url: string, 
  targetMarket: string, 
  maxRetries: number = 2 // Vercel优化：减少重试次数
): Promise<ProductInfo> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`尝试第 ${attempt} 次爬取...`);
      
      // Vercel优化：减少延迟时间
      if (attempt > 1) {
        const delay = Math.random() * 1000 + 500; // 0.5-1.5秒随机延迟
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await scrapeAmazonProduct(url, targetMarket);
      
    } catch (error) {
      console.error(`第 ${attempt} 次尝试失败:`, error);
      lastError = error instanceof Error ? error : new Error('未知错误');
      
      if (attempt === maxRetries) {
        break;
      }
    }
  }
  
  throw lastError || new Error('爬取失败');
} 