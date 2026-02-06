'use client';

/**
 * Badge Component
 * Status badges and tags
 */

import { Box, BoxProps } from '@chakra-ui/react';
import { forwardRef, ReactNode } from 'react';

export interface BadgeProps extends BoxProps {
  variant?: 'solid' | 'outline' | 'subtle';
  colorScheme?: 'brand' | 'gray' | 'red' | 'yellow' | 'green' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const colorSchemes = {
  brand: {
    solid: { bg: 'brand.500', color: 'black' },
    outline: { borderColor: 'brand.500', color: 'brand.400' },
    subtle: { bg: 'brand.900', color: 'brand.300' },
  },
  gray: {
    solid: { bg: 'gray.600', color: 'white' },
    outline: { borderColor: 'gray.500', color: 'gray.400' },
    subtle: { bg: 'gray.800', color: 'gray.300' },
  },
  red: {
    solid: { bg: 'red.600', color: 'white' },
    outline: { borderColor: 'red.500', color: 'red.400' },
    subtle: { bg: 'red.900', color: 'red.300' },
  },
  yellow: {
    solid: { bg: 'yellow.500', color: 'black' },
    outline: { borderColor: 'yellow.500', color: 'yellow.400' },
    subtle: { bg: 'yellow.900', color: 'yellow.300' },
  },
  green: {
    solid: { bg: 'green.600', color: 'white' },
    outline: { borderColor: 'green.500', color: 'green.400' },
    subtle: { bg: 'green.900', color: 'green.300' },
  },
  blue: {
    solid: { bg: 'blue.600', color: 'white' },
    outline: { borderColor: 'blue.500', color: 'blue.400' },
    subtle: { bg: 'blue.900', color: 'blue.300' },
  },
};

const sizes = {
  sm: { px: 2, py: 0.5, fontSize: 'xs' },
  md: { px: 3, py: 1, fontSize: 'sm' },
  lg: { px: 4, py: 1.5, fontSize: 'md' },
};

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'subtle', colorScheme = 'brand', size = 'md', children, ...props }, ref) => {
    const colors = colorSchemes[colorScheme][variant];
    const sizeStyles = sizes[size];

    return (
      <Box
        ref={ref}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="full"
        fontWeight="medium"
        border={variant === 'outline' ? '1px solid' : 'none'}
        {...colors}
        {...sizeStyles}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Badge.displayName = 'Badge';

// Content status badge helper
export const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { colorScheme: BadgeProps['colorScheme']; label: string }> = {
    draft: { colorScheme: 'gray', label: 'مسودة' },
    pending: { colorScheme: 'yellow', label: 'قيد المراجعة' },
    published: { colorScheme: 'green', label: 'منشور' },
    rejected: { colorScheme: 'red', label: 'مرفوض' },
    archived: { colorScheme: 'gray', label: 'مؤرشف' },
    // Support uppercase as well
    DRAFT: { colorScheme: 'gray', label: 'مسودة' },
    PENDING: { colorScheme: 'yellow', label: 'قيد المراجعة' },
    PUBLISHED: { colorScheme: 'green', label: 'منشور' },
    REJECTED: { colorScheme: 'red', label: 'مرفوض' },
    ARCHIVED: { colorScheme: 'gray', label: 'مؤرشف' },
  };

  const config = statusConfig[status] || { colorScheme: 'gray', label: status };

  return (
    <Badge colorScheme={config.colorScheme} size="sm">
      {config.label}
    </Badge>
  );
};
