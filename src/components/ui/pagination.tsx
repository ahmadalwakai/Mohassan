'use client';

/**
 * Pagination Component
 */

import { Box, HStack, Text } from '@chakra-ui/react';
import { Button } from './button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxPageButtons = 5,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxPageButtons / 2);
      let start = Math.max(1, page - half);
      const end = Math.min(totalPages, start + maxPageButtons - 1);
      
      if (end - start < maxPageButtons - 1) {
        start = Math.max(1, end - maxPageButtons + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('ellipsis');
      }

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <HStack gap={2} justify="center" flexWrap="wrap">
      {/* Previous */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        px={3}
      >
        السابق
      </Button>

      {/* Page Numbers */}
      {showPageNumbers && (
        <HStack gap={1}>
          {getPageNumbers().map((pageNum, index) => (
            pageNum === 'ellipsis' ? (
              <Text key={`ellipsis-${index}`} color="gray.500" px={2}>
                ...
              </Text>
            ) : (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                minW={8}
                px={2}
              >
                {pageNum}
              </Button>
            )
          ))}
        </HStack>
      )}

      {/* Next */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        px={3}
      >
        التالي
      </Button>
    </HStack>
  );
};

// Simple pagination info
export const PaginationInfo = ({
  page,
  limit,
  total,
}: {
  page: number;
  limit: number;
  total: number;
}) => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <Text fontSize="sm" color="gray.500">
      عرض {start} - {end} من {total}
    </Text>
  );
};
