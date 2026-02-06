import { Box, Container, Heading, Text, VStack, HStack, Button, Image } from '@chakra-ui/react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Box minH="100vh" bg="transparent">
      {/* Header */}
      <Box as="header" bg="rgba(9, 9, 11, 0.35)" backdropFilter="blur(10px)" borderBottom="1px solid rgba(255,255,255,0.10)" boxShadow="0 10px 30px rgba(0,0,0,0.25)" py={4} px={6}>
        <Container maxW="container.xl">
          <HStack justify="space-between" align="center">
            <Link href="/">
              <HStack gap={2} cursor="pointer" transition="transform 200ms" _hover={{ transform: 'scale(1.02)' }} me={4}>
                <Image
                  src="/brand/logo-512.png"
                  alt="Mohassan logo"
                  w={12}
                  h={12}
                  borderRadius="lg"
                  objectFit="cover"
                  boxShadow="0 0 16px rgba(249,115,22,0.5), 0 0 8px rgba(249,115,22,0.3)"
                />
                <Heading size="lg" color="text.primary">
                  موحسن
                </Heading>
              </HStack>
            </Link>
            <HStack gap={4}>
              <Link href="/login">
                <Button variant="ghost" color="text.primary">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register">
                <Button bg="#7C3AED" color="white" _hover={{ bg: '#6D28D9' }}>
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
              <Button 
                size="lg" 
                bg="linear-gradient(135deg, #F97316, #7C3AED)"
                color="white"
                _hover={{ opacity: 0.9, transform: 'translateY(-2px)' }}
                transition="all 200ms"
              >
                تصفح الأخبار
              </Button>
            </Link>
            <Link href="/directory">
              <Button 
                size="lg" 
                variant="outline" 
                borderColor="#7C3AED" 
                color="#7C3AED"
                _hover={{ bg: 'rgba(124,58,237,0.1)' }}
              >
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
                  bg="rgba(255,255,255,0.06)"
                  p={6}
                  borderRadius="lg"
                  border="1px solid rgba(249,115,22,0.35)"
                  boxShadow="0 0 12px rgba(249,115,22,0.15), 0 0 4px rgba(249,115,22,0.1)"
                  w="280px"
                  textAlign="center"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: 'rgba(249,115,22,0.6)',
                    boxShadow: '0 0 20px rgba(249,115,22,0.25), 0 0 8px rgba(249,115,22,0.15)',
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
      <Box as="footer" bg="rgba(9, 9, 11, 0.28)" backdropFilter="blur(10px)" borderTop="1px solid rgba(255,255,255,0.10)" boxShadow="0 -10px 30px rgba(0,0,0,0.25)" py={8} mt={16}>
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
