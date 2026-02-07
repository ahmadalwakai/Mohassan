'use client';

import { Box, Heading, Text, VStack, Center } from '@chakra-ui/react';

export default function DashboardSavedPage() {
  return (
    <Box>
      {/* Header */}
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" mb={6}>
        <Heading size="lg" color="text.primary">
          المحفوظات
        </Heading>
        <Text color="text.secondary" mt={2}>
          المحتوى الذي قمت بحفظه للرجوع إليه لاحقاً
        </Text>
      </Box>

      {/* Empty State */}
      <Box bg="bg.secondary" p={8} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Center>
          <VStack gap={4}>
            <Text fontSize="4xl">⭐</Text>
            <Heading size="md" color="text.primary">
              لا توجد محفوظات بعد
            </Heading>
            <Text color="text.secondary" textAlign="center" maxW="md">
              عند تصفح المحتوى، يمكنك حفظ المقالات والمنشورات المهمة للرجوع إليها لاحقاً.
              ستظهر هنا جميع العناصر المحفوظة.
            </Text>
          </VStack>
        </Center>
      </Box>
    </Box>
  );
}
