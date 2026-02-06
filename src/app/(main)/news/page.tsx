/**
 * News Section Page
 */

import { Metadata } from 'next';
import { Box, Container, VStack, Text } from '@chakra-ui/react';
import { ContentList } from '@/components/content';

export const metadata: Metadata = {
  title: 'الأخبار',
  description: 'آخر الأخبار والمستجدات في مجتمع موحسن',
};

export default function NewsPage() {
  return (
    <Box py={8}>
      <Container maxW="7xl">
        <VStack align="stretch" gap={8}>
          {/* Header */}
          <Box>
            <Text fontSize="3xl" fontWeight="bold" color="white" mb={2}>
              📰 الأخبار
            </Text>
            <Text color="gray.400">
              آخر الأخبار والمستجدات من المجتمع
            </Text>
          </Box>

          {/* Content List */}
          <ContentList
            type="news"
            showSearch
            showFilters
            columns={{ base: 1, sm: 2, lg: 3 }}
          />
        </VStack>
      </Container>
    </Box>
  );
}
