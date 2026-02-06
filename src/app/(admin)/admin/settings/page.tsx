import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function AdminSettingsPage() {
  return (
    <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
      <VStack gap={6} align="stretch">
        <Heading size="lg" color="text.primary">
          إعدادات النظام
        </Heading>
        <Text color="text.secondary">
          إدارة إعدادات المنصة - قريباً
        </Text>
      </VStack>
    </Box>
  );
}
