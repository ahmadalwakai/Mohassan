'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Container, Heading, Text, VStack, Input, Button, HStack, Separator, Field } from '@chakra-ui/react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    // Client-side validation
    if (password !== confirmPassword) {
      setFormError('كلمات المرور غير متطابقة');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setFormError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'حدث خطأ أثناء إنشاء الحساب');
        return;
      }

      setSuccess(true);
      // Redirect to verify email after successful registration
      setTimeout(() => {
        router.push('/verify-email?newUser=true');
      }, 1500);
    } catch {
      setFormError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    signIn('google', { callbackUrl: '/' });
  };

  if (success) {
    return (
      <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
        <Container maxW="400px">
          <Box bg="bg.secondary" p={8} borderRadius="lg" borderWidth={1} borderColor="brand.glow">
            <VStack gap={4}>
              <Box fontSize="4xl">✓</Box>
              <Heading size="lg" color="text.primary">
                تم إنشاء الحساب بنجاح
              </Heading>
              <Text color="text.secondary" textAlign="center">
                جاري التوجيه للتحقق من البريد الإلكتروني...
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="400px">
        <Box bg="bg.secondary" p={8} borderRadius="lg" borderWidth={1} borderColor="border.default">
          <VStack gap={6} align="stretch">
            <VStack gap={2}>
              <Heading size="lg" color="text.primary">
                إنشاء حساب
              </Heading>
              <Text color="text.secondary">
                أدخل بياناتك لإنشاء حساب جديد
              </Text>
            </VStack>

            {formError && (
              <Box bg="status.error" p={3} borderRadius="md">
                <Text color="text.primary" fontSize="sm">
                  {formError}
                </Text>
              </Box>
            )}

            <VStack gap={4} as="form" onSubmit={handleRegister}>
              <Field.Root>
                <Field.Label color="text.secondary">الاسم الكامل</Field.Label>
                <Input
                  type="text"
                  placeholder="محمد أحمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                <Field.Label color="text.secondary">البريد الإلكتروني</Field.Label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="8 أحرف على الأقل"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="bg.elevated"
                  borderColor="border.default"
                  color="text.primary"
                  _placeholder={{ color: 'text.muted' }}
                  _hover={{ borderColor: 'brand.glow' }}
                  _focus={{ borderColor: 'brand.glow', boxShadow: 'glow' }}
                  required
                  minLength={8}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color="text.secondary">تأكيد كلمة المرور</Field.Label>
                <Input
                  type="password"
                  placeholder="أعد كتابة كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  bg="bg.elevated"
                  borderColor="border.default"
                  color="text.primary"
                  _placeholder={{ color: 'text.muted' }}
                  _hover={{ borderColor: 'brand.glow' }}
                  _focus={{ borderColor: 'brand.glow', boxShadow: 'glow' }}
                  required
                />
              </Field.Root>

              <Button
                type="submit"
                w="full"
                bg="brand.glow"
                color="text.inverse"
                _hover={{ bg: 'brand.glowMuted' }}
                loading={isLoading}
                disabled={isLoading}
              >
                إنشاء حساب
              </Button>
            </VStack>

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
              onClick={handleGoogleRegister}
            >
              التسجيل بـ Google
            </Button>

            <Text color="text.secondary" textAlign="center">
              لديك حساب بالفعل؟{' '}
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
