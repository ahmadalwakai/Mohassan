import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';

export default function VerifyPage() {
  return (
    <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="400px">
        <Box bg="bg.secondary" p={8} borderRadius="lg" borderWidth={1} borderColor="border.default" textAlign="center">
          <VStack gap={6}>
            <Heading size="lg" color="text.primary">
              تأكيد البريد الإلكتروني
            </Heading>
            <Text color="text.secondary">
              تم إرسال رابط التأكيد إلى بريدك الإلكتروني. 
              يرجى التحقق من بريدك والنقر على الرابط لتفعيل حسابك.
            </Text>
            <Text color="text.muted" fontSize="sm">
              لم تستلم الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
