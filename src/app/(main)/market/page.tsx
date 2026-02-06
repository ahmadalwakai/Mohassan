/**
 * Market Section Page
 */

import { Metadata } from 'next';
import { Box, Container, VStack, Text } from '@chakra-ui/react';
import { ContentList } from '@/components/content';

export const metadata: Metadata = {
  title: 'السوق',
  description: 'سوق البيع والشراء في مجتمع موحسن',
};

export default function MarketPage() {
  return (
    <Box py={8}>
      <Container maxW="7xl">
        <VStack align="stretch" gap={8}>
          {/* Header */}
          <Box>
            <Text fontSize="3xl" fontWeight="bold" color="white" mb={2}>
              🛒 السوق
            </Text>
            <Text color="gray.400">
              إعلانات البيع والشراء والخدمات
            </Text>
          </Box>

          {/* Content List */}
          <ContentList
            type="market"
            showSearch
            showFilters
            columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
          />
        </VStack>
      </Container>
    </Box>
  );
}
