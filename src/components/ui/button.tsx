'use client';

/**
 * Custom Button Component
 * Extends Chakra UI Button with Mohassan styling
 */

import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

// Custom variant types for our design system
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<ChakraButtonProps, 'variant'> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantStyles = {
  primary: {
    bg: 'brand.500',
    color: 'white',
    _hover: { bg: 'brand.600', transform: 'translateY(-1px)' },
    _active: { bg: 'brand.700' },
  },
  secondary: {
    bg: 'gray.700',
    color: 'white',
    _hover: { bg: 'gray.600' },
    _active: { bg: 'gray.800' },
  },
  outline: {
    bg: 'transparent',
    color: 'brand.400',
    border: '1px solid',
    borderColor: 'brand.400',
    _hover: { bg: 'brand.400', color: 'white' },
  },
  ghost: {
    bg: 'transparent',
    color: 'gray.300',
    _hover: { bg: 'whiteAlpha.100' },
  },
  danger: {
    bg: 'red.600',
    color: 'white',
    _hover: { bg: 'red.700' },
    _active: { bg: 'red.800' },
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, ...props }, ref) => {
    return (
      <ChakraButton
        ref={ref}
        px={6}
        py={2}
        borderRadius="lg"
        fontWeight="medium"
        transition="all 0.2s"
        {...variantStyles[variant]}
        {...props}
      >
        {children}
      </ChakraButton>
    );
  }
);

Button.displayName = 'Button';
