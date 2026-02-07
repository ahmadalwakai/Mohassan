'use client';

/**
 * Content List Component
 * Handles fetching and displaying content lists
 */

import { useState, useEffect, useCallback } from 'react';
import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { ContentCard, ContentGrid } from './content-card';
import { 
  Input, 
  Pagination, 
  PaginationInfo, 
  ContentCardSkeleton, 
  NoContentEmptyState,
  NoResultsEmptyState,
  ErrorEmptyState,
} from '@/components/ui';

export interface ContentListProps {
  type?: string;
  initialData?: ContentListData;
  showFilters?: boolean;
  showSearch?: boolean;
  showStatus?: boolean;
  columns?: Record<string, number>;
}

interface ContentListData {
  items: ContentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ContentItem {
  id: string;
  type: string;
  title: string;
  excerpt?: string | null;
  image?: string | null;
  status: string;
  author: {
    id: string;
    name: string | null;
    image?: string | null;
  };
  createdAt: string;
  viewCount?: number;
  tags?: Array<{ tag: { id: string; name: string; slug: string } }>;
  slug?: string;
  metadata?: Record<string, unknown>;
  category?: string;
  marketType?: string;
}

export const ContentList = ({
  type,
  initialData,
  showFilters = false,
  showSearch = false,
  showStatus = false,
  columns,
}: ContentListProps) => {
  const [data, setData] = useState<ContentListData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        sortOrder: 'desc',
        status: 'PUBLISHED',
      });

      if (type) params.set('type', type);
      if (search) params.set('search', search);

      const res = await fetch(`/api/content?${params}`);
      if (!res.ok) throw new Error('Failed to fetch content');

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [type, page, search, sortBy]);

  useEffect(() => {
    if (!initialData) {
      fetchContent();
    }
  }, [fetchContent, initialData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!initialData) {
        setPage(1);
        fetchContent();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <VStack align="stretch" gap={6}>
      {/* Filters */}
      {(showFilters || showSearch) && (
        <HStack
          gap={4}
          flexWrap="wrap"
          p={4}
          bg="gray.800"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.700"
        >
          {showSearch && (
            <Box flex={1} minW="200px">
              <Input
                placeholder="ابحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
          )}
          {showFilters && (
            <Box>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  backgroundColor: '#1A202C',
                  borderColor: '#4A5568',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #4A5568',
                  cursor: 'pointer',
                }}
              >
                <option value="createdAt">الأحدث</option>
                <option value="viewCount">الأكثر مشاهدة</option>
                <option value="title">الأبجدية</option>
              </select>
            </Box>
          )}
        </HStack>
      )}

      {/* Loading State */}
      {loading && (
        <ContentGrid columns={columns}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </ContentGrid>
      )}

      {/* Error State */}
      {error && !loading && (
        <ErrorEmptyState onRetry={fetchContent} />
      )}

      {/* Empty State */}
      {!loading && !error && data && data.items.length === 0 && (
        search ? (
          <NoResultsEmptyState onClear={() => setSearch('')} />
        ) : (
          <NoContentEmptyState />
        )
      )}

      {/* Content Grid */}
      {!loading && !error && data && data.items.length > 0 && (
        <>
          <ContentGrid columns={columns}>
            {data.items.map((item) => {
              // Extract category/marketType from metadata
              const category = item.type === 'directory' 
                ? (item.metadata?.category as string) || 'general'
                : undefined;
              const marketType = item.type === 'market'
                ? (item.metadata?.type as string) || 'general'
                : undefined;
              
              return (
                <ContentCard
                  key={item.id}
                  {...item}
                  category={category}
                  marketType={marketType}
                  showStatus={showStatus}
                />
              );
            })}
          </ContentGrid>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <VStack gap={4} pt={8}>
              <PaginationInfo
                page={data.pagination.page}
                limit={data.pagination.limit}
                total={data.pagination.total}
              />
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </VStack>
          )}
        </>
      )}
    </VStack>
  );
};
