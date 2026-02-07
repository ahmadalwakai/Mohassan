'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Heading, Text, VStack, Button } from '@chakra-ui/react';

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: 'رابط التحقق غير صالح. يرجى طلب رابط جديد.',
  invalid_token: 'رابط التحقق غير صالح أو تم استخدامه مسبقاً. يرجى طلب رابط جديد.',
  expired_token: 'انتهت صلاحية رابط التحقق. يرجى طلب رابط جديد.',
  server_error: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.',
};

export default function VerifyEmailContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get('newUser') === 'true';
  const errorCode = searchParams.get('error');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // If user is already verified, redirect to home
  if (status === 'authenticated' && session?.user?.emailVerified) {
    router.push('/');
    return null;
  }

  // If there's an error, show the error page (even for unauthenticated users)
  const hasError = !!errorCode;

  // If not authenticated, not a new user, AND no error, redirect to login
  if (status === 'unauthenticated' && !isNewUser && !hasError) {
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
        <Box bg="bg.secondary" p={8} borderRadius="lg" borderWidth={1} borderColor={hasError ? 'red.500' : 'border.default'}>
          <VStack gap={6}>
            <Box fontSize="5xl">{hasError ? '❌' : '📧'}</Box>
            
            <VStack gap={2}>
              <Heading size="lg" color="text.primary" textAlign="center">
                {hasError ? 'خطأ في التحقق' : 'تأكيد البريد الإلكتروني'}
              </Heading>
              <Text color="text.secondary" textAlign="center">
                {hasError 
                  ? (ERROR_MESSAGES[errorCode as string] || 'حدث خطأ غير متوقع') 
                  : 'لقد أرسلنا رسالة تحقق إلى بريدك الإلكتروني'
                }
              </Text>
              {!hasError && session?.user?.email && (
                <Text color="brand.glow" fontWeight="bold" fontSize="lg">
                  {session.user.email}
                </Text>
              )}
            </VStack>

            {!hasError && (
              <Text color="text.muted" textAlign="center" fontSize="sm">
                يرجى التحقق من صندوق الوارد (وصندوق الرسائل غير المرغوب فيها) والنقر على رابط التحقق لتفعيل حسابك
              </Text>
            )}

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
              {/* Show resend button if user is authenticated OR if there's an error (so they can request new link) */}
              {(status === 'authenticated' || hasError) && (
                <Button
                  w="full"
                  variant="outline"
                  borderColor="border.default"
                  color="text.primary"
                  _hover={{ borderColor: 'brand.glow', bg: 'bg.elevated' }}
                  onClick={handleResendEmail}
                  loading={isResending}
                  disabled={isResending || resendSuccess || (status !== 'authenticated')}
                >
                  {status === 'authenticated' ? 'إعادة إرسال رسالة التحقق' : 'سجّل الدخول لإرسال رسالة جديدة'}
                </Button>
              )}

              <Button
                w="full"
                bg="brand.glow"
                color="text.inverse"
                _hover={{ bg: 'brand.glowMuted' }}
                onClick={() => router.push(hasError ? '/login' : (isNewUser ? '/login' : '/'))}
              >
                {hasError ? 'تسجيل الدخول' : (isNewUser ? 'الذهاب لتسجيل الدخول' : 'العودة للصفحة الرئيسية')}
              </Button>
            </VStack>

            {!hasError && (
              <Text color="text.muted" fontSize="xs" textAlign="center">
                ملاحظة: لن تتمكن من نشر المحتوى حتى يتم تأكيد بريدك الإلكتروني
              </Text>
            )}
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
