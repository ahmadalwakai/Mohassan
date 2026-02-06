import { Box, Container, Heading, HStack, VStack, Text } from '@chakra-ui/react';
import Link from 'next/link';

interface ModeratorLayoutProps {
  children: React.ReactNode;
}

const modNavItems = [
  { href: '/moderator', label: 'لوحة الإشراف' },
  { href: '/moderator/queue', label: 'قائمة المراجعة' },
  { href: '/moderator/reports', label: 'البلاغات' },
  { href: '/moderator/actions', label: 'الإجراءات' },
];

export default function ModeratorLayout({ children }: ModeratorLayoutProps) {
  return (
    <Box minH="100vh" bg="bg.primary">
      {/* Header */}
      <Box bg="status.warning" py={4} px={6}>
        <Container maxW="container.xl">
          <HStack justify="space-between" align="center">
            <Link href="/">
              <Heading size="lg" color="text.inverse">
                موحسن
              </Heading>
            </Link>
            <Text color="text.inverse" fontWeight="bold">لوحة الإشراف</Text>
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
              {modNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Box
                    py={3}
                    px={4}
                    borderRadius="md"
                    color="text.primary"
                    _hover={{ bg: 'bg.elevated', color: 'status.warning' }}
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
