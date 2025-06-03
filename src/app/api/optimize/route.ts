import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, OptimizationSuggestion, ProductInfo } from '@/types';

// 生成优化建议（模拟数据）
function generateOptimizationSuggestions(productInfo: ProductInfo): OptimizationSuggestion {
  // 判断是否为英文市场
  const isEnglishMarket = ['us', 'uk', 'ca', 'au'].includes(productInfo.targetMarket);
  
  // 更真实的SEO评分计算
  let seoScore = 60; // 基础分数
  
  // 标题质量评估
  const titleLength = productInfo.title.length;
  if (titleLength >= 60 && titleLength <= 200) seoScore += 10;
  if (productInfo.title.includes(productInfo.keywords[0])) seoScore += 8;
  if (productInfo.title.match(/[0-9]/)) seoScore += 5; // 包含数字
  
  // 描述质量评估
  if (productInfo.description.length > 100) seoScore += 8;
  if (productInfo.description.includes('特色') || productInfo.description.includes('优势')) seoScore += 5;
  
  // 关键词覆盖度评估
  if (productInfo.keywords.length >= 3) seoScore += 5;
  if (productInfo.keywords.length >= 5) seoScore += 3;
  
  // 确保分数在合理范围内
  seoScore = Math.min(Math.max(seoScore, 45), 88);
  
  // 根据市场生成不同语言的建议
  const titleSuggestions = isEnglishMarket ? [
    'Place core keywords at the beginning of title for better search ranking',
    'Add product specifications (size, material) to enhance description',
    'Use numbers and symbols (★, ✓) to improve visual appeal',
    'Keep title length between 150-200 characters to avoid truncation',
    'Include emotional words like "comfortable" or "durable"',
    'Highlight unique selling points and differentiating features',
    'Consider seasonal keywords and holiday marketing terms'
  ] : [
    '在标题前置核心关键词，提升搜索排名',
    '添加产品规格参数（如尺寸、材质）增强描述性',
    '使用数字和符号（如★、✓）提升视觉吸引力',
    '控制标题长度在150-200字符，避免被截断',
    '加入情感词汇（如"舒适"、"耐用"）增强感染力',
    '突出产品独特卖点和差异化特色',
    '考虑seasonal关键词和节日营销词汇'
  ];

  const descriptionSuggestions = isEnglishMarket ? [
    'Start with core selling points in first 30 words to grab attention',
    'Use bullet points to list product features for better readability',
    'Add usage scenarios to help customers visualize product use',
    'Include technical specifications and product parameters',
    'Add after-sales service commitments to build customer confidence',
    'Use sensory words to describe product experience (touch, visual)',
    'Include customer review highlights and recommendations',
    'End with call-to-action to encourage immediate purchase'
  ] : [
    '开头30字重点突出核心卖点，抓住用户注意力',
    '使用bullet points列举产品特色，提升可读性',
    '加入使用场景描述，帮助用户建立购买联想',
    '补充技术规格和产品参数，增强专业性',
    '添加售后服务承诺，提升用户购买信心',
    '使用感官词汇描述产品体验（触感、视觉等）',
    '加入用户评价摘要和推荐理由',
    '结尾添加行动召唤，引导用户立即购买'
  ];

  const seoImprovements = isEnglishMarket ? [
    `Improve title keyword density, current score ${Math.round(seoScore * 0.25)}/25`,
    `Optimize description structure and content completeness, current score ${Math.round(seoScore * 0.25)}/25`,
    `Expand keyword coverage with long-tail keywords`,
    `Enhance overall content quality and user experience`,
    `Optimize image ALT tags and product variant information`,
    `Strengthen A+ content and brand storytelling`,
    `Improve product category selection and attribute filling`
  ] : [
    `提升标题关键词密度，当前评分${Math.round(seoScore * 0.25)}/25分`,
    `优化描述结构和内容完整性，当前评分${Math.round(seoScore * 0.25)}/25分`,
    `扩展关键词覆盖度，增加长尾关键词`,
    `提升整体内容质量和用户体验`,
    `优化图片ALT标签和产品变体信息`,
    `增强A+页面内容和品牌故事`,
    `改善产品类目选择和属性填写`
  ];

  const competitiveRecommendations = isEnglishMarket ? [
    `Implement differentiation strategy in ${productInfo.category} category`,
    'Highlight competitive advantages through pricing and value proposition',
    'Strengthen product quality certifications and authority endorsements',
    'Optimize product packaging and unboxing experience',
    'Build brand story and emotional connections',
    'Provide superior customer service and after-sales support',
    'Leverage social media and influencer marketing for brand awareness',
    'Continuously collect user feedback for rapid product iteration'
  ] : [
    `在${productInfo.category}类目中实施差异化定位策略`,
    '通过价格优势和性价比突出竞争力',
    '加强产品质量认证和权威背书',
    '优化产品包装和用户开箱体验',
    '建立品牌故事和情感连接',
    '提供更优质的客户服务和售后支持',
    '利用社交媒体和KOL推广提升品牌知名度',
    '持续收集用户反馈，快速迭代产品'
  ];

  // 生成更多相关关键词
  const additionalKeywords = isEnglishMarket ? [
    ...productInfo.keywords,
    `${productInfo.category} recommended`,
    'high quality',
    'best value',
    'customer favorite',
    'fast shipping',
    'warranty included',
    `${productInfo.targetMarket} bestseller`,
    'limited time offer',
    'new arrival'
  ].slice(0, 15) : [
    ...productInfo.keywords,
    `${productInfo.category}推荐`,
    '高品质',
    '性价比',
    '用户好评',
    '快速发货',
    '售后保障',
    `${productInfo.targetMarket}热销`,
    '限时优惠',
    '新品上市'
  ].slice(0, 15);

  return {
    title: {
      original: productInfo.title,
      optimized: isEnglishMarket 
        ? `${productInfo.title} | Premium Quality ${productInfo.category} | Fast Shipping | Customer Favorite`
        : `【${productInfo.category}】${productInfo.title.substring(0, 100)} | 高品质 ${productInfo.keywords[0]} | ${productInfo.targetMarket}热销推荐`,
      suggestions: titleSuggestions.slice(0, 6)
    },
    description: {
      original: productInfo.description,
      optimized: isEnglishMarket 
        ? `${productInfo.description}

✅ Why Choose This Product:
• Premium quality materials and construction
• User-friendly design for optimal performance
• Excellent value with positive customer reviews
• Fast shipping and reliable customer service

🎯 Perfect For: Daily use, professional applications, gift giving
🔧 Specifications: Please refer to detailed product description
💎 Quality Guarantee: Authentic products, satisfaction guaranteed

Order now and experience the superior quality of this ${productInfo.category}!`
        : `🌟 【产品亮点】${productInfo.description}

✅ 核心特色：
• 专业${productInfo.category}，品质保证
• 适用于${productInfo.targetMarket}市场需求
• 严格质量控制，用户好评如潮

📦 服务承诺：
• 快速发货，专业包装
• 7天无理由退换货
• 专业客服团队，及时响应

🎯 使用场景：日常使用、专业应用、礼品赠送
🔧 产品规格：详细参数请参考产品描述
💎 品牌保证：正品授权，假一赔十

立即购买，享受优质${productInfo.category}带来的卓越体验！`,
      suggestions: descriptionSuggestions.slice(0, 7)
    },
    keywords: {
      original: productInfo.keywords,
      suggested: additionalKeywords,
      analysis: isEnglishMarket 
        ? `Keyword Analysis Report:
        
🔍 Current keyword coverage analysis:
• Primary keyword: ${productInfo.keywords[0]} (high search volume)
• Related terms: ${productInfo.keywords.slice(1, 3).join(', ')}
• Long-tail opportunities: Found potential in ${productInfo.category} related long-tail keywords

📈 Optimization strategy recommendations:
• Focus areas: ${productInfo.category} core vocabulary
• Expansion directions: functional, scenario-based, emotional keywords
• Competition strategy: Avoid high-competition terms, focus on medium and long-tail keywords

🎯 Expected results: Keyword optimization expected to increase search exposure by 30-50%`
        : `关键词分析报告：
      
🔍 当前关键词覆盖分析：
• 主关键词：${productInfo.keywords[0]}（搜索热度高）
• 相关词汇：${productInfo.keywords.slice(1, 3).join('、')}
• 长尾机会：发现${productInfo.category}相关长尾词潜力

📈 优化策略建议：
• 重点布局：${productInfo.category}核心词汇
• 拓展方向：功能性、场景性、情感性关键词
• 竞争策略：避开高竞争词，重点攻击中长尾词

🎯 预期效果：关键词优化后预计提升搜索曝光30-50%`
    },
    seo: {
      score: seoScore,
      improvements: seoImprovements
    },
    competitive: {
      analysis: isEnglishMarket 
        ? `${productInfo.category} Market Competition Analysis:

🏪 Market Overview:
• Competition Level: Moderate to intense
• Major Players: Established brands dominate top positions
• Price Range: $${Math.max(10, (productInfo.price || 50) * 0.7)}-$${(productInfo.price || 50) * 1.5}
• Customer Needs: Focus on quality, value, and service

⚡ Opportunity Identification:
• Mid-tier market has breakthrough potential
• Growing demand for innovative features
• Personalized customization services underdeveloped
• Sustainable eco-friendly concepts gaining attention

🎯 Threat Analysis:
• Price competition pressure from major brands
• New brand influx intensifying competition
• Rapidly changing customer demands`
        : `${productInfo.category}市场竞争深度分析：

🏪 市场现状：
• 竞争程度：中等偏激烈
• 主要玩家：知名品牌占据头部位置
• 价格区间：$${Math.max(10, (productInfo.price || 50) * 0.7)}-$${(productInfo.price || 50) * 1.5}
• 用户需求：注重品质、性价比和服务

⚡ 机会识别：
• 中端市场存在突破机会
• 用户对创新功能需求增长
• 个性化定制服务有待开发
• 可持续环保概念受到关注

🎯 威胁分析：
• 大品牌价格战压力
• 新品牌涌入加剧竞争
• 用户需求快速变化`,
      recommendations: competitiveRecommendations
    }
  };
}

