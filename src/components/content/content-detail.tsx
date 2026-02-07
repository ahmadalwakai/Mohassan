/**
 * Content Detail Component
 * Shared component for displaying content detail pages
 */

import { notFound } from 'next/navigation';
import { Box, Container, VStack, HStack, Text, Image, SimpleGrid } from '@chakra-ui/react';
import Link from 'next/link';
import { contentService } from '@/core/services';
import { Card, CardBody, Badge, Avatar, Button } from '@/components/ui';
import { ContentCard } from '@/components/content';
import { InitiativeJoinButton } from '@/components/content/initiative-join-button';
import { formatDistanceToNow, format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ContentDetailProps {
  id: string;
}

const typeConfig: Record<string, { label: string; color: string; href: string }> = {
  news: { label: 'خبر', color: 'blue', href: '/news' },
  directory: { label: 'دليل', color: 'green', href: '/directory' },
  market: { label: 'إعلان', color: 'yellow', href: '/market' },
  community: { label: 'مجتمع', color: 'brand', href: '/community' },
  initiative: { label: 'مبادرة', color: 'brand', href: '/initiatives' },
};

export async function ContentDetail({ id }: ContentDetailProps) {
  // Get content with view increment
  const content = await contentService.getOne(id, true);

  if (!content || content.status !== 'PUBLISHED') {
    notFound();
  }

  // Get related content
  const related = await contentService.list(
    { type: content.type as 'news' | 'directory' | 'market' | 'community' | 'initiative', status: 'PUBLISHED' },
    { page: 1, limit: 3 }
  );
  const relatedItems = related.items.filter((item) => item.id !== content.id);

  const typeInfo = typeConfig[content.type] || { label: content.type, color: 'gray', href: '#' };

  const timeAgo = formatDistanceToNow(new Date(content.createdAt), {
    addSuffix: true,
    locale: ar,
  });

  const fullDate = format(new Date(content.createdAt), 'dd MMMM yyyy', {
    locale: ar,
  });

  return (
    <Box py={8}>
      <Container maxW="4xl">
        <VStack align="stretch" gap={8}>
          {/* Breadcrumb */}
          <HStack gap={2} fontSize="sm" color="gray.500">
            <Link href="/">
              <Text _hover={{ color: 'brand.400' }}>الرئيسية</Text>
            </Link>
            <Text>/</Text>
            <Link href={typeInfo.href}>
              <Text _hover={{ color: 'brand.400' }}>{typeInfo.label}</Text>
            </Link>
            <Text>/</Text>
            <Text color="gray.400" lineClamp={1}>{content.title}</Text>
          </HStack>

          {/* Header */}
          <Box>
            <HStack gap={2} mb={4}>
              <Badge colorScheme={typeInfo.color as 'brand'}>
                {typeInfo.label}
              </Badge>
              {content.tags && content.tags.length > 0 && (
                <>
                  {content.tags.slice(0, 3).map((tagItem) => (
                    <Badge key={tagItem.tag.id} variant="outline" colorScheme="gray" size="sm">
                      #{tagItem.tag.name}
                    </Badge>
                  ))}
                </>
              )}
            </HStack>

            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="white" mb={4}>
              {content.title}
            </Text>

            {/* Author & Meta */}
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <HStack gap={3}>
                <Avatar
                  src={content.author.image}
                  name={content.author.name}
                  size="md"
                />
                <VStack align="start" gap={0}>
                  <Text color="white" fontWeight="medium">
                    {content.author.name || 'مستخدم'}
                  </Text>
                  <HStack gap={2} fontSize="sm" color="gray.500">
                    <Text>{fullDate}</Text>
                    <Text>•</Text>
                    <Text>{timeAgo}</Text>
                  </HStack>
                </VStack>
              </HStack>

              <HStack gap={2} fontSize="sm" color="gray.500">
                <Text>👁 {content.viewCount || 0} مشاهدة</Text>
              </HStack>
            </HStack>
          </Box>

          {/* Featured Image */}
          {content.image && (
            <Box borderRadius="xl" overflow="hidden">
              <Image
                src={content.image}
                alt={content.title}
                w="full"
                maxH="500px"
                objectFit="cover"
              />
            </Box>
          )}

          {/* Content Body */}
          <Card>
            <CardBody>
              <Box
                className="prose prose-invert max-w-none"
                color="gray.300"
                lineHeight="tall"
                fontSize="lg"
                css={{
                  '& p': { marginBottom: '1rem' },
                  '& h2': { fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginTop: '1.5rem', marginBottom: '0.75rem' },
                  '& h3': { fontSize: '1.125rem', fontWeight: '600', color: 'white', marginTop: '1rem', marginBottom: '0.5rem' },
                  '& ul, & ol': { paddingRight: '1.5rem', marginBottom: '1rem' },
                  '& li': { marginBottom: '0.5rem' },
                  '& a': { color: 'var(--chakra-colors-brand-400, #60A5FA)', textDecoration: 'underline' },
                  '& blockquote': {
                    borderRight: '4px solid var(--chakra-colors-brand-500, #4169E1)',
                    paddingRight: '1rem',
                    fontStyle: 'italic',
                    color: 'var(--chakra-colors-gray-400, #9CA3AF)',
                  },
                }}
                dangerouslySetInnerHTML={{ __html: content.body || '' }}
              />
            </CardBody>
          </Card>

          {/* Actions */}
          <HStack gap={3} justify="center" flexWrap="wrap">
            <Button variant="outline">
              📤 مشاركة
            </Button>
            <Button variant="ghost">
              ⭐ حفظ
            </Button>
            {content.type === 'initiative' && (
              <InitiativeJoinButton initiativeId={content.id} ownerId={content.authorId} />
            )}
            <Button variant="ghost" color="red.400">
              ⚠️ إبلاغ
            </Button>
          </HStack>

          {/* Related Content */}
          {relatedItems.length > 0 && (
            <Box mt={8}>
              <Text fontSize="xl" fontWeight="bold" color="white" mb={6}>
                محتوى مشابه
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                {relatedItems.map((item) => (
                  <ContentCard
                    key={item.id}
                    id={item.id}
                    type={item.type}
                    title={item.title}
                    excerpt={item.excerpt}
                    image={item.image}
                    status={item.status}
                    author={{
                      id: item.author.id,
                      name: item.author.name,
                      image: item.author.image,
                    }}
                    createdAt={item.createdAt}
                    viewCount={item.viewCount}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

// Export content data fetcher for metadata generation
export async function getContentData(id: string) {
  return contentService.getOne(id);
}
