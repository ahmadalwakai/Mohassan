import { Box, Heading, Text, VStack, SimpleGrid } from '@chakra-ui/react';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'المستخدمين', value: '0' },
    { label: 'المحتوى', value: '0' },
    { label: 'البلاغات', value: '0' },
    { label: 'الإجراءات', value: '0' },
  ];

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={4}>
          لوحة تحكم الإدارة
        </Heading>
        <Text color="text.secondary">
          مرحباً بك في لوحة التحكم الإدارية
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
        {stats.map((stat) => (
          <Box
            key={stat.label}
            bg="bg.secondary"
            p={6}
            borderRadius="lg"
            borderWidth={1}
            borderColor="border.default"
            textAlign="center"
          >
            <Text color="text.muted" fontSize="sm" mb={2}>
              {stat.label}
            </Text>
            <Heading size="2xl" color="brand.glow">
              {stat.value}
            </Heading>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
