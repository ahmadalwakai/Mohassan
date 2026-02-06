'use client';

/**
 * Empty State Component
 * Display when no content is available
 */

import { Box, Text, VStack } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <VStack
      py={16}
      px={8}
      textAlign="center"
      gap={4}
    >
      {icon && (
        <Box color="gray.500" fontSize="5xl">
          {icon}
        </Box>
      )}
      <Text fontSize="xl" fontWeight="semibold" color="gray.300">
        {title}
      </Text>
      {description && (
        <Text color="gray.500" maxW="md">
          {description}
        </Text>
      )}
      {action && (
        <Button onClick={action.onClick} mt={2}>
          {action.label}
        </Button>
      )}
    </VStack>
  );
};

// Common empty states
export const NoContentEmptyState = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<span>📝</span>}
    title="لا يوجد محتوى"
    description="لم يتم العثور على أي محتوى. ابدأ بإضافة محتوى جديد."
    action={onAdd ? { label: 'إضافة محتوى', onClick: onAdd } : undefined}
  />
);

export const NoResultsEmptyState = ({ onClear }: { onClear?: () => void }) => (
  <EmptyState
    icon={<span>🔍</span>}
    title="لا توجد نتائج"
    description="لم يتم العثور على نتائج مطابقة لبحثك. جرب تغيير معايير البحث."
    action={onClear ? { label: 'مسح البحث', onClick: onClear } : undefined}
  />
);

export const ErrorEmptyState = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon={<span>⚠️</span>}
    title="حدث خطأ"
    description="عذراً، حدث خطأ أثناء تحميل المحتوى. يرجى المحاولة مرة أخرى."
    action={onRetry ? { label: 'إعادة المحاولة', onClick: onRetry } : undefined}
  />
);
