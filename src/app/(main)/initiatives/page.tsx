/**
 * Initiatives Section Page
 */

import { Metadata } from 'next';
import { Box, Container, VStack, Text } from '@chakra-ui/react';
import { ContentList } from '@/components/content';

export const metadata: Metadata = {
  title: 'المبادرات',
  description: 'المبادرات والتطوع في مجتمع موحسن',
};

export default function InitiativesPage() {
  return (
    <Box py={8}>
      <Container maxW="7xl">
        <VStack align="stretch" gap={8}>
          {/* Header */}
          <Box>
            <Text fontSize="3xl" fontWeight="bold" color="white" mb={2}>
              🌟 المبادرات
            </Text>
            <Text color="gray.400">
              مبادرات مجتمعية وفرص تطوع
            </Text>
          </Box>

          {/* Content List */}
          <ContentList
            type="initiative"
            showSearch
            showFilters
            columns={{ base: 1, md: 2, lg: 3 }}
          />
        </VStack>
      </Container>
    </Box>
  );
}
