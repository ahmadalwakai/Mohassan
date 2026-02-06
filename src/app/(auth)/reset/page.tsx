'use client';

import { Box, Container, Heading, Text, VStack, Input, Button, Field } from '@chakra-ui/react';
import Link from 'next/link';

export default function ResetPage() {
  return (
    <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="400px">
        <Box bg="bg.secondary" p={8} borderRadius="lg" borderWidth={1} borderColor="border.default">
          <VStack gap={6} align="stretch">
            <VStack gap={2}>
              <Heading size="lg" color="text.primary">
                استعادة كلمة المرور
              </Heading>
              <Text color="text.secondary">
                أدخل بريدك الإلكتروني لاستلام رابط إعادة تعيين كلمة المرور
              </Text>
            </VStack>

            <VStack gap={4} as="form">
              <Field.Root>
                <Field.Label color="text.secondary">البريد الإلكتروني</Field.Label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  bg="bg.elevated"
                  borderColor="border.default"
                  color="text.primary"
                  _placeholder={{ color: 'text.muted' }}
                  _hover={{ borderColor: 'brand.glow' }}
                  _focus={{ borderColor: 'brand.glow', boxShadow: 'glow' }}
                />
              </Field.Root>

              <Button
                type="submit"
                w="full"
                bg="brand.glow"
                color="text.inverse"
                _hover={{ bg: 'brand.glowMuted' }}
              >
                إرسال رابط الاستعادة
              </Button>
            </VStack>

            <Text color="text.secondary" textAlign="center">
              تذكرت كلمة المرور؟{' '}
              <Link href="/login">
                <Text as="span" color="brand.header" _hover={{ textDecoration: 'underline' }}>
                  تسجيل الدخول
                </Text>
              </Link>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