// 硅基流动AI API调用函数 - 支持流式响应
async function callSiliconFlowAPIWithStream(productInfo: ProductInfo, controller: ReadableStreamDefaultController) {
  const apiKey = process.env.SILICON_FLOW_API_KEY;
  
  if (!apiKey) {
    controller.enqueue(new TextEncoder().encode('data: {"type":"error","content":"未配置SILICONFLOW_API_KEY，使用模拟数据"}\n\n'));
    return generateOptimizationSuggestions(productInfo);
  }

  try {
    const prompt = `You are a professional Amazon store optimization expert and SEO specialist with 10 years of experience. Please analyze the following product information and provide professional optimization suggestions.

【Product Information】
Title: ${productInfo.title}
Description: ${productInfo.description}
Current Keywords: ${productInfo.keywords.join(', ')}
Product Category: ${productInfo.category}
Target Market: ${productInfo.targetMarket}
Price: $${productInfo.price || 'N/A'}
Current Rating: ${productInfo.rating || 'N/A'}/5

【Target Market Context】
Target Market: ${productInfo.targetMarket.toUpperCase()}
Language Requirement: ${['us', 'uk', 'ca', 'au'].includes(productInfo.targetMarket) ? 'English only - NO Chinese characters or phrases' : 'Chinese preferred'}
Market Characteristics: ${productInfo.targetMarket === 'us' ? 'US market - focus on convenience, value, and quality' : 
                         productInfo.targetMarket === 'uk' ? 'UK market - emphasize quality, reliability, and service' :
                         productInfo.targetMarket === 'ca' ? 'Canadian market - highlight durability, value, and customer service' :
                         productInfo.targetMarket === 'au' ? 'Australian market - focus on quality, practicality, and fast shipping' :
                         productInfo.targetMarket === 'de' ? 'German market - emphasize engineering quality, precision, and efficiency' :
                         productInfo.targetMarket === 'fr' ? 'French market - highlight elegance, quality, and user experience' :
                         productInfo.targetMarket === 'jp' ? 'Japanese market - focus on precision, quality, and attention to detail' :
                         'International market - focus on universal appeal and quality'}

【Analysis Requirements】
Please conduct in-depth analysis following these steps:

1. 【Title Optimization Analysis】
- Analyze current title strengths and weaknesses
- Identify missing important keywords
- Consider Amazon A9 algorithm preferences
- Rewrite an optimized title (keep under 200 characters)
- Provide 5-8 specific optimization suggestions
- IMPORTANT: For English markets (US, UK, CA, AU), use ONLY English. NO Chinese characters.

2. 【Description Optimization Analysis】
- Analyze current description structure and content
- Identify missing selling points and features
- Consider customer purchase decision factors
- Rewrite description including: core selling points, usage scenarios, specifications, service commitments
- Provide 5-8 description improvement suggestions
- IMPORTANT: Match the language to the target market

3. 【Keyword Strategy Analysis】
- Analyze current keywords' search value
- Research high-value keywords for this category
- Identify long-tail keyword opportunities
- Recommend 15-20 high-quality keywords
- Provide keyword placement strategy
- IMPORTANT: Keywords must match target market language

4. 【SEO Score Assessment】
Rate based on these criteria (1-100 points):
- Title keyword density and relevance (25 points)
- Description quality and completeness (25 points)
- Keyword strategy and coverage (25 points)
- Overall content quality and user experience (25 points)
Rate strictly based on actual conditions, excellent products typically score 75-90

5. 【Competitive Analysis】
- Analyze competition level in this category
- Identify differentiation opportunities
- Provide market positioning suggestions
- Give 5-8 specific competitive strategies

【Output Format Requirements】
Please output strictly in the following JSON format, ensuring content is detailed and professional:

{
  "title": {
    "original": "Original title",
    "optimized": "Optimized title (matching target market language)",
    "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"]
  },
  "description": {
    "original": "Original description",
    "optimized": "Optimized description (including features, selling points, specifications, etc.)",
    "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"]
  },
  "keywords": {
    "original": ["Current keywords"],
    "suggested": ["Recommended keyword 1", "Recommended keyword 2", ...],
    "analysis": "Detailed keyword analysis and strategy explanation"
  },
  "seo": {
    "score": actual_score_number,
    "improvements": ["Improvement 1", "Improvement 2", "Improvement 3", "Improvement 4", "Improvement 5"]
  },
  "competitive": {
    "analysis": "Detailed competitive environment analysis",
    "recommendations": ["Strategy 1", "Strategy 2", "Strategy 3", "Strategy 4", "Strategy 5"]
  }
}

CRITICAL REQUIREMENTS:
- For English markets (US, UK, CA, AU): Use ONLY English in ALL fields
- For non-English markets: Use appropriate local language
- Ensure all suggestions are specific and actionable
- Provide objective and accurate scoring
- Base analysis on real e-commerce and SEO experience`;

    controller.enqueue(new TextEncoder().encode('data: {"type":"thinking","content":"🔍 开始深度分析商品信息..."}\n\n'));

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-R1',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 8000, // 增加token限制
        temperature: 0.3, // 降低随机性，增加一致性
        top_p: 0.9,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      controller.enqueue(new TextEncoder().encode(`data: {"type":"error","content":"API调用失败: ${response.status}"}\n\n`));
      throw new Error(`SiliconFlow API error: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let reasoningContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0]?.delta;
            
            if (delta?.content) {
              fullContent += delta.content;
              controller.enqueue(new TextEncoder().encode(`data: {"type":"content","content":"${delta.content.replace(/"/g, '\\"')}"}\n\n`));
            }

            if (delta?.reasoning_content) {
              reasoningContent += delta.reasoning_content;
              controller.enqueue(new TextEncoder().encode(`data: {"type":"thinking","content":"${delta.reasoning_content.replace(/"/g, '\\"')}"}\n\n`));
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    controller.enqueue(new TextEncoder().encode('data: {"type":"processing","content":"🔄 正在整理优化建议..."}\n\n'));

    // 处理完整的响应内容
    try {
      const cleanContent = fullContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const aiResult = JSON.parse(cleanContent);
      
      const optimization: OptimizationSuggestion = {
        title: {
          original: productInfo.title,
          optimized: aiResult.title?.optimized || `【优化版】${productInfo.title}`,
          suggestions: aiResult.title?.suggestions || [
            'AI生成的标题优化建议',
            '提升关键词密度',
            '增强吸引力表达'
          ]
        },
        description: {
          original: productInfo.description,
          optimized: aiResult.description?.optimized || `优化版描述：${productInfo.description}`,
          suggestions: aiResult.description?.suggestions || [
            'AI生成的描述优化建议',
            '突出产品卖点',
            '增加行动召唤'
          ]
        },
        keywords: {
          original: productInfo.keywords,
          suggested: aiResult.keywords?.suggested || [...productInfo.keywords, '高品质', '性价比'],
          analysis: aiResult.keywords?.analysis || '关键词分析：当前关键词覆盖基础需求，建议增加长尾关键词。'
        },
        seo: {
          score: aiResult.seo?.score || 75,
          improvements: aiResult.seo?.improvements || [
            '优化标题长度',
            '增加关键词密度',
            '改善用户体验'
          ]
        },
        competitive: {
          analysis: aiResult.competitive?.analysis || `${productInfo.category}市场竞争分析`,
          recommendations: aiResult.competitive?.recommendations || [
            '差异化定位',
            '价格优化',
            '服务提升'
          ]
        }
      };

      controller.enqueue(new TextEncoder().encode(`data: {"type":"result","content":${JSON.stringify(optimization)}}\n\n`));
      return optimization;

    } catch (parseError) {
      console.warn('AI返回格式解析失败，使用模拟数据:', parseError);
      controller.enqueue(new TextEncoder().encode('data: {"type":"warning","content":"AI响应格式有误，使用备用方案"}\n\n'));
      const fallback = generateOptimizationSuggestions(productInfo);
      controller.enqueue(new TextEncoder().encode(`data: {"type":"result","content":${JSON.stringify(fallback)}}\n\n`));
      return fallback;
    }

  } catch (error) {
    console.error('SiliconFlow API调用失败:', error);
    controller.enqueue(new TextEncoder().encode('data: {"type":"error","content":"API调用失败，使用备用方案"}\n\n'));
    const fallback = generateOptimizationSuggestions(productInfo);
    controller.enqueue(new TextEncoder().encode(`data: {"type":"result","content":${JSON.stringify(fallback)}}\n\n`));
    return fallback;
  }
}

