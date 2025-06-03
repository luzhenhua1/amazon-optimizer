import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, OptimizationSuggestion, ProductInfo } from '@/types';

// 模拟AI优化函数
async function generateOptimizationSuggestions(productInfo: ProductInfo): Promise<OptimizationSuggestion> {
  // 模拟AI处理时间
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

  // 模拟AI生成的优化建议
  const optimization: OptimizationSuggestion = {
    title: {
      original: productInfo.title,
      optimized: `【优化版】${productInfo.title} - 专业品质 高性价比 快速配送`,
      suggestions: [
        '在标题前增加情感词汇"优化版"来吸引注意',
        '添加"专业品质"突出产品质量',
        '加入"高性价比"强调价值主张',
        '包含"快速配送"提升购买意愿',
        '控制标题长度在200字符以内，符合Amazon要求'
      ]
    },
    description: {
      original: productInfo.description,
      optimized: `🔥 ${productInfo.title} - 您的最佳选择！

✅ 产品特色：
• 专业级品质保证
• 人性化设计，操作简便
• 高性价比，物超所值
• 严格质量控制，持久耐用

✅ 为什么选择我们：
• 快速发货，1-2个工作日内处理
• 专业客服团队，7*24小时在线
• 30天无理由退换货保障
• 真实用户好评率98%+

✅ 适用场景：
适合${productInfo.category}爱好者，无论是家庭使用还是专业需求，都能满足您的期待。

🎯 立即购买，享受优质购物体验！`,
      suggestions: [
        '使用emoji符号增加视觉吸引力',
        '采用结构化布局，提高可读性',
        '突出产品核心卖点和竞争优势',
        '加入服务承诺增强信任感',
        '包含使用场景帮助客户想象',
        '以行动召唤结尾促进转化'
      ]
    },
    keywords: {
      original: productInfo.keywords,
      suggested: [
        ...productInfo.keywords,
        '高品质',
        '性价比',
        '专业级',
        '耐用',
        '易用',
        '快速配送',
        '售后保障',
        productInfo.category,
        productInfo.targetMarket + '市场',
        '推荐',
        '热销',
        '新品'
      ],
      analysis: `关键词分析：当前关键词覆盖了基础搜索需求，建议增加情感词汇（如"高品质"、"性价比"）和功能词汇（如"专业级"、"耐用"）来提升搜索匹配度。同时加入市场定位词（如"${productInfo.targetMarket}市场"）和促销词（如"热销"、"推荐"）可以增加曝光机会。建议总关键词数量控制在15-20个，确保与产品高度相关。`
    },
    seo: {
      score: 75,
      improvements: [
        '优化标题长度，确保在搜索结果中完整显示',
        '增加长尾关键词覆盖更多搜索意图',
        '在描述中自然植入2-3个核心关键词',
        '添加产品规格和技术参数提升专业度',
        '包含品牌相关信息增强权威性',
        '使用结构化数据标记提升搜索可见性'
      ]
    },
    competitive: {
      analysis: `${productInfo.category}类目在${productInfo.targetMarket}市场竞争激烈，主要竞争点集中在价格、质量和服务上。用户关注点包括产品耐用性、使用便利性、性价比和售后服务。当前市场趋势显示消费者越来越重视产品质量和品牌信任度。`,
      recommendations: [
        '强调产品的独特价值主张，突出与竞品的差异化',
        '增加客户评价和使用案例，建立社会证明',
        '优化价格策略，确保在同类产品中具有竞争力',
        '提供详细的产品保障和售后服务信息',
        '定期监控竞品动态，及时调整营销策略',
        '建立品牌故事，增强客户情感连接'
      ]
    }
  };

  return optimization;
}

// 硅基流动AI API调用函数 - 支持流式响应
async function callSiliconFlowAPIWithStream(productInfo: ProductInfo, writer: WritableStreamDefaultWriter) {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  
  if (!apiKey) {
    await writer.write(new TextEncoder().encode('data: {"type":"error","content":"未配置SILICONFLOW_API_KEY，使用模拟数据"}\n\n'));
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

    await writer.write(new TextEncoder().encode('data: {"type":"thinking","content":"🤔 开始分析商品信息..."}\n\n'));

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
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      await writer.write(new TextEncoder().encode(`data: {"type":"error","content":"API调用失败: ${response.status}"}\n\n`));
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
              await writer.write(new TextEncoder().encode(`data: {"type":"content","content":"${delta.content.replace(/"/g, '\\"')}"}\n\n`));
            }

            if (delta?.reasoning_content) {
              reasoningContent += delta.reasoning_content;
              await writer.write(new TextEncoder().encode(`data: {"type":"thinking","content":"${delta.reasoning_content.replace(/"/g, '\\"')}"}\n\n`));
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    await writer.write(new TextEncoder().encode('data: {"type":"processing","content":"🔄 正在整理优化建议..."}\n\n'));

    // 处理完整的响应内容
    try {
      const cleanContent = fullContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const aiResult = JSON.parse(cleanContent);
      
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

      await writer.write(new TextEncoder().encode(`data: {"type":"result","content":${JSON.stringify(optimization)}}\n\n`));
      return optimization;

    } catch (parseError) {
      console.warn('AI返回格式解析失败，使用模拟数据:', parseError);
      await writer.write(new TextEncoder().encode('data: {"type":"warning","content":"AI响应格式有误，使用备用方案"}\n\n'));
      const fallback = await generateOptimizationSuggestions(productInfo);
      await writer.write(new TextEncoder().encode(`data: {"type":"result","content":${JSON.stringify(fallback)}}\n\n`));
      return fallback;
    }

  } catch (error) {
    console.error('SiliconFlow API调用失败:', error);
    await writer.write(new TextEncoder().encode('data: {"type":"error","content":"API调用失败，使用备用方案"}\n\n'));
    const fallback = await generateOptimizationSuggestions(productInfo);
    await writer.write(new TextEncoder().encode(`data: {"type":"result","content":${JSON.stringify(fallback)}}\n\n`));
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productInfo, stream } = body;

    // 验证输入
    if (!productInfo) {
      return NextResponse.json({
        success: false,
        error: '缺少商品信息'
      } as ApiResponse<null>, { status: 400 });
    }

    // 验证必要字段
    if (!productInfo.title || !productInfo.description) {
      return NextResponse.json({
        success: false,
        error: '商品标题和描述不能为空'
      } as ApiResponse<null>, { status: 400 });
    }

    // 如果请求流式响应
    if (stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const writer = controller;
          try {
            await callSiliconFlowAPIWithStream(productInfo, {
              write: async (chunk: Uint8Array) => {
                controller.enqueue(chunk);
              }
            } as any);
          } catch (error) {
            console.error('流式处理错误:', error);
            controller.enqueue(encoder.encode(`data: {"type":"error","content":"处理失败"}\n\n`));
          } finally {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 非流式响应
    try {
      // 调用硅基流动AI生成优化建议
      const suggestions = await callSiliconFlowAPI(productInfo);

      return NextResponse.json({
        success: true,
        data: suggestions,
        message: '优化建议生成成功'
      } as ApiResponse<OptimizationSuggestion>);

    } catch (optimizeError) {
      console.error('优化生成错误:', optimizeError);
      
      return NextResponse.json({
        success: false,
        error: '优化建议生成失败，请稍后重试'
      } as ApiResponse<null>, { status: 500 });
    }

  } catch (error) {
    console.error('API错误:', error);
    
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    } as ApiResponse<null>, { status: 500 });
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