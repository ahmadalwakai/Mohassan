'use client';

/**
 * Footer Component
 */

import { Box, Container, HStack, VStack, Text, SimpleGrid, Image } from '@chakra-ui/react';
import Link from 'next/link';

const footerLinks = {
  platform: {
    title: 'المنصة',
    links: [
      { href: '/about', label: 'عن موحسن' },
      { href: '/contact', label: 'تواصل معنا' },
      { href: '/faq', label: 'الأسئلة الشائعة' },
    ],
  },
  sections: {
    title: 'الأقسام',
    links: [
      { href: '/news', label: 'الأخبار' },
      { href: '/directory', label: 'الدليل' },
      { href: '/market', label: 'السوق' },
      { href: '/community', label: 'المجتمع' },
      { href: '/initiatives', label: 'المبادرات' },
    ],
  },
  legal: {
    title: 'قانوني',
    links: [
      { href: '/privacy', label: 'سياسة الخصوصية' },
      { href: '/terms', label: 'شروط الاستخدام' },
      { href: '/guidelines', label: 'إرشادات المجتمع' },
    ],
  },
};

export const Footer = () => {
  return (
    <Box as="footer" bg="rgba(9, 9, 11, 0.28)" borderTop="1px solid rgba(255,255,255,0.10)" mt="auto" backdropFilter="blur(10px)" boxShadow="0 -10px 30px rgba(0,0,0,0.25)">
      <Container maxW="7xl" py={12} px={{ base: 4, md: 0 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={8}>
          {/* Brand */}
          <VStack align="start" gap={4}>
            <HStack gap={2}>
              <Image
                src="/brand/logo-512.png"
                alt="Mohassan logo"
                w={12}
                h={12}
                borderRadius="lg"
                objectFit="cover"
                boxShadow="0 0 16px rgba(249,115,22,0.5), 0 0 8px rgba(249,115,22,0.3)"
              />
              <Text fontSize="xl" fontWeight="bold" color="rgba(255,255,255,0.92)">
                موحسن
              </Text>
            </HStack>
            <Text color="rgba(255,255,255,0.54)" fontSize="sm" maxW="250px" lineHeight="1.6">
              منصة عربية مجتمعية تجمع الأخبار والدليل والسوق والمبادرات في مكان واحد.
            </Text>
            {/* Social Links */}
            <HStack gap={3}>
              <SocialLink href="#" label="تويتر">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialLink>
              <SocialLink href="#" label="فيسبوك">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialLink>
              <SocialLink href="#" label="يوتيوب">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </SocialLink>
            </HStack>
          </VStack>

          {/* Link Sections */}
          {Object.values(footerLinks).map((section) => (
            <VStack key={section.title} align="start" gap={3}>
              <Text fontWeight="semibold" color="rgba(255,255,255,0.92)">
                {section.title}
              </Text>
              {section.links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Text
                    color="rgba(255,255,255,0.54)"
                    fontSize="sm"
                    transition="color 200ms"
                    _hover={{ color: 'rgba(249,115,22,0.9)' }}
                  >
                    {link.label}
                  </Text>
                </Link>
              ))}
            </VStack>
          ))}
        </SimpleGrid>

        {/* Bottom */}
        <Box
          mt={12}
          pt={8}
          borderTop="1px solid rgba(255,255,255,0.08)"
          textAlign="center"
        >
          <Text color="rgba(255,255,255,0.40)" fontSize="sm">
            © {new Date().getFullYear()} موحسن. جميع الحقوق محفوظة.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

// Social Link Component
const SocialLink = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <Link href={href} aria-label={label}>
    <Box
      p={2}
      borderRadius="lg"
      color="rgba(255,255,255,0.54)"
      transition="all 200ms"
      _hover={{ color: 'rgba(249,115,22,0.9)', bg: 'rgba(255,255,255,0.06)' }}
    >
      {children}
    </Box>
  </Link>
);
