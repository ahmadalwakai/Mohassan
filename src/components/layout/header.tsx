'use client';

/**
 * Header Component
 * Main navigation header
 */

import { Box, Container, HStack, Text, Image } from '@chakra-ui/react';
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
      zIndex={1000}
      bg="rgba(9, 9, 11, 0.35)"
      borderBottom="1px solid rgba(255,255,255,0.10)"
      backdropFilter="blur(10px)"
      boxShadow="0 10px 30px rgba(0,0,0,0.25)"
    >
      <Container maxW="7xl">
        <HStack h={16} justify="space-between" px={{ base: 4, md: 0 }}>
          {/* Logo */}
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
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="rgba(255,255,255,0.92)"
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
                  color="rgba(255,255,255,0.68)"
                  fontWeight="medium"
                  transition="all 200ms ease-in-out"
                  position="relative"
                  _hover={{
                    color: 'rgba(255,255,255,0.92)',
                    _after: {
                      width: '100%',
                    },
                  }}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0%',
                    height: '2px',
                    background: 'linear-gradient(90deg, #F97316, #7C3AED)',
                    transition: 'width 200ms ease-in-out',
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
              <Box w={8} h={8} borderRadius="full" bg="rgba(255,255,255,0.06)" />
            ) : session ? (
              <Box position="relative">
                <HStack
                  gap={2}
                  cursor="pointer"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  p={1}
                  borderRadius="lg"
                  transition="all 200ms"
                  _hover={{ 
                    bg: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(124,58,237,0.4)',
                  }}
                  border="1px solid transparent"
                >
                  <Avatar
                    src={session.user?.image}
                    name={session.user?.name}
                    size="sm"
                  />
                  <Text
                    color="rgba(255,255,255,0.68)"
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
                      bg="rgba(11,16,32,0.9)"
                      border="1px solid rgba(255,255,255,0.08)"
                      borderRadius="lg"
                      py={2}
                      minW="200px"
                      shadow="0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                      backdropFilter="blur(10px)"
                      zIndex={10}
                    >
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Box
                          px={4}
                          py={2}
                          color="rgba(255,255,255,0.68)"
                          transition="all 200ms"
                          _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.92)' }}
                        >
                          لوحة التحكم
                        </Box>
                      </Link>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Box
                          px={4}
                          py={2}
                          color="rgba(255,255,255,0.68)"
                          transition="all 200ms"
                          _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.92)' }}
                        >
                          الملف الشخصي
                        </Box>
                      </Link>
                      <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                        <Box
                          px={4}
                          py={2}
                          color="rgba(255,255,255,0.68)"
                          transition="all 200ms"
                          _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.92)' }}
                        >
                          الإعدادات
                        </Box>
                      </Link>
                      <Box
                        h="1px"
                        bg="rgba(255,255,255,0.08)"
                        my={2}
                      />
                      <Box
                        px={4}
                        py={2}
                        color="rgba(220,53,69,0.9)"
                        cursor="pointer"
                        transition="all 200ms"
                        _hover={{ bg: 'rgba(255,255,255,0.06)' }}
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
              color="rgba(255,255,255,0.92)"
              transition="all 200ms"
              _hover={{ bg: 'rgba(255,255,255,0.08)' }}
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
