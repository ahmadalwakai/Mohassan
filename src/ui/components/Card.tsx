'use client';

import { Box, type BoxProps } from '@chakra-ui/react';

interface CardProps extends BoxProps {
  hoverable?: boolean;
  glowing?: boolean;
}

export function Card({ children, hoverable = false, glowing = false, ...props }: CardProps) {
  return (
    <Box
      bg="bg.secondary"
      borderRadius="lg"
      borderWidth={1}
      borderColor="border.default"
      p={6}
      transition="all 0.2s ease-in-out"
      _hover={
        hoverable
          ? {
              transform: 'translateY(-4px)',
              borderColor: 'brand.glow',
              boxShadow: glowing ? '0 0 20px rgba(0, 255, 0, 0.3)' : undefined,
            }
          : undefined
      }
      {...props}
    >
      {children}
    </Box>
  );
}

export default Card;
