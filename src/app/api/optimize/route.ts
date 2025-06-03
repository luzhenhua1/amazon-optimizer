import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, OptimizationSuggestion, ProductInfo } from '@/types';

// 生成优化建议（模拟数据）
function generateOptimizationSuggestions(productInfo: ProductInfo): OptimizationSuggestion {
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
  
  // 生成详细的优化建议
  const titleSuggestions = [
    '在标题前置核心关键词，提升搜索排名',
    '添加产品规格参数（如尺寸、材质）增强描述性',
    '使用数字和符号（如★、✓）提升视觉吸引力',
    '控制标题长度在150-200字符，避免被截断',
    '加入情感词汇（如"舒适"、"耐用"）增强感染力',
    '突出产品独特卖点和差异化特色',
    '考虑seasonal关键词和节日营销词汇'
  ];

  const descriptionSuggestions = [
    '开头30字重点突出核心卖点，抓住用户注意力',
    '使用bullet points列举产品特色，提升可读性',
    '加入使用场景描述，帮助用户建立购买联想',
    '补充技术规格和产品参数，增强专业性',
    '添加售后服务承诺，提升用户购买信心',
    '使用感官词汇描述产品体验（触感、视觉等）',
    '加入用户评价摘要和推荐理由',
    '结尾添加行动召唤，引导用户立即购买'
  ];

  const seoImprovements = [
    `提升标题关键词密度，当前评分${Math.round(seoScore * 0.25)}/25分`,
    `优化描述结构和内容完整性，当前评分${Math.round(seoScore * 0.25)}/25分`,
    `扩展关键词覆盖度，增加长尾关键词`,
    `提升整体内容质量和用户体验`,
    `优化图片ALT标签和产品变体信息`,
    `增强A+页面内容和品牌故事`,
    `改善产品类目选择和属性填写`
  ];

  const competitiveRecommendations = [
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
  const additionalKeywords = [
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
      optimized: `【${productInfo.category}】${productInfo.title.substring(0, 100)} | 高品质 ${productInfo.keywords[0]} | ${productInfo.targetMarket}热销推荐`,
      suggestions: titleSuggestions.slice(0, 6)
    },
    description: {
      original: productInfo.description,
      optimized: `🌟 【产品亮点】${productInfo.description}

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
      analysis: `关键词分析报告：
      
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
      analysis: `${productInfo.category}市场竞争深度分析：

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
    const prompt = `你是一位拥有10年经验的亚马逊店铺优化专家和SEO专家。请深入分析以下商品信息，并提供专业的优化建议。

【商品信息】
标题：${productInfo.title}
描述：${productInfo.description}
现有关键词：${productInfo.keywords.join(', ')}
商品分类：${productInfo.category}
目标市场：${productInfo.targetMarket}
价格：$${productInfo.price || 'N/A'}
当前评分：${productInfo.rating || 'N/A'}/5

【分析要求】
请按以下步骤进行深度分析：

1. 【标题优化分析】
- 分析当前标题的优缺点
- 识别缺失的重要关键词
- 考虑Amazon算法偏好（A9算法）
- 重写一个更优的标题（控制在200字符内）
- 提供5-8个具体的优化建议

2. 【描述优化分析】
- 分析当前描述的结构和内容
- 识别缺失的卖点和特性
- 考虑用户购买决策因素
- 重写描述，包含：产品核心卖点、使用场景、规格参数、服务承诺
- 提供5-8个描述改进建议

3. 【关键词策略分析】
- 分析当前关键词的搜索价值
- 研究该品类的高价值关键词
- 识别长尾关键词机会
- 推荐15-20个高质量关键词
- 提供关键词布局策略

4. 【SEO评分评估】
基于以下标准给出真实评分（1-100分）：
- 标题关键词密度和相关性（25分）
- 描述质量和完整性（25分）
- 关键词策略和覆盖度（25分）
- 整体内容质量和用户体验（25分）
评分要严格按照实际情况，优秀产品通常在75-90分之间

5. 【竞争分析】
- 分析该品类的竞争程度
- 识别差异化机会
- 提供市场定位建议
- 给出5-8个具体的竞争策略

【输出格式要求】
请严格按照以下JSON格式输出，确保内容详实专业：

{
  "title": {
    "original": "原始标题",
    "optimized": "优化后的标题",
    "suggestions": ["建议1", "建议2", "建议3", "建议4", "建议5"]
  },
  "description": {
    "original": "原始描述",
    "optimized": "优化后的描述（包含特色、卖点、规格等）",
    "suggestions": ["建议1", "建议2", "建议3", "建议4", "建议5"]
  },
  "keywords": {
    "original": ["现有关键词"],
    "suggested": ["推荐关键词1", "推荐关键词2", ...],
    "analysis": "详细的关键词分析和策略说明"
  },
  "seo": {
    "score": 实际评分数字,
    "improvements": ["改进建议1", "改进建议2", "改进建议3", "改进建议4", "改进建议5"]
  },
  "competitive": {
    "analysis": "详细的竞争环境分析",
    "recommendations": ["策略1", "策略2", "策略3", "策略4", "策略5"]
  }
}

请确保你的分析是基于真实的电商和SEO经验，提供的建议要具体可执行，评分要客观准确。`;

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
    const prompt = `作为专业的亚马逊店铺优化专家，请为以下商品提供全面的优化建议：

商品信息：
- 标题：${productInfo.title}
- 描述：${productInfo.description}
- 关键词：${productInfo.keywords.join(', ')}
- 分类：${productInfo.category}
- 目标市场：${productInfo.targetMarket}

请提供详细的优化建议，包括：

1. 标题优化：
   - 重写一个更有吸引力的标题
   - 提供3-5个具体的优化建议

2. 描述优化：
   - 重写商品描述，使其更具销售力
   - 提供3-5个改进建议

3. 关键词优化：
   - 推荐10-15个相关关键词
   - 分析当前关键词的优缺点

4. SEO评分和改进建议：
   - 给出1-100的SEO评分
   - 提供5-6个具体的SEO改进建议

5. 竞品分析：
   - 分析该品类的市场竞争情况
   - 提供5-6个竞争策略建议

请以JSON格式返回，确保格式正确且包含所有必要字段。`;

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