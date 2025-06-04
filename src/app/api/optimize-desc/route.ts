import { NextRequest, NextResponse } from 'next/server';
import { ProductInfo } from '@/types';

export async function POST(request: Request) {
  try {
    const { productInfo } = await request.json();
    
    if (!productInfo) {
      return Response.json({ success: false, error: '缺少商品信息' }, { status: 400 });
    }

    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      return Response.json({ success: false, error: '未配置API密钥' }, { status: 500 });
    }

    const isEnglishMarket = ['us', 'uk', 'ca', 'au'].includes(productInfo.targetMarket);
    
    const prompt = isEnglishMarket ?
      `Optimize this Amazon product description for ${productInfo.targetMarket.toUpperCase()} market:

Current: "${productInfo.description}"
Category: ${productInfo.category}

Requirements:
- Use PLAIN TEXT only, NO markdown formatting (no *, **, #, etc.)
- Create bullet points using simple dashes (-) or Unicode bullets (•)
- Include trust signals and quality indicators
- Make it compelling and readable
- Keep it concise but informative
- Use standard Amazon listing format

Output ONLY this JSON format:
{
  "optimized": "your enhanced description here",
  "suggestions": ["tip1", "tip2", "tip3"]
}` :
      `优化这个亚马逊商品描述，针对${productInfo.targetMarket}市场：

当前描述："${productInfo.description}"
类目：${productInfo.category}

要求：
- 使用纯文本，不要markdown格式（不要用*、**、#等符号）
- 用简单横线(-)或圆点(•)做列表
- 加入信任指标和品质保证
- 简洁有吸引力
- 符合亚马逊标准格式

只输出此JSON格式：
{
  "optimized": "你优化的描述",
  "suggestions": ["建议1", "建议2", "建议3"]
}`;

    console.log('开始描述优化...');
    
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'Pro/deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.1,
        top_p: 0.9
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('描述优化API错误:', errorText);
      return Response.json({ success: false, error: `API错误: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      return Response.json({ success: false, error: 'AI返回内容为空' }, { status: 500 });
    }

    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      
      const result = {
        original: productInfo.description,
        optimized: parsed.optimized || productInfo.description,
        suggestions: parsed.suggestions || []
      };

      console.log('描述优化完成');
      return Response.json({ success: true, data: result });
      
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      return Response.json({ success: false, error: 'AI响应格式错误' }, { status: 500 });
    }

  } catch (error) {
    console.error('描述优化失败:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '优化失败' 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 