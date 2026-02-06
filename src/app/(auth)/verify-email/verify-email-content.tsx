'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Heading, Text, VStack, Button } from '@chakra-ui/react';

export default function VerifyEmailContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get('newUser') === 'true';
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // If user is already verified, redirect to home
  if (status === 'authenticated' && session?.user?.emailVerified) {
    router.push('/');
    return null;
  }

  // If not authenticated and not a new user, redirect to login
  if (status === 'unauthenticated' && !isNewUser) {
    router.push('/login');
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setResendError(data.error || 'حدث خطأ أثناء إرسال رسالة التحقق');
        return;
      }

      setResendSuccess(true);
    } catch {
      setResendError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
        <Text color="text.secondary">جاري التحميل...</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="500px">
        <Box bg="bg.secondary" p={8} borderRadius="lg" borderWidth={1} borderColor="border.default">
          <VStack gap={6}>
            <Box fontSize="5xl">📧</Box>
            
            <VStack gap={2}>
              <Heading size="lg" color="text.primary" textAlign="center">
                تأكيد البريد الإلكتروني
              </Heading>
              <Text color="text.secondary" textAlign="center">
                لقد أرسلنا رسالة تحقق إلى بريدك الإلكتروني
              </Text>
              {session?.user?.email && (
                <Text color="brand.glow" fontWeight="bold" fontSize="lg">
                  {session.user.email}
                </Text>
              )}
            </VStack>

            <Text color="text.muted" textAlign="center" fontSize="sm">
              يرجى التحقق من صندوق الوارد (وصندوق الرسائل غير المرغوب فيها) والنقر على رابط التحقق لتفعيل حسابك
            </Text>

            {resendSuccess && (
              <Box bg="status.success" p={3} borderRadius="md" w="full">
                <Text color="text.primary" fontSize="sm" textAlign="center">
                  تم إرسال رسالة التحقق بنجاح
                </Text>
              </Box>
            )}

            {resendError && (
              <Box bg="status.error" p={3} borderRadius="md" w="full">
                <Text color="text.primary" fontSize="sm" textAlign="center">
                  {resendError}
                </Text>
              </Box>
            )}

            <VStack gap={3} w="full">
              <Button
                w="full"
                variant="outline"
                borderColor="border.default"
                color="text.primary"
                _hover={{ borderColor: 'brand.glow', bg: 'bg.elevated' }}
                onClick={handleResendEmail}
                loading={isResending}
                disabled={isResending || resendSuccess}
              >
                إعادة إرسال رسالة التحقق
              </Button>

              <Button
                w="full"
                bg="brand.glow"
                color="text.inverse"
                _hover={{ bg: 'brand.glowMuted' }}
                onClick={() => router.push(isNewUser ? '/login' : '/')}
              >
                {isNewUser ? 'الذهاب لتسجيل الدخول' : 'العودة للصفحة الرئيسية'}
              </Button>
            </VStack>

            <Text color="text.muted" fontSize="xs" textAlign="center">
              ملاحظة: لن تتمكن من نشر المحتوى حتى يتم تأكيد بريدك الإلكتروني
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
