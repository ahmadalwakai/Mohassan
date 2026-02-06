'use client';

/**
 * Sidebar Component
 * Dashboard sidebar navigation
 */

import { Box, VStack, Text, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
  moderatorOnly?: boolean;
}

const sidebarLinks: SidebarLink[] = [
  { href: '/dashboard', label: 'الرئيسية', icon: '🏠' },
  { href: '/dashboard/content', label: 'محتواي', icon: '📝' },
  { href: '/dashboard/notifications', label: 'الإشعارات', icon: '🔔' },
  { href: '/dashboard/saved', label: 'المحفوظات', icon: '⭐' },
  // Moderator links
  { href: '/dashboard/moderation', label: 'الإدارة', icon: '🛡️', moderatorOnly: true },
  { href: '/dashboard/reports', label: 'البلاغات', icon: '⚠️', moderatorOnly: true },
  // Admin links
  { href: '/dashboard/users', label: 'المستخدمون', icon: '👥', adminOnly: true },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: '⚙️', adminOnly: true },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;

  const filteredLinks = sidebarLinks.filter((link) => {
    if (link.adminOnly && userRole !== 'ADMIN') return false;
    if (link.moderatorOnly && !['ADMIN', 'MODERATOR'].includes(userRole || '')) return false;
    return true;
  });

  return (
    <Box
      as="aside"
      w="250px"
      minH="calc(100vh - 64px)"
      bg="gray.900"
      borderLeft="1px solid"
      borderColor="gray.800"
      py={6}
      position="sticky"
      top="64px"
      display={{ base: 'none', lg: 'block' }}
    >
      <VStack align="stretch" gap={1} px={3}>
        {filteredLinks.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== '/dashboard' && pathname.startsWith(link.href));

          return (
            <Link key={link.href} href={link.href}>
              <HStack
                px={4}
                py={3}
                borderRadius="lg"
                bg={isActive ? 'brand.500' : 'transparent'}
                color={isActive ? 'black' : 'gray.400'}
                fontWeight={isActive ? 'semibold' : 'medium'}
                transition="all 0.2s"
                _hover={{
                  bg: isActive ? 'brand.400' : 'whiteAlpha.100',
                  color: isActive ? 'black' : 'white',
                }}
              >
                <Text fontSize="lg">{link.icon}</Text>
                <Text>{link.label}</Text>
              </HStack>
            </Link>
          );
        })}
      </VStack>

      {/* Create Button */}
      <Box px={3} mt={6}>
        <Link href="/create">
          <HStack
            px={4}
            py={3}
            borderRadius="lg"
            bg="brand.500"
            color="black"
            fontWeight="semibold"
            justify="center"
            transition="all 0.2s"
            _hover={{ bg: 'brand.400' }}
          >
            <Text>+ إضافة محتوى</Text>
          </HStack>
        </Link>
      </Box>
    </Box>
  );
};

// Mobile Bottom Navigation
export const MobileNav = () => {
  const pathname = usePathname();

  const mobileLinks = [
    { href: '/', label: 'الرئيسية', icon: '🏠' },
    { href: '/news', label: 'الأخبار', icon: '📰' },
    { href: '/create', label: 'إضافة', icon: '➕' },
    { href: '/community', label: 'المجتمع', icon: '👥' },
    { href: '/dashboard', label: 'حسابي', icon: '👤' },
  ];

  return (
    <Box
      position="fixed"
      bottom={0}
      right={0}
      left={0}
      bg="gray.900"
      borderTop="1px solid"
      borderColor="gray.800"
      display={{ base: 'flex', md: 'none' }}
      zIndex={100}
      px={2}
      py={1}
      pb="env(safe-area-inset-bottom)"
    >
      {mobileLinks.map((link) => {
        const isActive = pathname === link.href;
        const isCreate = link.href === '/create';

        return (
          <Link key={link.href} href={link.href} style={{ flex: 1 }}>
            <VStack
              py={2}
              gap={0.5}
              color={isActive ? 'brand.400' : 'gray.500'}
              transition="color 0.2s"
            >
              {isCreate ? (
                <Box
                  w={10}
                  h={10}
                  bg="brand.500"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="black"
                  fontSize="xl"
                  mt={-4}
                  shadow="lg"
                >
                  {link.icon}
                </Box>
              ) : (
                <Text fontSize="xl">{link.icon}</Text>
              )}
              <Text fontSize="xs" fontWeight="medium">
                {link.label}
              </Text>
            </VStack>
          </Link>
        );
      })}
    </Box>
  );
};
