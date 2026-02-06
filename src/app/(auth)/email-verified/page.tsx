'use client';

import { useRouter } from 'next/navigation';
import { Box, Container, Heading, Text, VStack, Button } from '@chakra-ui/react';

export default function EmailVerifiedPage() {
  const router = useRouter();

  return (
    <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="500px">
        <Box bg="bg.secondary" p={8} borderRadius="lg" borderWidth={1} borderColor="brand.glow">
          <VStack gap={6}>
            <Box fontSize="5xl">✅</Box>
            
            <VStack gap={2}>
              <Heading size="lg" color="text.primary" textAlign="center">
                تم تأكيد بريدك الإلكتروني!
              </Heading>
              <Text color="text.secondary" textAlign="center">
                يمكنك الآن نشر المحتوى والمشاركة في مجتمع موحسن
              </Text>
            </VStack>

            <VStack gap={3} w="full">
              <Button
                w="full"
                bg="brand.glow"
                color="text.inverse"
                _hover={{ bg: 'brand.glowMuted' }}
                onClick={() => router.push('/')}
              >
                الانتقال للصفحة الرئيسية
              </Button>

              <Button
                w="full"
                variant="outline"
                borderColor="border.default"
                color="text.primary"
                _hover={{ borderColor: 'brand.glow', bg: 'bg.elevated' }}
                onClick={() => router.push('/content/new')}
              >
                نشر محتوى جديد
              </Button>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
