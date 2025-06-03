import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, OptimizationSuggestion, ProductInfo } from '@/types';

// 硅基流动AI API调用函数 - 支持流式响应
async function callSiliconFlowAPIWithStream(productInfo: ProductInfo, controller: ReadableStreamDefaultController) {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  
  if (!apiKey) {
    controller.enqueue(new TextEncoder().encode('data: {"type":"error","content":"未配置SILICONFLOW_API_KEY，请联系管理员配置AI服务"}\n\n'));
    throw new Error('未配置SILICONFLOW_API_KEY');
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
        max_tokens: 8000,
        temperature: 0.3,
        top_p: 0.9,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      controller.enqueue(new TextEncoder().encode(`data: {"type":"error","content":"AI服务调用失败: ${response.status} - ${errorText}"}\n\n`));
      throw new Error(`SiliconFlow API error: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

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
    const cleanContent = fullContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    if (!cleanContent) {
      controller.enqueue(new TextEncoder().encode('data: {"type":"error","content":"AI返回内容为空"}\n\n'));
      throw new Error('AI返回内容为空');
    }

    try {
      const aiResult = JSON.parse(cleanContent);
      
      const optimization: OptimizationSuggestion = {
        title: {
          original: productInfo.title,
          optimized: aiResult.title?.optimized || '',
          suggestions: aiResult.title?.suggestions || []
        },
        description: {
          original: productInfo.description,
          optimized: aiResult.description?.optimized || '',
          suggestions: aiResult.description?.suggestions || []
        },
        keywords: {
          original: productInfo.keywords,
          suggested: aiResult.keywords?.suggested || [],
          analysis: aiResult.keywords?.analysis || ''
        },
        seo: {
          score: aiResult.seo?.score || 0,
          improvements: aiResult.seo?.improvements || []
        },
        competitive: {
          analysis: aiResult.competitive?.analysis || '',
          recommendations: aiResult.competitive?.recommendations || []
        }
      };

      controller.enqueue(new TextEncoder().encode(`data: {"type":"result","content":${JSON.stringify(optimization)}}\n\n`));
      return optimization;

    } catch (parseError) {
      controller.enqueue(new TextEncoder().encode('data: {"type":"error","content":"AI返回格式解析失败"}\n\n'));
      throw new Error(`AI返回格式解析失败: ${parseError instanceof Error ? parseError.message : '未知错误'}`);
    }

  } catch (error) {
    console.error('SiliconFlow API调用失败:', error);
    controller.enqueue(new TextEncoder().encode(`data: {"type":"error","content":"AI服务调用失败: ${error instanceof Error ? error.message : '未知错误'}"}\n\n`));
    throw error;
  }
}

// 硅基流动AI API调用函数 - 非流式版本
async function callSiliconFlowAPI(productInfo: ProductInfo): Promise<OptimizationSuggestion> {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  
  if (!apiKey) {
    throw new Error('未配置SILICONFLOW_API_KEY，请联系管理员配置AI服务');
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
        max_tokens: 8000,
        temperature: 0.3,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI服务调用失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('AI返回内容为空');
    }

    console.log('AI原始响应:', content);

    // 尝试解析AI返回的JSON
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiResult = JSON.parse(cleanContent);
    
    // 验证返回的数据结构并转换为我们需要的格式
    const optimization: OptimizationSuggestion = {
      title: {
        original: productInfo.title,
        optimized: aiResult.title?.optimized || '',
        suggestions: aiResult.title?.suggestions || []
      },
      description: {
        original: productInfo.description,
        optimized: aiResult.description?.optimized || '',
        suggestions: aiResult.description?.suggestions || []
      },
      keywords: {
        original: productInfo.keywords,
        suggested: aiResult.keywords?.suggested || [],
        analysis: aiResult.keywords?.analysis || ''
      },
      seo: {
        score: aiResult.seo?.score || 0,
        improvements: aiResult.seo?.improvements || []
      },
      competitive: {
        analysis: aiResult.competitive?.analysis || '',
        recommendations: aiResult.competitive?.recommendations || []
      }
    };

    return optimization;

  } catch (error) {
    console.error('SiliconFlow API调用失败:', error);
    throw new Error(`AI服务调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
      // 非流式响应
      try {
        const optimization = await callSiliconFlowAPI(productInfo);
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