/**
 * Directory Section Page
 */

import { Metadata } from 'next';
import { Box, Container, VStack, Text } from '@chakra-ui/react';
import { ContentList } from '@/components/content';

export const metadata: Metadata = {
  title: 'الدليل',
  description: 'دليل الخدمات والمؤسسات في مجتمع موحسن',
};

export default function DirectoryPage() {
  return (
    <Box py={8}>
      <Container maxW="7xl">
        <VStack align="stretch" gap={8}>
          {/* Header */}
          <Box>
            <Text fontSize="3xl" fontWeight="bold" color="white" mb={2}>
              📋 الدليل
            </Text>
            <Text color="gray.400">
              دليل الخدمات والمؤسسات والشركات
            </Text>
          </Box>

          {/* Content List */}
          <ContentList
            type="directory"
            showSearch
            showFilters
            columns={{ base: 1, sm: 2, lg: 3 }}
          />
        </VStack>
      </Container>
    </Box>
  );
}
