'use client';

/**
 * Header Component
 * Main navigation header
 */

import { Box, Container, HStack, Text, Image, Menu, Portal } from '@chakra-ui/react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { Avatar } from '@/components/ui';

const navLinks = [
  { href: '/news', label: 'الأخبار' },
  { href: '/directory', label: 'الدليل' },
  { href: '/market', label: 'السوق' },
  { href: '/community', label: 'المجتمع' },
  { href: '/initiatives', label: 'المبادرات' },
];

export const Header = () => {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={100}
      bg="gray.900"
      borderBottom="1px solid"
      borderColor="gray.800"
      backdropFilter="blur(10px)"
    >
      <Container maxW="7xl">
        <HStack h={16} justify="space-between">
          {/* Logo */}
          <Link href="/">
            <HStack gap={2} cursor="pointer">
              <Box
                w={10}
                h={10}
                bg="brand.500"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                color="black"
                fontSize="xl"
              >
                م
              </Box>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="white"
                display={{ base: 'none', sm: 'block' }}
              >
                موحسن
              </Text>
            </HStack>
          </Link>

          {/* Desktop Navigation */}
          <HStack
            as="nav"
            gap={1}
            display={{ base: 'none', md: 'flex' }}
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Box
                  px={4}
                  py={2}
                  borderRadius="lg"
                  color="gray.300"
                  fontWeight="medium"
                  transition="all 0.2s"
                  _hover={{
                    bg: 'whiteAlpha.100',
                    color: 'white',
                  }}
                >
                  {link.label}
                </Box>
              </Link>
            ))}
          </HStack>

          {/* Auth Section */}
          <HStack gap={3}>
            {status === 'loading' ? (
              <Box w={8} h={8} borderRadius="full" bg="gray.700" />
            ) : session ? (
              <Box position="relative">
                <HStack
                  gap={2}
                  cursor="pointer"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  p={1}
                  borderRadius="lg"
                  _hover={{ bg: 'whiteAlpha.100' }}
                >
                  <Avatar
                    src={session.user?.image}
                    name={session.user?.name}
                    size="sm"
                  />
                  <Text
                    color="gray.300"
                    fontSize="sm"
                    display={{ base: 'none', sm: 'block' }}
                  >
                    {session.user?.name?.split(' ')[0]}
                  </Text>
                </HStack>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <Box
                      position="fixed"
                      inset={0}
                      onClick={() => setIsMenuOpen(false)}
                    />
                    {/* Menu */}
                    <Box
                      position="absolute"
                      top="100%"
                      left={0}
                      mt={2}
                      bg="gray.800"
                      border="1px solid"
                      borderColor="gray.700"
                      borderRadius="lg"
                      py={2}
                      minW="200px"
                      shadow="xl"
                      zIndex={10}
                    >
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Box
                          px={4}
                          py={2}
                          color="gray.300"
                          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                        >
                          لوحة التحكم
                        </Box>
                      </Link>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Box
                          px={4}
                          py={2}
                          color="gray.300"
                          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                        >
                          الملف الشخصي
                        </Box>
                      </Link>
                      <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                        <Box
                          px={4}
                          py={2}
                          color="gray.300"
                          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                        >
                          الإعدادات
                        </Box>
                      </Link>
                      <Box
                        h="1px"
                        bg="gray.700"
                        my={2}
                      />
                      <Box
                        px={4}
                        py={2}
                        color="red.400"
                        cursor="pointer"
                        _hover={{ bg: 'whiteAlpha.100' }}
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        تسجيل الخروج
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            ) : (
              <HStack gap={2}>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    دخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    تسجيل
                  </Button>
                </Link>
              </HStack>
            )}

            {/* Mobile Menu Button */}
            <Box
              display={{ base: 'flex', md: 'none' }}
              p={2}
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: 'whiteAlpha.100' }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </Box>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
};
