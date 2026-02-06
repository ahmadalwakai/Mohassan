'use client';

/**
 * Loading Components
 * Spinners and skeleton loaders
 */

import { Box } from '@chakra-ui/react';
import { forwardRef } from 'react';

// Spinner - using CSS animation instead of keyframes
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

const spinnerSizes = {
  sm: { w: 4, h: 4, borderWidth: '2px' },
  md: { w: 6, h: 6, borderWidth: '2px' },
  lg: { w: 8, h: 8, borderWidth: '3px' },
  xl: { w: 12, h: 12, borderWidth: '3px' },
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'brand.500' }, ref) => {
    return (
      <Box
        ref={ref}
        borderRadius="full"
        borderStyle="solid"
        borderColor="gray.700"
        borderTopColor={color}
        animation="spin 0.6s linear infinite"
        css={{
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
        {...spinnerSizes[size]}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

// Loading overlay
export const LoadingOverlay = ({ message = 'جاري التحميل...' }: { message?: string }) => {
  return (
    <Box
      position="fixed"
      inset={0}
      bg="blackAlpha.700"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
    >
      <Spinner size="xl" />
      <Box mt={4} color="white" fontSize="lg">
        {message}
      </Box>
    </Box>
  );
};

// Skeleton - shimmer animation defined via style
import type { BoxProps } from '@chakra-ui/react';

export type SkeletonProps = Omit<BoxProps, 'ref'>;

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ w = 'full', h = 4, borderRadius = 'md', ...rest }, ref) => {
    return (
      <>
        <style jsx global>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
        <Box
          ref={ref}
          w={w}
          h={h}
          borderRadius={borderRadius}
          bg="gray.800"
          backgroundImage="linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)"
          backgroundSize="200% 100%"
          css={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
          {...rest}
        />
      </>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Skeleton Text
export const SkeletonText = ({ lines = 3 }: { lines?: number }) => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          h={3}
          w={i === lines - 1 ? '70%' : 'full'}
        />
      ))}
    </Box>
  );
};

// Content Card Skeleton
export const ContentCardSkeleton = () => {
  return (
    <Box
      bg="gray.800"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.700"
      overflow="hidden"
    >
      <Skeleton h="180px" borderRadius="none" />
      <Box p={4}>
        <Skeleton h={5} w="80%" mb={3} />
        <SkeletonText lines={2} />
        <Box display="flex" alignItems="center" gap={3} mt={4}>
          <Skeleton w={8} h={8} borderRadius="full" />
          <Skeleton w="30%" h={3} />
        </Box>
      </Box>
    </Box>
  );
};
