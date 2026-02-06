/**
 * Home Page
 * Landing page with featured content
 */

import { Box, Container, VStack, HStack, Text, SimpleGrid } from '@chakra-ui/react';
import Link from 'next/link';
import { contentService } from '@/core/services';
import { ContentCard, ContentGrid } from '@/components/content';
import { Button, Card, CardBody } from '@/components/ui';

// Quick access sections
const quickSections = [
  { href: '/news', label: 'الأخبار', icon: '📰', description: 'آخر الأخبار والمستجدات' },
  { href: '/directory', label: 'الدليل', icon: '📋', description: 'دليل الخدمات والمؤسسات' },
  { href: '/market', label: 'السوق', icon: '🛒', description: 'إعلانات البيع والشراء' },
  { href: '/community', label: 'المجتمع', icon: '👥', description: 'نقاشات ومشاركات المجتمع' },
  { href: '/initiatives', label: 'المبادرات', icon: '🌟', description: 'المبادرات والتطوع' },
];

async function getHomeContent() {
  try {
    const [news, community, initiatives] = await Promise.all([
      contentService.getPublicByType('news', { page: 1, limit: 4 }),
      contentService.getPublicByType('community', { page: 1, limit: 4 }),
      contentService.getPublicByType('initiative', { page: 1, limit: 3 }),
    ]);

    return { news, community, initiatives };
  } catch (error) {
    console.error('Failed to fetch home content:', error);
    return { news: null, community: null, initiatives: null };
  }
}

export default async function HomePage() {
  const { news, community, initiatives } = await getHomeContent();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg="linear-gradient(135deg, rgba(0,255,0,0.1) 0%, rgba(0,0,0,0) 50%)"
        py={{ base: 12, md: 20 }}
      >
        <Container maxW="7xl">
          <VStack gap={6} textAlign="center" maxW="3xl" mx="auto">
            <Text
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="bold"
              color="white"
              lineHeight="shorter"
            >
              مرحباً بك في{' '}
              <Text as="span" color="brand.400">
                موحسن
              </Text>
            </Text>
            <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.400">
              منصة مجتمعية متكاملة تجمع الأخبار والدليل والسوق والمبادرات
              في مكان واحد
            </Text>
            <HStack gap={4} flexWrap="wrap" justify="center">
              <Link href="/register">
                <Button size="lg">ابدأ الآن</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  تعرف علينا
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Quick Access */}
      <Container maxW="7xl" py={12}>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={4}>
          {quickSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card isHoverable h="full">
                <CardBody textAlign="center">
                  <Text fontSize="3xl" mb={2}>
                    {section.icon}
                  </Text>
                  <Text fontWeight="semibold" color="white" mb={1}>
                    {section.label}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {section.description}
                  </Text>
                </CardBody>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      </Container>

      {/* Latest News */}
      {news && news.items.length > 0 && (
        <Box bg="gray.900" py={12}>
          <Container maxW="7xl">
            <HStack justify="space-between" mb={8}>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                📰 آخر الأخبار
              </Text>
              <Link href="/news">
                <Button variant="ghost">عرض الكل</Button>
              </Link>
            </HStack>
            <ContentGrid columns={{ base: 1, sm: 2, lg: 4 }}>
              {news.items.map((item: ContentCardData) => (
                <ContentCard
                  key={item.id}
                  {...item}
                  author={{
                    id: item.author.id,
                    name: item.author.name,
                    image: item.author.image,
                  }}
                />
              ))}
            </ContentGrid>
          </Container>
        </Box>
      )}

      {/* Community Posts */}
      {community && community.items.length > 0 && (
        <Container maxW="7xl" py={12}>
          <HStack justify="space-between" mb={8}>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              👥 من المجتمع
            </Text>
            <Link href="/community">
              <Button variant="ghost">عرض الكل</Button>
            </Link>
          </HStack>
          <ContentGrid columns={{ base: 1, sm: 2, lg: 4 }}>
            {community.items.map((item: ContentCardData) => (
              <ContentCard
                key={item.id}
                {...item}
                author={{
                  id: item.author.id,
                  name: item.author.name,
                  image: item.author.image,
                }}
              />
            ))}
          </ContentGrid>
        </Container>
      )}

      {/* Initiatives */}
      {initiatives && initiatives.items.length > 0 && (
        <Box bg="gray.900" py={12}>
          <Container maxW="7xl">
            <HStack justify="space-between" mb={8}>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                🌟 مبادرات مميزة
              </Text>
              <Link href="/initiatives">
                <Button variant="ghost">عرض الكل</Button>
              </Link>
            </HStack>
            <ContentGrid columns={{ base: 1, md: 3 }}>
              {initiatives.items.map((item: ContentCardData) => (
                <ContentCard
                  key={item.id}
                  {...item}
                  variant="featured"
                  author={{
                    id: item.author.id,
                    name: item.author.name,
                    image: item.author.image,
                  }}
                />
              ))}
            </ContentGrid>
          </Container>
        </Box>
      )}

      {/* CTA */}
      <Container maxW="7xl" py={16}>
        <Card variant="glow">
          <CardBody py={12} textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="white" mb={4}>
              هل لديك محتوى تود مشاركته؟
            </Text>
            <Text color="gray.400" mb={6} maxW="lg" mx="auto">
              انضم إلى مجتمع موحسن وشارك أخبارك ومبادراتك وإعلاناتك
              مع الآلاف من المستخدمين
            </Text>
            <Link href="/create">
              <Button size="lg">أضف محتوى جديد</Button>
            </Link>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}

// Type for content card data from service
interface ContentCardData {
  id: string;
  type: string;
  title: string;
  excerpt?: string | null;
  image?: string | null;
  status: string;
  author: {
    id: string;
    name: string | null;
    image?: string | null;
  };
  createdAt: Date;
  viewCount?: number;
  tags?: Array<{ tag: { id: string; name: string; slug: string } }>;
}
