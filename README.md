# 亚马逊店铺优化助手

使用AI技术分析和优化您的亚马逊商品信息，提升搜索排名和转化率的智能工具。

## ✨ 功能特性

- 🔗 **智能解析**: 自动解析Amazon商品链接，提取商品信息
- 🤖 **AI优化**: 使用硅基流动的DeepSeek-R1模型生成专业的SEO优化建议
- 📊 **多维分析**: 涵盖标题、描述、关键词、竞品分析等多个维度
- 📄 **一键导出**: 支持PDF、TXT、JSON等多种格式导出报告
- 🌍 **多市场支持**: 支持美国、欧洲、日本等多个Amazon市场
- 📱 **响应式设计**: 完美适配桌面端和移动端

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd amazon-optimizer
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

创建 `.env.local` 文件：

```bash
# 硅基流动AI API配置
SILICONFLOW_API_KEY=sk-your-siliconflow-api-key-here

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Amazon Optimizer
```

**注意**: 
- 如果不配置AI API密钥，系统将使用内置的模拟数据，这对于演示和测试是完全可行的
- 硅基流动提供多种高性能AI模型，当前使用DeepSeek-R1模型
- 获取API密钥请访问：[硅基流动官网](https://siliconflow.cn)

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📖 使用说明

### 链接解析模式

1. 选择"链接解析"标签
2. 输入Amazon商品链接（支持各国站点）
3. 选择目标市场
4. 点击"解析并优化"

### 手动输入模式

1. 选择"手动输入"标签
2. 填写商品标题、描述等信息
3. 添加相关关键词
4. 选择商品分类和目标市场
5. 点击"开始优化"

### 查看和导出结果

- 在结果页面查看详细的优化建议
- 支持标题、描述、关键词、SEO等多个维度的分析
- 可导出PDF报告、文本文件或JSON数据

## 🛠️ 技术栈

- **前端框架**: Next.js 15
- **UI组件**: shadcn/ui + Tailwind CSS
- **表单处理**: React Hook Form + Zod
- **状态管理**: React Hooks
- **HTTP客户端**: Axios
- **图标**: Lucide React
- **通知**: Sonner
- **AI服务**: 硅基流动 DeepSeek-R1模型

## 📁 项目结构

```
amazon-optimizer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API路由
│   │   │   ├── parse/         # 链接解析API
│   │   │   ├── optimize/      # AI优化API
│   │   │   └── export/        # 导出功能API
│   │   ├── page.tsx           # 主页面
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式
│   ├── components/
│   │   ├── ui/                # 基础UI组件
│   │   ├── forms/             # 表单组件
│   │   └── features/          # 功能组件
│   ├── types/                 # TypeScript类型定义
│   └── lib/                   # 工具函数
├── public/                    # 静态资源
└── package.json
```

## 🔧 开发说明

### API端点

- **POST /api/parse**: 解析Amazon商品链接
- **POST /api/optimize**: 生成AI优化建议（使用硅基流动DeepSeek-R1）
- **POST /api/export**: 导出优化报告

### AI服务配置

本项目使用硅基流动提供的AI服务：
- **API地址**: `https://api.siliconflow.cn/v1/chat/completions`
- **使用模型**: `deepseek-ai/DeepSeek-R1`
- **API文档**: [硅基流动API文档](https://docs.siliconflow.cn/cn/api-reference/chat-completions/chat-completions)

### 组件说明

- **ProductForm**: 商品信息输入表单
- **OptimizationResult**: 优化结果展示
- **UI Components**: 基于shadcn/ui的可复用组件

### 类型定义

所有TypeScript类型定义在 `src/types/index.ts` 中，包括：
- ProductInfo: 商品信息
- OptimizationSuggestion: 优化建议
- ApiResponse: API响应格式

## 🚀 部署

### Vercel部署

1. 推送代码到GitHub
2. 在Vercel中导入项目
3. 配置环境变量（如需要）
4. 部署完成

### 环境变量配置

在Vercel Dashboard中配置以下环境变量：

```
SILICONFLOW_API_KEY=sk-your-api-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🎯 核心功能

### 1. 商品信息解析

- 支持Amazon各国站点链接
- 自动提取商品标题、描述、价格等信息
- 错误处理和验证

### 2. AI优化建议（硅基流动DeepSeek-R1）

- 标题优化：长度、关键词密度、吸引力
- 描述优化：结构化、卖点突出、行动召唤
- 关键词分析：搜索热度、竞争度、相关性
- SEO评分：综合评估搜索引擎优化程度
- 竞品分析：市场定位、差异化策略

### 3. 报告导出

- **PDF报告**: 完整的优化分析报告
- **文本文件**: 简化的文本格式
- **JSON数据**: 结构化数据，便于进一步处理

## 💰 成本控制

### 硅基流动定价优势
- 比OpenAI更具性价比
- 支持国内高速访问
- 提供多种优质模型选择
- DeepSeek-R1在推理和分析方面表现优异

### 建议配置
- 设置API调用限制
- 监控使用量
- 合理设置max_tokens参数

## 🔒 隐私说明

- 所有数据仅在请求处理期间使用
- 不存储任何用户输入的商品信息
- 不收集用户个人信息
- 符合数据保护最佳实践

## 🤝 贡献

欢迎提交Issue和Pull Request来帮助改进项目。

## 📄 许可证

MIT License

## 📞 支持

如有问题或建议，请提交Issue或联系开发团队。

---

*最后更新: 2025年*
