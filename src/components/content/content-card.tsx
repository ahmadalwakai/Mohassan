'use client';

/**
 * Content Card Component
 * Reusable card for displaying content items
 */

import { Box, HStack, VStack, Text, Image } from '@chakra-ui/react';
import Link from 'next/link';
import { Card, Badge, Avatar, StatusBadge } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export interface ContentCardProps {
  id: string;
  type: string;
  title: string;
  excerpt?: string | null;
  image?: string | null;
  status?: string;
  author: {
    id: string;
    name: string | null;
    image?: string | null;
  };
  createdAt: string | Date;
  viewCount?: number;
  tags?: Array<{ tag: { id: string; name: string; slug: string } }>;
  showStatus?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const typeConfig: Record<string, { label: string; color: string; href: string }> = {
  news: { label: 'خبر', color: 'blue', href: '/news' },
  directory: { label: 'دليل', color: 'green', href: '/directory' },
  market: { label: 'إعلان', color: 'yellow', href: '/market' },
  community: { label: 'مجتمع', color: 'brand', href: '/community' },
  initiative: { label: 'مبادرة', color: 'brand', href: '/initiatives' },
};

export const ContentCard = ({
  id,
  type,
  title,
  excerpt,
  image,
  status,
  author,
  createdAt,
  viewCount,
  tags,
  showStatus = false,
  variant = 'default',
}: ContentCardProps) => {
  const typeInfo = typeConfig[type] || { label: type, color: 'gray', href: '#' };
  const href = `${typeInfo.href}/${id}`;

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ar,
  });

  if (variant === 'compact') {
    return (
      <Link href={href}>
        <Card isHoverable p={4}>
          <HStack gap={4}>
            {image && (
              <Image
                src={image}
                alt={title}
                w={20}
                h={20}
                borderRadius="lg"
                objectFit="cover"
              />
            )}
            <VStack align="start" gap={1} flex={1}>
              <HStack gap={2}>
                <Badge colorScheme={typeInfo.color as 'brand'} size="sm">
                  {typeInfo.label}
                </Badge>
                {showStatus && status && <StatusBadge status={status} />}
              </HStack>
              <Text
                fontWeight="semibold"
                color="white"
                lineClamp={1}
              >
                {title}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {timeAgo}
              </Text>
            </VStack>
          </HStack>
        </Card>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={href}>
        <Card isHoverable overflow="hidden" h="full">
          {image && (
            <Box position="relative" h="250px">
              <Image
                src={image}
                alt={title}
                w="full"
                h="full"
                objectFit="cover"
              />
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-t, blackAlpha.800, transparent)"
              />
              <Box position="absolute" bottom={4} right={4} left={4}>
                <HStack gap={2} mb={2}>
                  <Badge colorScheme={typeInfo.color as 'brand'}>
                    {typeInfo.label}
                  </Badge>
                  {showStatus && status && <StatusBadge status={status} />}
                </HStack>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="white"
                  lineClamp={2}
                >
                  {title}
                </Text>
              </Box>
            </Box>
          )}
          <Box p={4}>
            {excerpt && (
              <Text color="gray.400" lineClamp={2} mb={4}>
                {excerpt}
              </Text>
            )}
            <HStack justify="space-between">
              <HStack gap={2}>
                <Avatar src={author.image} name={author.name} size="sm" />
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" color="white" fontWeight="medium">
                    {author.name || 'مستخدم'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {timeAgo}
                  </Text>
                </VStack>
              </HStack>
              {viewCount !== undefined && (
                <Text fontSize="sm" color="gray.500">
                  {viewCount} مشاهدة
                </Text>
              )}
            </HStack>
          </Box>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={href}>
      <Card isHoverable overflow="hidden" h="full">
        {image && (
          <Box h="180px" overflow="hidden">
            <Image
              src={image}
              alt={title}
              w="full"
              h="full"
              objectFit="cover"
              transition="transform 0.3s"
              _groupHover={{ transform: 'scale(1.05)' }}
            />
          </Box>
        )}
        <Box p={4}>
          <HStack gap={2} mb={2}>
            <Badge colorScheme={typeInfo.color as 'brand'} size="sm">
              {typeInfo.label}
            </Badge>
            {showStatus && status && <StatusBadge status={status} />}
          </HStack>

          <Text
            fontSize="lg"
            fontWeight="semibold"
            color="white"
            lineClamp={2}
            mb={2}
          >
            {title}
          </Text>

          {excerpt && (
            <Text color="gray.400" fontSize="sm" lineClamp={2} mb={4}>
              {excerpt}
            </Text>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <HStack gap={1} mb={4} flexWrap="wrap">
              {tags.slice(0, 3).map(({ tag }) => (
                <Badge key={tag.id} variant="outline" colorScheme="gray" size="sm">
                  #{tag.name}
                </Badge>
              ))}
            </HStack>
          )}

          <HStack justify="space-between">
            <HStack gap={2}>
              <Avatar src={author.image} name={author.name} size="xs" />
              <Text fontSize="sm" color="gray.400">
                {author.name || 'مستخدم'}
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.500">
              {timeAgo}
            </Text>
          </HStack>
        </Box>
      </Card>
    </Link>
  );
};

// Content Grid
export const ContentGrid = ({
  children,
  columns = { base: 1, sm: 2, lg: 3 },
}: {
  children: React.ReactNode;
  columns?: Record<string, number>;
}) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        base: `repeat(${columns.base}, 1fr)`,
        sm: `repeat(${columns.sm || columns.base}, 1fr)`,
        md: `repeat(${columns.md || columns.sm || columns.base}, 1fr)`,
        lg: `repeat(${columns.lg || columns.md || columns.sm || columns.base}, 1fr)`,
      }}
      gap={6}
    >
      {children}
    </Box>
  );
};
