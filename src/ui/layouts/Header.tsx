'use client';

import { Box, Container, Heading, HStack, Button } from '@chakra-ui/react';
import Link from 'next/link';

interface HeaderProps {
  variant?: 'default' | 'admin' | 'moderator';
}

export function Header({ variant = 'default' }: HeaderProps) {
  const bgColor = {
    default: 'brand.header',
    admin: 'status.error',
    moderator: 'status.warning',
  }[variant];

  const textColor = variant === 'moderator' ? 'text.inverse' : 'text.primary';

  return (
    <Box as="header" bg={bgColor} py={4} px={6}>
      <Container maxW="container.xl">
        <HStack justify="space-between" align="center">
          <Link href="/">
            <Heading size="lg" color={textColor}>
              موحسن
            </Heading>
          </Link>
          <HStack gap={4}>
            <Link href="/login">
              <Button variant="ghost" color={textColor}>
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/register">
              <Button bg="brand.glow" color="text.inverse" _hover={{ bg: 'brand.glowMuted' }}>
                إنشاء حساب
              </Button>
            </Link>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}

export default Header;
