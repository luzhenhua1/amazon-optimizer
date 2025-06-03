// 商品信息类型
export interface ProductInfo {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  targetMarket: string;
  price?: number;
  images?: string[];
  reviews?: number;
  rating?: number;
  amazonUrl?: string;
  asin?: string;
}

// 优化建议类型
export interface OptimizationSuggestion {
  title: {
    original: string;
    optimized: string;
    suggestions: string[];
  };
  description: {
    original: string;
    optimized: string;
    suggestions: string[];
  };
  keywords: {
    original: string[];
    suggested: string[];
    analysis: string;
  };
  seo: {
    score: number;
    improvements: string[];
  };
  competitive: {
    analysis: string;
    recommendations: string[];
  };
}

// 表单数据类型
export interface ProductFormData {
  inputType: 'url' | 'manual';
  amazonUrl?: string;
  title?: string;
  description?: string;
  keywords?: string;
  category?: string;
  targetMarket?: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 导出选项类型
export interface ExportOptions {
  format: 'pdf' | 'txt' | 'json';
  includeOriginal: boolean;
  includeAnalysis: boolean;
}

// 市场选项
export const TARGET_MARKETS = [
  { value: 'us', label: '美国 (US)' },
  { value: 'uk', label: '英国 (UK)' },
  { value: 'de', label: '德国 (DE)' },
  { value: 'fr', label: '法国 (FR)' },
  { value: 'it', label: '意大利 (IT)' },
  { value: 'es', label: '西班牙 (ES)' },
  { value: 'jp', label: '日本 (JP)' },
  { value: 'ca', label: '加拿大 (CA)' },
] as const;

// 分类选项
export const PRODUCT_CATEGORIES = [
  { value: 'electronics', label: '电子产品' },
  { value: 'home-garden', label: '家居园艺' },
  { value: 'clothing', label: '服装配饰' },
  { value: 'books', label: '图书' },
  { value: 'health', label: '健康美容' },
  { value: 'sports', label: '运动户外' },
  { value: 'toys', label: '玩具游戏' },
  { value: 'automotive', label: '汽车用品' },
  { value: 'tools', label: '工具设备' },
  { value: 'other', label: '其他' },
] as const; 