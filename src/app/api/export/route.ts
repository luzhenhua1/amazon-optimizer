import { NextRequest, NextResponse } from 'next/server';
import { OptimizationSuggestion } from '@/types';

// 生成文本报告
function generateTextReport(suggestion: OptimizationSuggestion): string {
  const report = `
亚马逊商品优化报告
==================

SEO评分: ${suggestion.seo.score}/100

标题优化
--------
原始标题: ${suggestion.title.original}

优化后标题: ${suggestion.title.optimized}

优化建议:
${suggestion.title.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

描述优化
--------
原始描述:
${suggestion.description.original}

优化后描述:
${suggestion.description.optimized}

优化建议:
${suggestion.description.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

关键词分析
----------
原始关键词: ${suggestion.keywords.original.join(', ')}

推荐关键词: ${suggestion.keywords.suggested.join(', ')}

关键词分析:
${suggestion.keywords.analysis}

SEO改进建议
-----------
${suggestion.seo.improvements.map((s, i) => `${i + 1}. ${s}`).join('\n')}

竞品分析
--------
市场分析:
${suggestion.competitive.analysis}

建议措施:
${suggestion.competitive.recommendations.map((s, i) => `${i + 1}. ${s}`).join('\n')}

报告生成时间: ${new Date().toLocaleString('zh-CN')}
`;

  return report.trim();
}

// 生成HTML报告（用于PDF生成）
function generateHTMLReport(suggestion: OptimizationSuggestion): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>亚马逊商品优化报告</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
        }
        .score-badge {
            display: inline-block;
            background: ${suggestion.seo.score >= 80 ? '#4caf50' : suggestion.seo.score >= 60 ? '#ff9800' : '#f44336'};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }
        .section h2 {
            color: #2196f3;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 10px;
        }
        .original {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .optimized {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid #4caf50;
        }
        .keyword {
            display: inline-block;
            background: #e3f2fd;
            padding: 4px 8px;
            margin: 2px;
            border-radius: 4px;
            font-size: 12px;
        }
        .keyword.suggested {
            background: #c8e6c9;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin: 8px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>亚马逊商品优化报告</h1>
        <div class="score-badge">SEO评分: ${suggestion.seo.score}/100</div>
    </div>

    <div class="section">
        <h2>📝 标题优化</h2>
        <h4>原始标题:</h4>
        <div class="original">${suggestion.title.original}</div>
        <h4>优化后标题:</h4>
        <div class="optimized">${suggestion.title.optimized}</div>
        <h4>优化建议:</h4>
        <ul>
            ${suggestion.title.suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>📋 描述优化</h2>
        <h4>原始描述:</h4>
        <div class="original">${suggestion.description.original.replace(/\n/g, '<br>')}</div>
        <h4>优化后描述:</h4>
        <div class="optimized">${suggestion.description.optimized.replace(/\n/g, '<br>')}</div>
        <h4>优化建议:</h4>
        <ul>
            ${suggestion.description.suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>🔍 关键词分析</h2>
        <h4>原始关键词:</h4>
        <div>
            ${suggestion.keywords.original.map(k => `<span class="keyword">${k}</span>`).join('')}
        </div>
        <h4>推荐关键词:</h4>
        <div>
            ${suggestion.keywords.suggested.map(k => `<span class="keyword suggested">${k}</span>`).join('')}
        </div>
        <h4>关键词分析:</h4>
        <div class="original">${suggestion.keywords.analysis}</div>
    </div>

    <div class="section">
        <h2>📈 SEO改进建议</h2>
        <ul>
            ${suggestion.seo.improvements.map(s => `<li>${s}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>🏆 竞品分析</h2>
        <h4>市场分析:</h4>
        <div class="original">${suggestion.competitive.analysis}</div>
        <h4>建议措施:</h4>
        <ul>
            ${suggestion.competitive.recommendations.map(s => `<li>${s}</li>`).join('')}
        </ul>
    </div>

    <div class="footer">
        报告生成时间: ${new Date().toLocaleString('zh-CN')}
    </div>
</body>
</html>
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suggestion, format } = body;

    if (!suggestion) {
      return NextResponse.json({
        success: false,
        error: '缺少优化建议数据'
      }, { status: 400 });
    }

    if (!format || !['pdf', 'txt', 'json'].includes(format)) {
      return NextResponse.json({
        success: false,
        error: '不支持的导出格式'
      }, { status: 400 });
    }

    let content: string;
    let mimeType: string;
    let filename: string;

    switch (format) {
      case 'txt':
        content = generateTextReport(suggestion);
        mimeType = 'text/plain; charset=utf-8';
        filename = `amazon-optimization-report-${Date.now()}.txt`;
        break;

      case 'json':
        content = JSON.stringify(suggestion, null, 2);
        mimeType = 'application/json; charset=utf-8';
        filename = `amazon-optimization-report-${Date.now()}.json`;
        break;

      case 'pdf':
        // 对于PDF，我们返回HTML，前端可以使用window.print()或其他库生成PDF
        content = generateHTMLReport(suggestion);
        mimeType = 'text/html; charset=utf-8';
        filename = `amazon-optimization-report-${Date.now()}.html`;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: '不支持的格式'
        }, { status: 400 });
    }

    // 返回文件内容
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('导出错误:', error);
    
    return NextResponse.json({
      success: false,
      error: '导出失败'
    }, { status: 500 });
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