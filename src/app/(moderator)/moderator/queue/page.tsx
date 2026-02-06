import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function ModeratorQueuePage() {
  return (
    <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
      <VStack gap={6} align="stretch">
        <Heading size="lg" color="text.primary">
          قائمة المراجعة
        </Heading>
        <Text color="text.secondary">
          المحتوى الجديد بانتظار المراجعة - قريباً
        </Text>
      </VStack>
    </Box>
  );
}
