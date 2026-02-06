import { Box, Heading, Text, VStack, SimpleGrid } from '@chakra-ui/react';

export default function ModeratorDashboardPage() {
  const stats = [
    { label: 'في قائمة المراجعة', value: '0' },
    { label: 'البلاغات الجديدة', value: '0' },
    { label: 'إجراءات اليوم', value: '0' },
  ];

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={4}>
          لوحة الإشراف
        </Heading>
        <Text color="text.secondary">
          مرحباً بك في لوحة الإشراف
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
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
            <Heading size="2xl" color="status.warning">
              {stat.value}
            </Heading>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
