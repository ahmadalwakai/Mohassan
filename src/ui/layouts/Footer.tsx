'use client';

import { Box, Container, VStack, Text, HStack } from '@chakra-ui/react';
import Link from 'next/link';

export function Footer() {
  return (
    <Box as="footer" bg="brand.footer" py={8} mt="auto">
      <Container maxW="container.xl">
        <VStack gap={4}>
          <HStack gap={6}>
            <Link href="/news">
              <Text color="text.secondary" _hover={{ color: 'text.primary' }}>
                الأخبار
              </Text>
            </Link>
            <Link href="/directory">
              <Text color="text.secondary" _hover={{ color: 'text.primary' }}>
                الدليل
              </Text>
            </Link>
            <Link href="/market">
              <Text color="text.secondary" _hover={{ color: 'text.primary' }}>
                السوق
              </Text>
            </Link>
            <Link href="/community">
              <Text color="text.secondary" _hover={{ color: 'text.primary' }}>
                المجتمع
              </Text>
            </Link>
          </HStack>
          <Text color="text.muted" fontSize="sm">
            © 2026 موحسن - جميع الحقوق محفوظة
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

export default Footer;
