import { Box, Container, Heading, HStack, VStack, Text } from '@chakra-ui/react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { href: '/admin', label: 'لوحة التحكم' },
  { href: '/admin/users', label: 'المستخدمين' },
  { href: '/admin/settings', label: 'الإعدادات' },
  { href: '/admin/audit', label: 'سجل المراجعة' },
  { href: '/admin/ai-center', label: 'مركز الذكاء الاصطناعي' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box minH="100vh" bg="bg.primary">
      {/* Header */}
      <Box bg="status.error" py={4} px={6}>
        <Container maxW="container.xl">
          <HStack justify="space-between" align="center">
            <Link href="/">
              <Heading size="lg" color="text.primary">
                موحسن
              </Heading>
            </Link>
            <Text color="text.primary" fontWeight="bold">لوحة الإدارة</Text>
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
              {adminNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Box
                    py={3}
                    px={4}
                    borderRadius="md"
                    color="text.primary"
                    _hover={{ bg: 'bg.elevated', color: 'status.error' }}
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
