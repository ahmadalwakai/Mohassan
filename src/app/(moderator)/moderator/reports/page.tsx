import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function ModeratorReportsPage() {
  return (
    <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
      <VStack gap={6} align="stretch">
        <Heading size="lg" color="text.primary">
          البلاغات
        </Heading>
        <Text color="text.secondary">
          البلاغات المقدمة من المستخدمين - قريباً
        </Text>
      </VStack>
    </Box>
  );
}
