import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, OptimizationSuggestion, ProductInfo } from '@/types';

// 分模块AI优化 - 标题优化专用AI
async function optimizeTitle(productInfo: ProductInfo): Promise<{original: string, optimized: string, suggestions: string[]}> {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  const isEnglishMarket = ['us', 'uk', 'ca', 'au'].includes(productInfo.targetMarket);
  
  if (!apiKey) {
    throw new Error('未配置SILICONFLOW_API_KEY，请联系管理员配置AI服务');
  }

  try {
    const prompt = isEnglishMarket ? 
      `Optimize this Amazon product title for ${productInfo.targetMarket.toUpperCase()} market:

Title: "${productInfo.title}"
Category: ${productInfo.category}
Keywords: ${productInfo.keywords.join(', ')}

Requirements:
- Keep under 200 characters
- Include main keywords naturally
- Add premium quality indicators
- Make it compelling for clicks
- Use proper English grammar

Output ONLY this JSON format:
{
  "optimized": "your optimized title here",
  "suggestions": ["tip1", "tip2", "tip3"]
}` :
      `优化这个亚马逊商品标题，针对${productInfo.targetMarket}市场：

标题："${productInfo.title}"
类目：${productInfo.category}
关键词：${productInfo.keywords.join('，')}

要求：
- 控制在200字符内
- 自然融入主要关键词
- 添加品质指标词
- 提升点击吸引力
- 语法正确流畅

只输出此JSON格式：
{
  "optimized": "你优化的标题",
  "suggestions": ["建议1", "建议2", "建议3"]
}`;

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'Pro/deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.1,
        top_p: 0.9
      }),
      signal: AbortSignal.timeout(20000) // 20秒超时
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('标题优化API详细错误:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        model: 'Pro/deepseek-ai/DeepSeek-V3',
        apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined'
      });
      throw new Error(`API错误: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (content) {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return {
        original: productInfo.title,
        optimized: parsed.optimized || productInfo.title,
        suggestions: parsed.suggestions || []
      };
    }
    
    throw new Error('AI返回内容为空');
  } catch (error) {
    console.error('标题优化AI失败:', error);
    throw error;
  }
}

// 分模块AI优化 - 描述优化专用AI
async function optimizeDescription(productInfo: ProductInfo): Promise<{original: string, optimized: string, suggestions: string[]}> {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  const isEnglishMarket = ['us', 'uk', 'ca', 'au'].includes(productInfo.targetMarket);
  
  if (!apiKey) {
    throw new Error('未配置SILICONFLOW_API_KEY，请联系管理员配置AI服务');
  }

  try {
    const prompt = isEnglishMarket ?
      `Enhance this Amazon product description for ${productInfo.targetMarket.toUpperCase()} market:

Current: "${productInfo.description}"
Category: ${productInfo.category}
Title: ${productInfo.title}

Make it more compelling by:
- Adding bullet points for key features
- Including trust signals
- Highlighting unique benefits
- Adding emotional appeal
- Ensuring readability

Output ONLY this JSON format:
{
  "optimized": "your enhanced description here",
  "suggestions": ["improvement1", "improvement2", "improvement3"]
}` :
      `优化这个亚马逊商品描述，针对${productInfo.targetMarket}市场：

当前描述："${productInfo.description}"
类目：${productInfo.category}
标题：${productInfo.title}

优化要求：
- 添加要点列表突出特色
- 加入信任指标
- 强调独特优势
- 增加情感吸引力
- 确保可读性

只输出此JSON格式：
{
  "optimized": "你优化的描述",
  "suggestions": ["改进点1", "改进点2", "改进点3"]
}`;

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'Pro/deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.1,
        top_p: 0.9
      }),
      signal: AbortSignal.timeout(20000) // 20秒超时
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('描述优化API详细错误:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        model: 'Pro/deepseek-ai/DeepSeek-V3',
        apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined'
      });
      throw new Error(`API错误: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (content) {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return {
        original: productInfo.description,
        optimized: parsed.optimized || productInfo.description,
        suggestions: parsed.suggestions || []
      };
    }
    
    throw new Error('AI返回内容为空');
  } catch (error) {
    console.error('描述优化AI失败:', error);
    throw error;
  }
}

