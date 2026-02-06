import { Box, Container, Heading, Text, VStack, HStack, Button } from '@chakra-ui/react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Box minH="100vh" bg="bg.primary">
      {/* Header */}
      <Box as="header" bg="brand.header" py={4} px={6}>
        <Container maxW="container.xl">
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="text.primary">
              موحسن
            </Heading>
            <HStack gap={4}>
              <Link href="/login">
                <Button variant="ghost" color="text.primary">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register">
                <Button bg="brand.glow" color="text.inverse" _hover={{ bg: 'brand.glowMuted' }}>
                  إنشاء حساب
                </Button>
              </Link>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxW="container.xl" py={20}>
        <VStack gap={8} textAlign="center">
          <Heading size="3xl" color="text.primary">
            مرحباً بك في موحسن
          </Heading>
          <Text fontSize="xl" color="text.secondary" maxW="600px">
            منصة مجتمعية متكاملة للخدمات والتواصل. اكتشف الأخبار، تصفح الدليل، 
            استكشف السوق، وتواصل مع المجتمع.
          </Text>
          <HStack gap={4}>
            <Link href="/news">
              <Button size="lg" bg="brand.header" color="text.primary" _hover={{ bg: 'brand.headerHover' }}>
                تصفح الأخبار
              </Button>
            </Link>
            <Link href="/directory">
              <Button size="lg" variant="outline" borderColor="brand.glow" color="brand.glow">
                استكشف الدليل
              </Button>
            </Link>
          </HStack>
        </VStack>
      </Container>

      {/* Features Grid */}
      <Container maxW="container.xl" py={16}>
        <VStack gap={12}>
          <Heading size="xl" color="text.primary">
            الخدمات
          </Heading>
          <HStack gap={8} wrap="wrap" justify="center">
            {[
              { title: 'الأخبار', desc: 'آخر الأخبار والمستجدات', href: '/news' },
              { title: 'الدليل', desc: 'دليل شامل للخدمات', href: '/directory' },
              { title: 'السوق', desc: 'سوق إلكتروني متكامل', href: '/market' },
              { title: 'المجتمع', desc: 'تواصل مع المجتمع', href: '/community' },
              { title: 'المبادرات', desc: 'مبادرات مجتمعية', href: '/initiatives/1' },
              { title: 'الذكاء الاصطناعي', desc: 'خدمات ذكية', href: '/ai' },
            ].map((feature) => (
              <Link key={feature.href} href={feature.href}>
                <Box
                  bg="bg.secondary"
                  p={6}
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor="border.default"
                  w="280px"
                  textAlign="center"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: 'brand.glow',
                    boxShadow: 'glow',
                    transform: 'translateY(-4px)',
                  }}
                >
                  <Heading size="md" color="text.primary" mb={2}>
                    {feature.title}
                  </Heading>
                  <Text color="text.secondary">{feature.desc}</Text>
                </Box>
              </Link>
            ))}
          </HStack>
        </VStack>
      </Container>

      {/* Footer */}
      <Box as="footer" bg="brand.footer" py={8} mt={16}>
        <Container maxW="container.xl">
          <VStack gap={4}>
            <Text color="text.secondary">
              © 2026 موحسن - جميع الحقوق محفوظة
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
