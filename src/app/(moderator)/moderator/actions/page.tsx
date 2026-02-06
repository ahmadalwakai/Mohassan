import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function ModeratorActionsPage() {
  return (
    <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
      <VStack gap={6} align="stretch">
        <Heading size="lg" color="text.primary">
          سجل الإجراءات
        </Heading>
        <Text color="text.secondary">
          سجل إجراءات الإشراف السابقة - قريباً
        </Text>
      </VStack>
    </Box>
  );
}