// 分模块AI优化 - 关键词优化专用AI
async function optimizeKeywords(productInfo: ProductInfo): Promise<{original: string[], suggested: string[], analysis: string}> {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  const isEnglishMarket = ['us', 'uk', 'ca', 'au'].includes(productInfo.targetMarket);
  
  if (!apiKey) {
    throw new Error('未配置SILICONFLOW_API_KEY，请联系管理员配置AI服务');
  }

  try {
    const prompt = isEnglishMarket ?
      `Suggest optimized keywords for this Amazon product in ${productInfo.targetMarket.toUpperCase()} market:

Product: "${productInfo.title}"
Category: ${productInfo.category}
Current Keywords: ${productInfo.keywords.join(', ')}

Requirements:
- Provide exactly 8-12 high-converting keywords
- Include long-tail keywords
- Focus on buyer intent keywords
- Consider search volume and competition
- Mix broad and specific terms

Output ONLY this JSON format:
{
  "suggested": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "analysis": "brief analysis of keyword strategy"
}` :
      `为这个亚马逊商品优化关键词，针对${productInfo.targetMarket}市场：

商品："${productInfo.title}"
类目：${productInfo.category}
当前关键词：${productInfo.keywords.join('，')}

要求：
- 提供8-12个高转化关键词
- 包含长尾关键词
- 关注购买意图关键词
- 考虑搜索量和竞争度
- 搭配宽泛和精准词汇

只输出此JSON格式：
{
  "suggested": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5", "关键词6", "关键词7", "关键词8"],
  "analysis": "关键词策略简要分析"
}`;

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'Pro/deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.2,
        top_p: 0.9
      }),
      signal: AbortSignal.timeout(20000) // 20秒超时
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('关键词优化API详细错误:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        model: 'Pro/deepseek-ai/DeepSeek-V3',
        apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined'
      });
      throw new Error(`API错误: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (content) {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return {
        original: productInfo.keywords,
        suggested: parsed.suggested || [...productInfo.keywords],
        analysis: parsed.analysis || ''
      };
    }
    
    throw new Error('AI返回内容为空');
  } catch (error) {
    console.error('关键词优化AI失败:', error);
    throw error;
  }
}

// 备用方案函数
function generateFallbackTitle(productInfo: ProductInfo, isEnglishMarket: boolean) {
  let optimized = productInfo.title;
  if (optimized.length > 150) {
    optimized = optimized.substring(0, 147) + '...';
  }
  if (!optimized.toLowerCase().includes('premium') && !optimized.toLowerCase().includes('quality')) {
    optimized += isEnglishMarket ? ' - Premium Quality' : ' - 优质精选';
  }
  
  return {
    original: productInfo.title,
    optimized,
    suggestions: isEnglishMarket ? [
      'Add specific product specifications in title',
      'Include premium quality indicators',
      'Use keywords naturally in title flow',
      'Keep title under 200 characters',
      'Add emotional triggers for better CTR'
    ] : [
      '在标题中添加具体产品规格',
      '包含优质品质指标词汇',
      '自然融入关键词保持流畅',
      '控制标题在200字符以内',
      '添加情感触发词提升点击率'
    ]
  };
}

function generateFallbackDescription(productInfo: ProductInfo, isEnglishMarket: boolean) {
  const optimized = isEnglishMarket ?
    `${productInfo.description}

✅ Premium Features:
• High-quality materials and craftsmanship
• Designed specifically for ${productInfo.targetMarket.toUpperCase()} market
• Excellent value with satisfaction guarantee
• Fast shipping and responsive customer service

🎯 Perfect For: Daily use, professional applications, gifting
🔧 Quality Promise: Authentic products with warranty
📦 Service Guarantee: Quick delivery, easy returns, professional support

Experience excellence with this top-rated ${productInfo.category}!` :
    `${productInfo.description}

✅ 优质特点：
• 高品质材料和精湛工艺
• 专为${productInfo.targetMarket}市场设计
• 超值性价比，满意度保证
• 快速发货和贴心客服

🎯 适用场景：日常使用、专业应用、馈赠佳品
🔧 品质承诺：正品保障，质量无忧
📦 服务保证：快速配送，轻松退换，专业支持

立即体验这款备受好评的${productInfo.category}产品！`;

  return {
    original: productInfo.description,
    optimized,
    suggestions: isEnglishMarket ? [
      'Structure content with clear bullet points',
      'Highlight unique selling propositions',
      'Add specific use cases and scenarios',
      'Include trust signals and guarantees',
      'Use emotional language to connect with buyers'
    ] : [
      '使用清晰要点结构化内容',
      '突出独特销售主张',
      '添加具体使用场景',
      '包含信任信号和保证',
      '使用情感化语言连接买家'
    ]
  };
}

function generateFallbackKeywords(productInfo: ProductInfo, isEnglishMarket: boolean) {
  const suggested = [
    ...productInfo.keywords,
    ...(isEnglishMarket ? 
      ['premium quality', 'best seller', 'top rated', 'customer choice', 'fast shipping', 'reliable', 'professional grade', 'value pack'] :
      ['优质精选', '热销爆款', '用户好评', '精品推荐', '快速发货', '可靠品质', '专业级', '超值装']
    )
  ].slice(0, 10);

  return {
    original: productInfo.keywords,
    suggested,
    analysis: isEnglishMarket ?
      'Keywords optimized for search visibility and conversion. Mix of broad reach and specific buyer intent terms for balanced performance.' :
      '关键词已针对搜索可见度和转化进行优化。结合广泛覆盖和精准购买意图词汇，实现平衡表现。'
  };
}

// 主要优化函数 - 并行处理所有模块
async function performOptimization(productInfo: ProductInfo, controller?: ReadableStreamDefaultController): Promise<OptimizationSuggestion> {
  try {
    if (controller) {
      controller.enqueue(new TextEncoder().encode('data: {"type":"thinking","content":"🚀 启动分模块AI优化..."}\n\n'));
    }

    // 并行优化所有模块
    const [titleResult, descriptionResult, keywordsResult] = await Promise.all([
      optimizeTitle(productInfo),
      optimizeDescription(productInfo),
      optimizeKeywords(productInfo)
    ]);

    if (controller) {
      controller.enqueue(new TextEncoder().encode('data: {"type":"processing","content":"🔄 整合优化结果..."}\n\n'));
    }

    // 计算SEO分数
    const seoScore = Math.min(90, Math.max(70, 
      75 + 
      (keywordsResult.suggested.length > 8 ? 5 : 0) +
      (titleResult.optimized.length > 60 && titleResult.optimized.length < 150 ? 5 : 0) +
      (descriptionResult.optimized.length > 200 ? 5 : 0)
    ));

    const isEnglishMarket = ['us', 'uk', 'ca', 'au'].includes(productInfo.targetMarket);

    const optimization: OptimizationSuggestion = {
      title: titleResult,
      description: descriptionResult,
      keywords: keywordsResult,
      seo: {
        score: seoScore,
        improvements: isEnglishMarket ? [
          'Optimize keyword density in title and description',
          'Enhance visual appeal with structured content',
          'Add more specific product benefits',
          'Include customer trust signals',
          'Improve call-to-action effectiveness'
        ] : [
          '优化标题和描述中的关键词密度',
          '通过结构化内容增强视觉吸引力',
          '添加更多具体产品优势',
          '包含客户信任信号',
          '提升行动召唤效果'
        ]
      },
      competitive: {
        analysis: isEnglishMarket ?
          `Market analysis for ${productInfo.category}: Competitive landscape shows opportunities for differentiation through quality positioning and customer-focused messaging. Focus on unique value propositions.` :
          `${productInfo.category}市场分析：竞争格局显示通过品质定位和客户导向信息传递进行差异化的机会。重点关注独特价值主张。`,
        recommendations: isEnglishMarket ? [
          'Emphasize unique product features and quality',
          'Build strong brand presence through consistent messaging',
          'Focus on customer service excellence',
          'Monitor competitor pricing and adjust positioning',
          'Leverage positive reviews and social proof'
        ] : [
          '强调独特产品特性和品质',
          '通过一致信息传递建立强势品牌',
          '专注客户服务卓越',
          '监控竞争对手定价并调整定位',
          '利用正面评价和社会证明'
        ]
      }
    };

    return optimization;
  } catch (error) {
    console.error('优化过程出错:', error);
    throw error;
  }
}

// 处理POST请求
export async function POST(request: Request) {
  try {
    const { productInfo, stream } = await request.json();
    
    if (!productInfo) {
      return Response.json(
        { success: false, error: '缺少商品信息' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    console.log('开始分模块优化，商品:', productInfo.title);

    if (stream) {
      // 流式响应
      const encoder = new TextEncoder();
      
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const optimization = await performOptimization(productInfo, controller);
            controller.enqueue(encoder.encode(`data: {"type":"result","content":${JSON.stringify(optimization)}}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (error) {
            console.error('流式处理错误:', error);
            controller.enqueue(encoder.encode(`data: {"type":"error","content":"优化失败: ${error instanceof Error ? error.message : '未知错误'}"}\n\n`));
          } finally {
            controller.close();
          }
        }
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // 非流式响应
      try {
        const optimization = await performOptimization(productInfo);
        return Response.json({
          success: true,
          data: optimization
        } as ApiResponse<OptimizationSuggestion>);
      } catch (error) {
        console.error('优化处理错误:', error);
        return Response.json(
          { success: false, error: error instanceof Error ? error.message : '优化失败' } as ApiResponse<null>,
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('请求处理错误:', error);
    return Response.json(
      { success: false, error: '请求格式错误' } as ApiResponse<null>,
      { status: 400 }
    );
  }
}

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