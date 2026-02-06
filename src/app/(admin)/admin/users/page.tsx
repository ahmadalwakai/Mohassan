import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function AdminUsersPage() {
  return (
    <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
      <VStack gap={6} align="stretch">
        <Heading size="lg" color="text.primary">
          إدارة المستخدمين
        </Heading>
        <Text color="text.secondary">
          إدارة المستخدمين والصلاحيات - قريباً
        </Text>
      </VStack>
    </Box>
  );
}
