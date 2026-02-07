/**
 * Content Form Component
 * Reusable form for creating and editing content
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Heading, Text, VStack, HStack, Separator } from '@chakra-ui/react';
import { Button, Card, CardHeader, CardBody, Input, Textarea, Badge } from '@/components/ui';

// Content type definition (stored as string in database)
type ContentType = 'news' | 'directory' | 'market' | 'community' | 'initiative';

// Content type labels in Arabic
const contentTypeLabels: Record<ContentType, string> = {
  news: 'خبر',
  directory: 'دليل',
  market: 'سوق',
  community: 'مجتمع',
  initiative: 'مبادرة',
};

// Content type descriptions
const contentTypeDescriptions: Record<ContentType, string> = {
  news: 'شارك آخر الأخبار والمستجدات مع المجتمع',
  directory: 'أضف خدمة أو جهة إلى الدليل المحلي',
  market: 'اعرض منتجاً أو خدمة للبيع أو الشراء',
  community: 'ابدأ نقاشاً أو شارك تجربتك مع المجتمع',
  initiative: 'قدم مبادرة أو فكرة تخدم المجتمع',
};

// Field configuration per content type
const typeFields: Record<ContentType, { showPrice: boolean; showLocation: boolean; showContact: boolean }> = {
  news: { showPrice: false, showLocation: false, showContact: false },
  directory: { showPrice: false, showLocation: true, showContact: true },
  market: { showPrice: true, showLocation: true, showContact: true },
  community: { showPrice: false, showLocation: false, showContact: false },
  initiative: { showPrice: false, showLocation: true, showContact: true },
};

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\u0600-\u06FF\w\-]/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

interface ContentFormProps {
  mode: 'create' | 'edit';
  contentType?: ContentType;
  initialData?: {
    id?: string;
    title?: string;
    body?: string;
    tags?: string[];
    price?: number;
    location?: string;
    contactInfo?: string;
    imageUrl?: string;
  };
}

export default function ContentForm({ mode, contentType: initialType, initialData }: ContentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [type, setType] = useState<ContentType>(initialType || 'community');
  const [title, setTitle] = useState(initialData?.title || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [contactInfo, setContactInfo] = useState(initialData?.contactInfo || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fieldConfig = typeFields[type];
  
  // Handle image selection
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'يرجى اختيار صورة صالحة' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' }));
        return;
      }
      
      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'العنوان مطلوب';
    } else if (title.length < 10) {
      newErrors.title = 'العنوان يجب أن يكون 10 أحرف على الأقل';
    } else if (title.length > 200) {
      newErrors.title = 'العنوان يجب أن يكون أقل من 200 حرف';
    }
    
    if (!body.trim()) {
      newErrors.body = 'المحتوى مطلوب';
    } else if (body.length < 50) {
      newErrors.body = 'المحتوى يجب أن يكون 50 حرف على الأقل';
    }
    
    if (fieldConfig.showPrice && price) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.price = 'يرجى إدخال سعر صالح';
      }
    }
    
    if (fieldConfig.showLocation && !location.trim()) {
      newErrors.location = 'الموقع مطلوب لهذا النوع من المحتوى';
    }
    
    if (fieldConfig.showContact && !contactInfo.trim()) {
      newErrors.contactInfo = 'معلومات التواصل مطلوبة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, body, price, location, contactInfo, fieldConfig]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Parse tags
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Upload image if provided
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error('فشل في رفع الصورة');
        }
        
        const { url } = await uploadRes.json();
        finalImageUrl = url;
      }
      
      // Generate slug for news
      const slug = type === 'news' ? generateSlug(title) : undefined;
      
      // Build metadata for directory and market
      const metadata: Record<string, any> = {};
      if (type === 'directory' && location) {
        metadata.category = location;
      }
      if (type === 'market' && location) {
        metadata.type = location;
      }
      
      // Prepare content data
      const contentData = {
        title: title.trim(),
        body: body.trim(),
        type,
        tags,
        slug,
        imageUrl: finalImageUrl || undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        ...(fieldConfig.showPrice && price ? { price: parseFloat(price) } : {}),
        ...(fieldConfig.showLocation && location ? { location: location.trim() } : {}),
        ...(fieldConfig.showContact && contactInfo ? { contactInfo: contactInfo.trim() } : {}),
      };
      
      // Submit to API
      const url = mode === 'create' 
        ? '/api/content' 
        : `/api/content/${initialData?.id}`;
      
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'حدث خطأ أثناء حفظ المحتوى');
      }
      
      const result = await res.json();
      
      // Redirect to content page using new routing
      let redirectUrl: string;
      if (type === 'news') {
        redirectUrl = `/news/${result.slug || result.id}`;
      } else if (type === 'directory') {
        redirectUrl = `/directory/${result.metadata?.category || 'general'}/${result.id}`;
      } else if (type === 'market') {
        redirectUrl = `/market/${result.metadata?.type || 'general'}/${result.id}`;
      } else {
        const typeRoute = type === 'initiative' ? 'initiatives' : type;
        redirectUrl = `/${typeRoute}/${result.id}`;
      }
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box as="form" onSubmit={handleSubmit} maxW="800px" mx="auto">
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            {mode === 'create' ? 'إنشاء محتوى جديد' : 'تعديل المحتوى'}
          </Heading>
          <Text color="gray.400">
            {mode === 'create' 
              ? 'شارك محتواك مع مجتمع موحسن'
              : 'قم بتحديث محتواك'}
          </Text>
        </Box>
        
        {/* Error message */}
        {error && (
          <Card bg="red.900/20" borderColor="red.500">
            <CardBody>
              <Text color="red.300">{error}</Text>
            </CardBody>
          </Card>
        )}
        
        {/* Content Type Selection */}
        {mode === 'create' && !initialType && (
          <Card>
            <CardHeader>
              <Heading as="h2" size="md">نوع المحتوى</Heading>
            </CardHeader>
            <CardBody>
              <Flex gap={3} flexWrap="wrap">
                {(Object.keys(contentTypeLabels) as ContentType[]).map((contentType) => (
                  <Button
                    key={contentType}
                    variant={type === contentType ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setType(contentType)}
                    type="button"
                  >
                    {contentTypeLabels[contentType]}
                  </Button>
                ))}
              </Flex>
              <Text fontSize="sm" color="gray.400" mt={3}>
                {contentTypeDescriptions[type]}
              </Text>
            </CardBody>
          </Card>
        )}
        
        {/* Fixed type badge */}
        {(mode === 'edit' || initialType) && (
          <HStack>
            <Text color="gray.400">نوع المحتوى:</Text>
            <Badge colorScheme="blue">{contentTypeLabels[type]}</Badge>
          </HStack>
        )}
        
        {/* Main Content */}
        <Card>
          <CardHeader>
            <Heading as="h2" size="md">المحتوى الأساسي</Heading>
          </CardHeader>
          <CardBody>
            <VStack gap={4} align="stretch">
              <Input
                label="العنوان"
                placeholder="أدخل عنواناً واضحاً وجذاباً"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                required
              />
              
              <Textarea
                label="المحتوى"
                placeholder="اكتب محتواك هنا... يمكنك استخدام التنسيق لجعل المحتوى أكثر وضوحاً"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                error={errors.body}
                rows={10}
                required
              />
              
              <Input
                label="الوسوم"
                placeholder="أدخل الوسوم مفصولة بفواصل (مثال: تقنية، أخبار، محلي)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                helperText="تساعد الوسوم في تصنيف المحتوى وجعله قابلاً للبحث"
              />
            </VStack>
          </CardBody>
        </Card>
        
        {/* Type-specific fields */}
        {(fieldConfig.showPrice || fieldConfig.showLocation || fieldConfig.showContact) && (
          <Card>
            <CardHeader>
              <Heading as="h2" size="md">معلومات إضافية</Heading>
            </CardHeader>
            <CardBody>
              <VStack gap={4} align="stretch">
                {fieldConfig.showPrice && (
                  <Input
                    label="السعر"
                    type="number"
                    placeholder="أدخل السعر (اختياري)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    error={errors.price}
                    helperText="اترك الحقل فارغاً إذا كان السعر قابل للتفاوض"
                  />
                )}
                
                {fieldConfig.showLocation && (
                  <Input
                    label="الموقع"
                    placeholder="أدخل الموقع أو العنوان"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    error={errors.location}
                    required={fieldConfig.showLocation}
                  />
                )}
                
                {fieldConfig.showContact && (
                  <Input
                    label="معلومات التواصل"
                    placeholder="رقم الهاتف أو البريد الإلكتروني"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    error={errors.contactInfo}
                    required={fieldConfig.showContact}
                  />
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
        
        {/* Image Upload */}
        <Card>
          <CardHeader>
            <Heading as="h2" size="md">الصورة</Heading>
          </CardHeader>
          <CardBody>
            <VStack gap={4} align="stretch">
              {/* Image preview */}
              {imagePreview && (
                <Box
                  borderRadius="lg"
                  overflow="hidden"
                  position="relative"
                  maxH="300px"
                >
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '300px',
                      objectFit: 'cover',
                    }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    position="absolute"
                    top={2}
                    left={2}
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setImageUrl('');
                    }}
                    type="button"
                  >
                    حذف
                  </Button>
                </Box>
              )}
              
              {/* Upload input */}
              {!imagePreview && (
                <Box
                  border="2px dashed"
                  borderColor="gray.600"
                  borderRadius="lg"
                  p={8}
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: 'gray.500', bg: 'whiteAlpha.50' }}
                  position="relative"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                  <VStack gap={2}>
                    <Box fontSize="3xl">📷</Box>
                    <Text color="gray.300">انقر أو اسحب صورة هنا</Text>
                    <Text fontSize="sm" color="gray.500">
                      PNG, JPG, GIF حتى 5 ميجابايت
                    </Text>
                  </VStack>
                </Box>
              )}
              
              {errors.image && (
                <Text color="red.400" fontSize="sm">{errors.image}</Text>
              )}
              
              {/* Or use URL */}
              {!imageFile && !imagePreview && (
                <>
                  <Flex align="center" gap={3}>
                    <Separator flex={1} />
                    <Text fontSize="sm" color="gray.500">أو</Text>
                    <Separator flex={1} />
                  </Flex>
                  
                  <Input
                    label="رابط الصورة"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value) {
                        setImagePreview(e.target.value);
                      }
                    }}
                  />
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
        
        {/* Submission notice */}
        <Card bg="blue.900/20" borderColor="blue.500">
          <CardBody>
            <HStack gap={3}>
              <Text fontSize="xl">ℹ️</Text>
              <Box>
                <Text fontWeight="bold" color="blue.300">
                  ملاحظة حول المراجعة
                </Text>
                <Text fontSize="sm" color="gray.300">
                  سيتم مراجعة المحتوى بواسطة نظام الذكاء الاصطناعي. 
                  قد يستغرق النشر بعض الوقت إذا تطلب مراجعة يدوية.
                </Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>
        
        {/* Actions */}
        <Flex gap={3} justify="flex-end">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            type="button"
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            loadingText={mode === 'create' ? 'جاري النشر...' : 'جاري الحفظ...'}
          >
            {mode === 'create' ? 'نشر المحتوى' : 'حفظ التغييرات'}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
