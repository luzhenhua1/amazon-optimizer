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

    console.log('开始关键词优化...');
    
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
        temperature: 0.2,
        top_p: 0.9
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('关键词优化API错误:', errorText);
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
        original: productInfo.keywords,
        suggested: parsed.suggested || [...productInfo.keywords],
        analysis: parsed.analysis || ''
      };

      console.log('关键词优化完成');
      return Response.json({ success: true, data: result });
      
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      return Response.json({ success: false, error: 'AI响应格式错误' }, { status: 500 });
    }

  } catch (error) {
    console.error('关键词优化失败:', error);
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