// 硅基流动AI API调用函数 - 非流式版本
async function callSiliconFlowAPI(productInfo: ProductInfo): Promise<OptimizationSuggestion> {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  
  if (!apiKey) {
    console.warn('未配置SILICONFLOW_API_KEY，使用模拟数据');
    return generateOptimizationSuggestions(productInfo);
  }

  try {
    const prompt = `You are a professional Amazon store optimization expert and SEO specialist with 10 years of experience. Please analyze the following product information and provide professional optimization suggestions.

【Product Information】
Title: ${productInfo.title}
Description: ${productInfo.description}
Current Keywords: ${productInfo.keywords.join(', ')}
Product Category: ${productInfo.category}
Target Market: ${productInfo.targetMarket}
Price: $${productInfo.price || 'N/A'}
Current Rating: ${productInfo.rating || 'N/A'}/5

【Target Market Context】
Target Market: ${productInfo.targetMarket.toUpperCase()}
Language Requirement: ${['us', 'uk', 'ca', 'au'].includes(productInfo.targetMarket) ? 'English only - NO Chinese characters or phrases' : 'Chinese preferred'}
Market Characteristics: ${productInfo.targetMarket === 'us' ? 'US market - focus on convenience, value, and quality' : 
                         productInfo.targetMarket === 'uk' ? 'UK market - emphasize quality, reliability, and service' :
                         productInfo.targetMarket === 'ca' ? 'Canadian market - highlight durability, value, and customer service' :
                         productInfo.targetMarket === 'au' ? 'Australian market - focus on quality, practicality, and fast shipping' :
                         productInfo.targetMarket === 'de' ? 'German market - emphasize engineering quality, precision, and efficiency' :
                         productInfo.targetMarket === 'fr' ? 'French market - highlight elegance, quality, and user experience' :
                         productInfo.targetMarket === 'jp' ? 'Japanese market - focus on precision, quality, and attention to detail' :
                         'International market - focus on universal appeal and quality'}

【Analysis Requirements】
Please conduct in-depth analysis following these steps:

1. 【Title Optimization Analysis】
- Analyze current title strengths and weaknesses
- Identify missing important keywords
- Consider Amazon A9 algorithm preferences
- Rewrite an optimized title (keep under 200 characters)
- Provide 5-8 specific optimization suggestions
- IMPORTANT: For English markets (US, UK, CA, AU), use ONLY English. NO Chinese characters.

2. 【Description Optimization Analysis】
- Analyze current description structure and content
- Identify missing selling points and features
- Consider customer purchase decision factors
- Rewrite description including: core selling points, usage scenarios, specifications, service commitments
- Provide 5-8 description improvement suggestions
- IMPORTANT: Match the language to the target market

3. 【Keyword Strategy Analysis】
- Analyze current keywords' search value
- Research high-value keywords for this category
- Identify long-tail keyword opportunities
- Recommend 15-20 high-quality keywords
- Provide keyword placement strategy
- IMPORTANT: Keywords must match target market language

4. 【SEO Score Assessment】
Rate based on these criteria (1-100 points):
- Title keyword density and relevance (25 points)
- Description quality and completeness (25 points)
- Keyword strategy and coverage (25 points)
- Overall content quality and user experience (25 points)
Rate strictly based on actual conditions, excellent products typically score 75-90

5. 【Competitive Analysis】
- Analyze competition level in this category
- Identify differentiation opportunities
- Provide market positioning suggestions
- Give 5-8 specific competitive strategies

【Output Format Requirements】
Please output strictly in the following JSON format, ensuring content is detailed and professional:

{
  "title": {
    "original": "Original title",
    "optimized": "Optimized title (matching target market language)",
    "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"]
  },
  "description": {
    "original": "Original description",
    "optimized": "Optimized description (including features, selling points, specifications, etc.)",
    "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"]
  },
  "keywords": {
    "original": ["Current keywords"],
    "suggested": ["Recommended keyword 1", "Recommended keyword 2", ...],
    "analysis": "Detailed keyword analysis and strategy explanation"
  },
  "seo": {
    "score": actual_score_number,
    "improvements": ["Improvement 1", "Improvement 2", "Improvement 3", "Improvement 4", "Improvement 5"]
  },
  "competitive": {
    "analysis": "Detailed competitive environment analysis",
    "recommendations": ["Strategy 1", "Strategy 2", "Strategy 3", "Strategy 4", "Strategy 5"]
  }
}

CRITICAL REQUIREMENTS:
- For English markets (US, UK, CA, AU): Use ONLY English in ALL fields
- For non-English markets: Use appropriate local language
- Ensure all suggestions are specific and actionable
- Provide objective and accurate scoring
- Base analysis on real e-commerce and SEO experience`;

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-R1',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SiliconFlow API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const reasoning = data.choices[0]?.message?.reasoning_content;
    
    if (!content) {
      throw new Error('AI响应为空');
    }

    console.log('AI原始响应:', content);
    if (reasoning) {
      console.log('AI思考过程:', reasoning);
    }

    // 尝试解析AI返回的JSON
    try {
      // 清理响应内容，移除可能的markdown标记
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const aiResult = JSON.parse(cleanContent);
      
      // 验证返回的数据结构并转换为我们需要的格式
      const optimization: OptimizationSuggestion = {
        title: {
          original: productInfo.title,
          optimized: aiResult.title?.optimized || aiResult.optimized_title || `【优化版】${productInfo.title}`,
          suggestions: aiResult.title?.suggestions || aiResult.title_suggestions || [
            'AI生成的标题优化建议',
            '提升关键词密度',
            '增强吸引力表达'
          ]
        },
        description: {
          original: productInfo.description,
          optimized: aiResult.description?.optimized || aiResult.optimized_description || `优化版描述：${productInfo.description}`,
          suggestions: aiResult.description?.suggestions || aiResult.description_suggestions || [
            'AI生成的描述优化建议',
            '突出产品卖点',
            '增加行动召唤'
          ]
        },
        keywords: {
          original: productInfo.keywords,
          suggested: aiResult.keywords?.suggested || aiResult.suggested_keywords || [...productInfo.keywords, '高品质', '性价比'],
          analysis: aiResult.keywords?.analysis || aiResult.keyword_analysis || '关键词分析：当前关键词覆盖基础需求，建议增加长尾关键词。'
        },
        seo: {
          score: aiResult.seo?.score || aiResult.seo_score || 75,
          improvements: aiResult.seo?.improvements || aiResult.seo_improvements || [
            '优化标题长度',
            '增加关键词密度',
            '改善用户体验'
          ]
        },
        competitive: {
          analysis: aiResult.competitive?.analysis || aiResult.market_analysis || `${productInfo.category}市场竞争分析`,
          recommendations: aiResult.competitive?.recommendations || aiResult.competitive_recommendations || [
            '差异化定位',
            '价格优化',
            '服务提升'
          ]
        }
      };

      return optimization;

    } catch (parseError) {
      console.warn('AI返回格式解析失败，使用模拟数据:', parseError);
      console.log('原始AI响应:', content);
      return generateOptimizationSuggestions(productInfo);
    }

  } catch (error) {
    console.error('SiliconFlow API调用失败:', error);
    // 回退到模拟数据
    return generateOptimizationSuggestions(productInfo);
  }
}

// 处理POST请求 - 支持流式响应
export async function POST(request: Request) {
  try {
    const { productInfo, stream } = await request.json();
    
    if (!productInfo) {
      return Response.json(
        { success: false, error: '缺少商品信息' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    console.log('收到优化请求，商品:', productInfo.title);

    if (stream) {
      // 流式响应
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            await callSiliconFlowAPIWithStream(productInfo, controller);
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (error) {
            console.error('流式处理错误:', error);
            controller.enqueue(encoder.encode(`data: {"type":"error","content":"处理失败: ${error instanceof Error ? error.message : '未知错误'}"}\n\n`));
          } finally {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // 非流式响应（兼容性）
      try {
        const optimization = generateOptimizationSuggestions(productInfo);
        return Response.json({
          success: true,
          data: optimization
        } as ApiResponse<OptimizationSuggestion>);
      } catch (error) {
        console.error('优化处理错误:', error);
        return Response.json(
          { success: false, error: '优化失败' } as ApiResponse<null>,
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