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

    const prompt = `作为亚马逊市场分析专家，分析这个商品的竞争环境：

商品信息：
- 标题：${productInfo.title}
- 描述：${productInfo.description}
- 类目：${productInfo.category}
- 目标市场：${productInfo.targetMarket}
- 关键词：${productInfo.keywords.join('，')}

请分析竞争格局并给出策略建议。必须用中文回复。

只输出此JSON格式：
{
  "analysis": "该类目竞争程度适中，市场需求稳定。主要竞争对手集中在品质和价格两个维度。建议通过差异化定位和优质服务获得竞争优势。",
  "recommendations": [
    "强调产品独特功能和技术优势",
    "建立品牌差异化定位策略",
    "优化价格策略提升性价比竞争力",
    "完善客户服务体系增强用户粘性",
    "持续监控竞争对手动态调整策略"
  ]
}`;

    console.log('开始竞争分析...');
    
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
      console.error('竞争分析API错误:', errorText);
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
        analysis: parsed.analysis || `${productInfo.category}市场分析：竞争格局显示通过品质定位和客户导向策略存在差异化机会。重点关注独特价值主张的建立。`,
        recommendations: parsed.recommendations || [
          '强调独特产品特性和品质优势',
          '通过一致信息传递建立强势品牌形象',
          '专注客户服务卓越提升用户体验',
          '监控竞争对手定价并调整市场定位',
          '利用正面评价和社会证明建立信任'
        ]
      };

      console.log('竞争分析完成');
      return Response.json({ success: true, data: result });
      
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      return Response.json({ success: false, error: 'AI响应格式错误' }, { status: 500 });
    }

  } catch (error) {
    console.error('竞争分析失败:', error);
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