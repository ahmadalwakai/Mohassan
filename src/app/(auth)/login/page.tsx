'use client';

import { useState, Suspense, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Container, Heading, Text, VStack, Input, Button, HStack, Separator, Field } from '@chakra-ui/react';
import Link from 'next/link';
import { loginWithCredentials, loginWithGoogle } from '@/core/auth/actions';

function LoginForm() {
  const searchParams = useSearchParams();
  const cb = searchParams.get('callbackUrl');
  const callbackUrl = cb && cb.startsWith('/') && !cb.startsWith('//') ? cb : '/dashboard';
  const error = searchParams.get('error');
  const registered = searchParams.get('registered');
  
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    
    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', password);
    formData.set('callbackUrl', callbackUrl);
    
    startTransition(async () => {
      const result = await loginWithCredentials(formData);
      if (result?.error) {
        setFormError(result.error);
      }
    });
  };

  const handleGoogleLogin = async () => {
    startTransition(async () => {
      await loginWithGoogle(callbackUrl);
    });
  };

  return (
    <Box bg="bg.secondary" p={8} borderRadius="lg" borderWidth={1} borderColor="border.default">
      <VStack gap={6} align="stretch">
        <VStack gap={2}>
          <Heading size="lg" color="text.primary">
            تسجيل الدخول
          </Heading>
          <Text color="text.secondary">
            أدخل بياناتك للمتابعة
          </Text>
        </VStack>

        {registered && (
          <Box bg="green.900" p={3} borderRadius="md" borderWidth={1} borderColor="brand.glow">
            <Text color="brand.glow" fontSize="sm">
              ✓ تم إنشاء الحساب بنجاح! سجّل الدخول للمتابعة
            </Text>
          </Box>
        )}

        {(error || formError) && (
          <Box bg="status.error" p={3} borderRadius="md">
            <Text color="text.primary" fontSize="sm">
              {formError || (error === 'MissingCSRF' ? 'يرجى المحاولة مرة أخرى' : 'حدث خطأ أثناء تسجيل الدخول')}
            </Text>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <VStack gap={4}>
            <Field.Root>
              <Field.Label color="text.secondary">البريد الإلكتروني</Field.Label>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                bg="bg.elevated"
                borderColor="border.default"
                color="text.primary"
                _placeholder={{ color: 'text.muted' }}
                _hover={{ borderColor: 'brand.glow' }}
                _focus={{ borderColor: 'brand.glow', boxShadow: 'glow' }}
                required
              />
            </Field.Root>
            
            <Field.Root>
              <Field.Label color="text.secondary">كلمة المرور</Field.Label>
              <Input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                bg="bg.elevated"
                borderColor="border.default"
                color="text.primary"
                _placeholder={{ color: 'text.muted' }}
                _hover={{ borderColor: 'brand.glow' }}
                _focus={{ borderColor: 'brand.glow', boxShadow: 'glow' }}
                required
              />
            </Field.Root>

            <Link href="/reset" style={{ alignSelf: 'flex-start' }}>
              <Text color="brand.header" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
                نسيت كلمة المرور؟
              </Text>
            </Link>

            <Button
              type="submit"
              w="full"
              bg="brand.glow"
              color="text.inverse"
              _hover={{ bg: 'brand.glowMuted' }}
              loading={isPending}
              disabled={isPending}
            >
              تسجيل الدخول
            </Button>
          </VStack>
        </form>

        <HStack>
          <Separator flex="1" borderColor="border.default" />
          <Text color="text.muted" fontSize="sm" whiteSpace="nowrap">
            أو
          </Text>
          <Separator flex="1" borderColor="border.default" />
        </HStack>

        <Button
          type="button"
          w="full"
          variant="outline"
          borderColor="border.default"
          color="text.primary"
          _hover={{ borderColor: 'brand.header', bg: 'bg.elevated' }}
          onClick={handleGoogleLogin}
          loading={isPending}
          disabled={isPending}
        >
          تسجيل الدخول بـ Google
        </Button>

        <Text color="text.secondary" textAlign="center">
          ليس لديك حساب؟{' '}
          <Link href="/register">
            <Text as="span" color="brand.header" _hover={{ textDecoration: 'underline' }}>
              إنشاء حساب
            </Text>
          </Link>
        </Text>
      </VStack>
    </Box>
  );
}

function LoginFallback() {
  return (
    <Box bg="bg.secondary" p={8} borderRadius="lg" borderWidth={1} borderColor="border.default">
      <VStack gap={6} align="stretch">
        <VStack gap={2}>
          <Heading size="lg" color="text.primary">
            تسجيل الدخول
          </Heading>
          <Text color="text.secondary">
            جاري التحميل...
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="400px">
        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
      </Container>
    </Box>
  );
}
