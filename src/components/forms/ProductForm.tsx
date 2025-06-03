'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Link, FileText } from 'lucide-react';
import { ProductFormData, TARGET_MARKETS, PRODUCT_CATEGORIES } from '@/types';

// 表单验证schema
const productFormSchema = z.object({
  inputType: z.enum(['url', 'manual']),
  amazonUrl: z.string().url('请输入有效的Amazon链接').optional().or(z.literal('')),
  title: z.string().min(1, '请输入商品标题').optional().or(z.literal('')),
  description: z.string().min(1, '请输入商品描述').optional().or(z.literal('')),
  keywords: z.string().optional().or(z.literal('')),
  category: z.string().min(1, '请选择商品分类').optional().or(z.literal('')),
  targetMarket: z.string().min(1, '请选择目标市场').optional().or(z.literal('')),
}).refine((data) => {
  if (data.inputType === 'url') {
    return data.amazonUrl && data.amazonUrl.length > 0;
  } else {
    return data.title && data.description && data.category && data.targetMarket;
  }
}, {
  message: '请填写必要的信息',
});

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

export function ProductForm({ onSubmit, isLoading = false }: ProductFormProps) {
  const [inputType, setInputType] = useState<'url' | 'manual'>('url');
  const [keywordTags, setKeywordTags] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      inputType: 'url',
      amazonUrl: '',
      title: '',
      description: '',
      keywords: '',
      category: '',
      targetMarket: 'us',
    },
  });

  const handleInputTypeChange = (type: 'url' | 'manual') => {
    setInputType(type);
    setValue('inputType', type);
    // 清空其他字段
    if (type === 'url') {
      setValue('title', '');
      setValue('description', '');
      setValue('keywords', '');
      setValue('category', '');
    } else {
      setValue('amazonUrl', '');
    }
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !keywordTags.includes(keyword.trim())) {
      const newTags = [...keywordTags, keyword.trim()];
      setKeywordTags(newTags);
      setValue('keywords', newTags.join(', '));
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    const newTags = keywordTags.filter(tag => tag !== keyword);
    setKeywordTags(newTags);
    setValue('keywords', newTags.join(', '));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(currentKeyword);
    }
  };

  const onFormSubmit = (data: ProductFormData) => {
    onSubmit({
      ...data,
      keywords: keywordTags.join(', '),
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="flex items-center justify-center gap-3 text-xl">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          开始优化您的商品信息
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          选择输入方式，然后填写商品信息，AI将为您生成专业的优化建议
        </p>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Tabs value={inputType} onValueChange={(value) => handleInputTypeChange(value as 'url' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="url" className="flex items-center gap-2 h-10">
                <Link className="h-4 w-4" />
                链接解析
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2 h-10">
                <FileText className="h-4 w-4" />
                手动输入
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-5 mt-6">
              <div className="space-y-3">
                <Label htmlFor="amazonUrl" className="text-sm font-medium">Amazon商品链接</Label>
                <Input
                  id="amazonUrl"
                  placeholder="https://www.amazon.com/dp/B08N5WRWNW"
                  {...register('amazonUrl')}
                  className={`h-12 ${errors.amazonUrl ? 'border-red-500' : ''}`}
                />
                {errors.amazonUrl && (
                  <p className="text-sm text-red-500">{errors.amazonUrl.message}</p>
                )}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>支持亚马逊8个主要站点：US, UK, DE, FR, CA, AU, JP, IT</p>
                  <p>请粘贴完整的商品链接，系统将自动抓取商品信息</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="targetMarket" className="text-sm font-medium">目标市场</Label>
                <Select onValueChange={(value) => setValue('targetMarket', value)} defaultValue="us">
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="选择目标市场" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_MARKETS.map(market => (
                      <SelectItem key={market.value} value={market.value}>
                        {market.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-5 mt-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-medium">商品标题 *</Label>
                <Input
                  id="title"
                  placeholder="输入完整的商品标题"
                  {...register('title')}
                  className={`h-12 ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium">商品描述 *</Label>
                <Textarea
                  id="description"
                  placeholder="详细描述商品的特点、功能、优势等..."
                  rows={4}
                  {...register('description')}
                  className={`resize-none ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="keywords" className="text-sm font-medium">关键词</Label>
                <div className="space-y-3">
                  <Input
                    placeholder="输入关键词，按回车或逗号添加"
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyPress={handleKeywordKeyPress}
                    onBlur={() => addKeyword(currentKeyword)}
                    className="h-12"
                  />
                  {keywordTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                      {keywordTags.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors"
                          onClick={() => removeKeyword(keyword)}
                        >
                          {keyword} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-sm font-medium">商品分类 *</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="targetMarket" className="text-sm font-medium">目标市场 *</Label>
                  <Select onValueChange={(value) => setValue('targetMarket', value)} defaultValue="us">
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="选择市场" />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_MARKETS.map(market => (
                        <SelectItem key={market.value} value={market.value}>
                          {market.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.targetMarket && (
                    <p className="text-sm text-red-500">{errors.targetMarket.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? '正在处理...' : (inputType === 'url' ? '🚀 解析并优化' : '✨ 开始优化')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 