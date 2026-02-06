'use client';

/**
 * Card Component
 * Glass morphism card with Orange + Purple theme
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
      bg: 'rgba(255,255,255,0.06)',
      borderRadius: 'xl',
      overflow: 'hidden',
      border: '1px solid rgba(249,115,22,0.35)',
      backdropFilter: 'blur(10px)',
      position: 'relative' as const,
      boxShadow: '0 0 12px rgba(249,115,22,0.15), 0 0 4px rgba(249,115,22,0.1)',
    };

    const variantStyles = {
      default: {},
      elevated: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 16px rgba(249,115,22,0.18)',
      },
      outline: {
        bg: 'rgba(255,255,255,0.02)',
      },
      glow: {
        border: '1px solid rgba(249,115,22,0.5)',
        background: 'radial-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(124,58,237,0.06) 100%), rgba(255,255,255,0.06)',
        boxShadow: '0 0 24px rgba(249,115,22,0.25), 0 0 12px rgba(249,115,22,0.18)',
      },
    };

    const interactionStyles = {
      ...(isHoverable && {
        transition: 'all 200ms ease-in-out',
        _hover: {
          transform: 'translateY(-4px) rotateX(1.5deg) rotateY(-1.5deg)',
          borderColor: 'rgba(124,58,237,0.4)',
          boxShadow: '0 0 18px rgba(124,58,237,0.22)',
        },
      }),
      ...(isClickable && {
        cursor: 'pointer',
        transition: 'all 200ms ease-in-out',
        _hover: {
          borderColor: 'rgba(124,58,237,0.4)',
        },
        _active: {
          transform: 'scale(0.98)',
        },
      }),
      _focusVisible: {
        outline: '3px solid rgba(124,58,237,0.30)',
        outlineOffset: '2px',
      },
    };

    return (
      <Box
        ref={ref}
        {...baseStyles}
        {...variantStyles[variant]}
        {...interactionStyles}
        {...props}
      >
        {/* Inner highlight */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="1px"
          background="linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0))"
          pointerEvents="none"
        />
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
      borderBottom="1px solid rgba(255,255,255,0.08)"
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
      borderTop="1px solid rgba(255,255,255,0.08)"
      {...props}
    >
      {children}
    </Box>
  )
);

CardFooter.displayName = 'CardFooter';
