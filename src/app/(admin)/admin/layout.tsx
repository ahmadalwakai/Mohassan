import { Box, Container, Heading, HStack, VStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { adminDepartments } from '@/modules/admin-ops';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  // Require authentication
  if (!session?.user) {
    redirect('/login');
  }

  // Require admin role
  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Require not banned/suspended
  if (session.user.status === 'BANNED' || session.user.status === 'SUSPENDED') {
    redirect('/login?error=account_suspended');
  }
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
          {/* Sidebar — driven by department registry */}
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
            <VStack align="stretch" gap={1}>
              {adminDepartments.map((dept) => (
                <Link key={dept.id} href={dept.route}>
                  <Box
                    py={3}
                    px={4}
                    borderRadius="md"
                    color="text.primary"
                    _hover={{ bg: 'bg.elevated', color: 'status.error' }}
                    transition="all 0.2s"
                    title={dept.description}
                  >
                    <HStack gap={2}>
                      <Text fontSize="lg">{dept.iconName}</Text>
                      <Text fontSize="sm">{dept.label}</Text>
                    </HStack>
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
