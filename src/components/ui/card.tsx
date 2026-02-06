'use client';

/**
 * Card Component
 * Reusable card with dark theme styling
 */

import { Box, BoxProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface CardProps extends BoxProps {
  variant?: 'default' | 'elevated' | 'outline' | 'glow';
  isHoverable?: boolean;
  isClickable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', isHoverable = false, isClickable = false, children, ...props }, ref) => {
    const baseStyles = {
      bg: 'gray.800',
      borderRadius: 'xl',
      overflow: 'hidden',
    };

    const variantStyles = {
      default: {
        border: '1px solid',
        borderColor: 'gray.700',
      },
      elevated: {
        boxShadow: 'xl',
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        border: '1px solid',
        borderColor: 'gray.600',
      },
      glow: {
        border: '1px solid',
        borderColor: 'brand.500',
        boxShadow: '0 0 20px rgba(0, 255, 0, 0.1)',
      },
    };

    const interactionStyles = {
      ...(isHoverable && {
        transition: 'all 0.2s',
        _hover: {
          borderColor: 'brand.500',
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
      }),
      ...(isClickable && {
        cursor: 'pointer',
        transition: 'all 0.2s',
        _hover: {
          borderColor: 'brand.500',
        },
        _active: {
          transform: 'scale(0.98)',
        },
      }),
    };

    return (
      <Box
        ref={ref}
        {...baseStyles}
        {...variantStyles[variant]}
        {...interactionStyles}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
export const CardHeader = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, ...props }, ref) => (
    <Box
      ref={ref}
      px={6}
      py={4}
      borderBottom="1px solid"
      borderColor="gray.700"
      {...props}
    >
      {children}
    </Box>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, ...props }, ref) => (
    <Box ref={ref} p={6} {...props}>
      {children}
    </Box>
  )
);

CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, ...props }, ref) => (
    <Box
      ref={ref}
      px={6}
      py={4}
      borderTop="1px solid"
      borderColor="gray.700"
      {...props}
    >
      {children}
    </Box>
  )
);

CardFooter.displayName = 'CardFooter';
