import { Box, Container, Heading, HStack, VStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const accountNavItems = [
  { href: '/account/profile', label: 'الملف الشخصي' },
  { href: '/account/content', label: 'المحتوى' },
  { href: '/account/notifications', label: 'الإشعارات' },
  { href: '/account/settings', label: 'الإعدادات' },
];

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await auth();

  // Require authentication
  if (!session?.user) {
    redirect('/login');
  }

  // Require not banned
  if (session.user.status === 'BANNED') {
    redirect('/login?error=account_banned');
  }
  return (
    <Box minH="100vh" bg="bg.primary">
      {/* Header */}
      <Box bg="brand.header" py={4} px={6}>
        <Container maxW="container.xl">
          <HStack justify="space-between" align="center">
            <Link href="/">
              <Heading size="lg" color="text.primary">
                موحسن
              </Heading>
            </Link>
            <Text color="text.primary">حسابي</Text>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <HStack align="start" gap={8}>
          {/* Sidebar */}
          <Box
            w="250px"
            bg="bg.secondary"
            borderRadius="lg"
            borderWidth={1}
            borderColor="border.default"
            p={4}
            position="sticky"
            top={8}
          >
            <VStack align="stretch" gap={2}>
              {accountNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Box
                    py={3}
                    px={4}
                    borderRadius="md"
                    color="text.primary"
                    _hover={{ bg: 'bg.elevated', color: 'brand.glow' }}
                    transition="all 0.2s"
                  >
                    {item.label}
                  </Box>
                </Link>
              ))}
            </VStack>
          </Box>

          {/* Main Content */}
          <Box flex={1}>{children}</Box>
        </HStack>
      </Container>
    </Box>
  );
}
