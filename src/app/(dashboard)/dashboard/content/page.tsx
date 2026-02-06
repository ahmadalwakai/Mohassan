/**
 * My Content Page
 * List and manage user's content
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Flex, Heading, Text, SimpleGrid, VStack, HStack, Tabs } from '@chakra-ui/react';
import { 
  Card, 
  CardBody, 
  Button, 
  Badge, 
  StatusBadge,
  Input,
  Pagination,
  EmptyState,
  Spinner,
  Modal,
} from '@/components/ui';

// Content types
type ContentType = 'news' | 'directory' | 'market' | 'community' | 'initiative';
type ContentStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

// Content type labels
const contentTypeLabels: Record<ContentType, string> = {
  news: 'أخبار',
  directory: 'دليل',
  market: 'سوق',
  community: 'مجتمع',
  initiative: 'مبادرات',
};

// Status labels
const statusLabels: Record<ContentStatus, string> = {
  draft: 'مسودة',
  pending: 'قيد المراجعة',
  published: 'منشور',
  rejected: 'مرفوض',
  archived: 'مؤرشف',
};

interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

type TabValue = 'all' | ContentStatus;

export default function MyContentPage() {
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch content
  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        mine: 'true',
        ...(search && { search }),
        ...(activeTab !== 'all' && { status: activeTab }),
      });
      
      const res = await fetch(`/api/content?${params}`);
      
      if (!res.ok) {
        throw new Error('فشل في جلب المحتوى');
      }
      
      const data = await res.json();
      setContent(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeTab]);
  
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);
  
  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/content/${deleteTarget}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('فشل في حذف المحتوى');
      }
      
      setDeleteTarget(null);
      fetchContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: TabValue) => {
    setActiveTab(value);
    setPage(1);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get route for content type
  const getContentRoute = (type: ContentType) => {
    return type === 'initiative' ? 'initiatives' : type;
  };
  
  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Box>
          <Heading as="h1" size="lg" mb={1}>
            محتواي
          </Heading>
          <Text color="gray.400">
            إدارة وتتبع جميع منشوراتك
          </Text>
        </Box>
        <Link href="/create">
          <Button variant="primary">
            + إنشاء محتوى جديد
          </Button>
        </Link>
      </Flex>
      
      {/* Search and filters */}
      <Card>
        <CardBody>
          <VStack gap={4} align="stretch">
            <Input
              placeholder="ابحث في محتواك..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            
            {/* Status tabs */}
            <HStack gap={2} flexWrap="wrap">
              <Button
                variant={activeTab === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('all')}
              >
                الكل
              </Button>
              <Button
                variant={activeTab === 'published' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('published')}
              >
                منشور
              </Button>
              <Button
                variant={activeTab === 'pending' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('pending')}
              >
                قيد المراجعة
              </Button>
              <Button
                variant={activeTab === 'draft' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('draft')}
              >
                مسودة
              </Button>
              <Button
                variant={activeTab === 'rejected' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('rejected')}
              >
                مرفوض
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
      
      {/* Content list */}
      {loading ? (
        <Flex justify="center" py={8}>
          <Spinner size="lg" />
        </Flex>
      ) : error ? (
        <EmptyState
          icon={<span>⚠️</span>}
          title="حدث خطأ"
          description={error}
          action={{ label: 'إعادة المحاولة', onClick: fetchContent }}
        />
      ) : content.length === 0 ? (
        <EmptyState
          icon={search ? <span>🔍</span> : <span>📝</span>}
          title={search ? 'لا توجد نتائج' : 'لا يوجد محتوى'}
          description={
            search 
              ? 'حاول تغيير كلمات البحث'
              : 'ابدأ بإنشاء محتواك الأول'
          }
        />
      ) : (
        <VStack gap={4} align="stretch">
          {content.map((item) => (
            <Card key={item.id} _hover={{ borderColor: 'gray.600' }}>
              <CardBody>
                <Flex 
                  direction={{ base: 'column', md: 'row' }} 
                  justify="space-between" 
                  align={{ base: 'stretch', md: 'center' }}
                  gap={4}
                >
                  {/* Content info */}
                  <Box flex={1} minW={0}>
                    <Link href={`/${getContentRoute(item.type)}/${item.id}`}>
                      <Text 
                        fontWeight="bold" 
                        lineClamp={1}
                        _hover={{ color: 'brand.400' }}
                        mb={2}
                      >
                        {item.title}
                      </Text>
                    </Link>
                    <HStack gap={3} flexWrap="wrap">
                      <Badge colorScheme="blue">{contentTypeLabels[item.type]}</Badge>
                      <StatusBadge status={item.status} />
                      <Text fontSize="sm" color="gray.500">
                        {item.viewCount.toLocaleString('ar-SA')} مشاهدة
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(item.createdAt)}
                      </Text>
                    </HStack>
                  </Box>
                  
                  {/* Actions */}
                  <HStack gap={2} flexShrink={0}>
                    <Link href={`/${getContentRoute(item.type)}/${item.id}`}>
                      <Button variant="ghost" size="sm">
                        عرض
                      </Button>
                    </Link>
                    <Link href={`/edit/${item.id}`}>
                      <Button variant="outline" size="sm">
                        تعديل
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      color="red.400"
                      onClick={() => setDeleteTarget(item.id)}
                    >
                      حذف
                    </Button>
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </Flex>
          )}
        </VStack>
      )}
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="تأكيد الحذف"
        size="sm"
      >
        <VStack gap={4} align="stretch">
          <Text>
            هل أنت متأكد من حذف هذا المحتوى؟ لا يمكن التراجع عن هذا الإجراء.
          </Text>
          <HStack justify="flex-end" gap={2}>
            <Button 
              variant="ghost" 
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button 
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              loadingText="جاري الحذف..."
            >
              حذف
            </Button>
          </HStack>
        </VStack>
      </Modal>
    </VStack>
  );
}
