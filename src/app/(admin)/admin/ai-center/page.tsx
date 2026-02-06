import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function AdminAICenterPage() {
  return (
    <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
      <VStack gap={6} align="stretch">
        <Heading size="lg" color="text.primary">
          مركز الذكاء الاصطناعي
        </Heading>
        <Text color="text.secondary">
          إدارة إعدادات ونماذج الذكاء الاصطناعي - قريباً
        </Text>
      </VStack>
    </Box>
  );
}
