/**
 * About Page
 * Information about Mohassan platform
 */

import { Box, Container, VStack, Text, SimpleGrid, HStack } from '@chakra-ui/react';
import { Metadata } from 'next';
import { Card, CardBody } from '@/components/ui';

export const metadata: Metadata = {
  title: 'عن موحسن',
  description: 'تعرف على منصة موحسن - مجتمع متكامل للخدمات والتواصل',
};

const features = [
  {
    icon: '📰',
    title: 'الأخبار',
    description: 'آخر الأخبار والمستجدات المحلية والعالمية',
  },
  {
    icon: '📋',
    title: 'الدليل',
    description: 'دليل شامل للخدمات والمؤسسات والأماكن',
  },
  {
    icon: '🛒',
    title: 'السوق',
    description: 'منصة للبيع والشراء والإعلانات التجارية',
  },
  {
    icon: '👥',
    title: 'المجتمع',
    description: 'مساحة للنقاشات والمشاركات المجتمعية',
  },
  {
    icon: '🌟',
    title: 'المبادرات',
    description: 'دعم المبادرات التطوعية والمشاريع المجتمعية',
  },
  {
    icon: '🤖',
    title: 'المساعد الذكي',
    description: 'مساعد ذكي للإجابة على استفساراتك',
  },
];

const values = [
  {
    icon: '🤝',
    title: 'التعاون',
    description: 'نؤمن بقوة العمل الجماعي والتعاون المجتمعي',
  },
  {
    icon: '🔒',
    title: 'الخصوصية',
    description: 'نحترم خصوصية مستخدمينا ونحمي بياناتهم',
  },
  {
    icon: '⚡',
    title: 'الابتكار',
    description: 'نسعى دائماً لتقديم حلول مبتكرة ومتطورة',
  },
  {
    icon: '🌍',
    title: 'الشمولية',
    description: 'منصة مفتوحة للجميع دون تمييز',
  },
];

export default function AboutPage() {
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="6xl">
        <VStack gap={12} align="stretch">
          {/* Hero Section */}
          <VStack gap={4} textAlign="center">
            <Text
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="bold"
              background="linear-gradient(90deg, #F97316, #7C3AED)"
              bgClip="text"
              color="transparent"
              css={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              عن موحسن
            </Text>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="rgba(255,255,255,0.7)"
              maxW="3xl"
              lineHeight="tall"
            >
              موحسن هي منصة مجتمعية متكاملة تهدف إلى ربط أفراد المجتمع ببعضهم البعض
              وتوفير مساحة آمنة وموثوقة للتواصل وتبادل المعلومات والخدمات
            </Text>
          </VStack>

          {/* Mission Section */}
          <Card>
            <CardBody>
              <VStack gap={4} textAlign="center" py={4}>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  رسالتنا
                </Text>
                <Text color="rgba(255,255,255,0.7)" fontSize="lg" lineHeight="tall" maxW="3xl">
                  نسعى لبناء مجتمع رقمي متماسك يمكّن الأفراد من التواصل والتعاون
                  والمساهمة في تطوير مجتمعهم من خلال منصة سهلة الاستخدام وآمنة
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Features Section */}
          <VStack gap={6} align="stretch">
            <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
              خدماتنا
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardBody>
                    <VStack gap={3} align="start">
                      <HStack gap={3}>
                        <Text fontSize="2xl">{feature.icon}</Text>
                        <Text fontWeight="bold" color="white" fontSize="lg">
                          {feature.title}
                        </Text>
                      </HStack>
                      <Text color="rgba(255,255,255,0.6)" fontSize="sm">
                        {feature.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>

          {/* Values Section */}
          <VStack gap={6} align="stretch">
            <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
              قيمنا
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              {values.map((value) => (
                <Card key={value.title}>
                  <CardBody>
                    <HStack gap={4} align="start">
                      <Text fontSize="3xl">{value.icon}</Text>
                      <VStack gap={1} align="start">
                        <Text fontWeight="bold" color="white">
                          {value.title}
                        </Text>
                        <Text color="rgba(255,255,255,0.6)" fontSize="sm">
                          {value.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>

          {/* Contact CTA */}
          <Card>
            <CardBody>
              <VStack gap={4} textAlign="center" py={4}>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  هل لديك أسئلة؟
                </Text>
                <Text color="rgba(255,255,255,0.7)">
                  تواصل معنا وسنكون سعداء بمساعدتك
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
