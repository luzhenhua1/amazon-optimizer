import { NextRequest, NextResponse } from 'next/server';
import { ProductInfo } from '@/types';

export async function POST(request: Request) {
  try {
    const { productInfo, titleResult, descriptionResult, keywordsResult } = await request.json();
    
    if (!productInfo) {
      return Response.json({ success: false, error: '缺少商品信息' }, { status: 400 });
    }

    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      return Response.json({ success: false, error: '未配置API密钥' }, { status: 500 });
    }

    const prompt = `作为亚马逊SEO专家，分析这个商品的SEO优化情况：

商品信息：
- 标题：${productInfo.title}
- 描述：${productInfo.description}
- 关键词：${productInfo.keywords.join('，')}
- 类目：${productInfo.category}
- 目标市场：${productInfo.targetMarket}

优化后信息：
- 新标题：${titleResult?.optimized || ''}
- 新描述：${descriptionResult?.optimized || ''}
- 新关键词：${keywordsResult?.suggested?.join('，') || ''}

请分析SEO表现并给出改进建议。必须用中文回复。

只输出此JSON格式：
{
  "score": 85,
  "improvements": [
    "优化标题关键词密度，当前密度偏低",
    "增加长尾关键词覆盖，提升搜索曝光",
    "完善产品描述结构，提高转化率",
    "添加更多产品规格信息",
    "优化图片ALT标签和标题匹配度"
  ]
}`;

    console.log('开始SEO分析...');
    
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'Pro/deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.1,
        top_p: 0.9
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SEO分析API错误:', errorText);
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
        score: parsed.score || 75,
        improvements: parsed.improvements || [
          '优化关键词策略提升搜索排名',
          '完善产品描述增强用户体验',
          '提高标题吸引力和相关性',
          '加强产品特色和卖点展示',
          '优化内容结构提升转化率'
        ]
      };

      console.log('SEO分析完成');
      return Response.json({ success: true, data: result });
      
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      return Response.json({ success: false, error: 'AI响应格式错误' }, { status: 500 });
    }

  } catch (error) {
    console.error('SEO分析失败:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '分析失败' 
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