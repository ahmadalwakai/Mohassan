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
        position="relative"
        py={{ base: 8, md: 14 }}
        overflow="hidden"
      >
        {/* Animated background blob */}
        <Box
          position="absolute"
          width="400px"
          height="400px"
          borderRadius="full"
          background="radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 70%)"
          left="-10%"
          top="10%"
          animation="none"
          filter="blur(40px)"
          pointerEvents="none"
          zIndex={0}
        />
        <Box
          position="absolute"
          width="350px"
          height="350px"
          borderRadius="full"
          background="radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)"
          right="-5%"
          bottom="10%"
          animation="none"
          filter="blur(40px)"
          pointerEvents="none"
          zIndex={0}
        />
        
        <Container maxW="7xl" position="relative" zIndex={1}>
          <VStack gap={5} textAlign="center" maxW="3xl" mx="auto">
            <Text
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="bold"
              background="linear-gradient(90deg, #F97316, #7C3AED)"
              bgClip="text"
              color="transparent"
              lineHeight="shorter"
              css={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              مرحباً بك في موحسن
            </Text>
            <Text fontSize={{ base: 'lg', md: 'xl' }} color="rgba(255,255,255,0.68)">
              منصة مجتمعية متكاملة تجمع الأخبار والدليل والسوق والمبادرات
              في مكان واحد
            </Text>
            <HStack gap={4} flexWrap="wrap" justify="center">
              <Link href="/register">
                <Button 
                  size="lg" 
                  bg="linear-gradient(135deg, #F97316, #7C3AED)"
                  color="white"
                  _hover={{
                    boxShadow: '0 0 24px rgba(249,115,22,0.3)',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 200ms ease-in-out"
                >
                  ابدأ الآن
                </Button>
              </Link>
              <Link href="/market">
                <Button 
                  variant="ghost" 
                  size="lg"
                  bg="rgba(255,255,255,0.08)"
                  border="1px solid rgba(255,255,255,0.18)"
                  color="rgba(255,255,255,0.92)"
                  backdropFilter="blur(8px)"
                  _hover={{
                    bg: 'rgba(255,255,255,0.12)',
                    borderColor: 'rgba(124,58,237,0.5)',
                    transform: 'translateY(-2px)',
                  }}
                  _focus={{
                    boxShadow: '0 0 0 2px rgba(124,58,237,0.4)',
                  }}
                  transition="all 200ms ease-in-out"
                >
                  استكشف السوق
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Quick Access */}
      <Container maxW="7xl" py={8} px={{ base: 4, md: 0 }}>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={4}>
          {quickSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card isHoverable h="full">
                <CardBody textAlign="center">
                  <Text fontSize="3xl" mb={2}>
                    {section.icon}
                  </Text>
                  <Text fontWeight="semibold" color="rgba(255,255,255,0.92)" mb={1}>
                    {section.label}
                  </Text>
                  <Text fontSize="sm" color="rgba(255,255,255,0.54)">
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
        <Box bg="rgba(11,16,32,0.4)" py={12} backdropFilter="blur(4px)">
          <Container maxW="7xl" px={{ base: 4, md: 0 }}>
            <HStack justify="space-between" mb={8}>
              <Text fontSize="2xl" fontWeight="bold" color="rgba(255,255,255,0.92)">
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
        <Container maxW="7xl" py={12} px={{ base: 4, md: 0 }}>
          <HStack justify="space-between" mb={8}>
            <Text fontSize="2xl" fontWeight="bold" color="rgba(255,255,255,0.92)">
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
        <Box bg="rgba(11,16,32,0.4)" py={12} backdropFilter="blur(4px)">
          <Container maxW="7xl" px={{ base: 4, md: 0 }}>
            <HStack justify="space-between" mb={8}>
              <Text fontSize="2xl" fontWeight="bold" color="rgba(255,255,255,0.92)">
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
      <Container maxW="7xl" py={16} px={{ base: 4, md: 0 }}>
        <Card variant="glow">
          <CardBody py={12} textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="rgba(255,255,255,0.92)" mb={4}>
              هل لديك محتوى تود مشاركته؟
            </Text>
            <Text color="rgba(255,255,255,0.68)" mb={6} maxW="lg" mx="auto">
              انضم إلى مجتمع موحسن وشارك أخبارك ومبادراتك وإعلاناتك
              مع الآلاف من المستخدمين
            </Text>
            <Link href="/create">
              <Button 
                size="lg"
                bg="linear-gradient(135deg, #F97316, #7C3AED)"
                color="white"
                _hover={{
                  boxShadow: '0 0 24px rgba(249,115,22,0.3)',
                  transform: 'translateY(-2px)',
                }}
                transition="all 200ms ease-in-out"
              >
                أضف محتوى جديد
              </Button>
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
