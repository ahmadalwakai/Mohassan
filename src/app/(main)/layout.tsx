/**
 * Main Site Layout
 * Layout for public pages with header and footer
 */

import { Header, Footer, MobileNav } from '@/components/layout';
import { Box } from '@chakra-ui/react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Box as="main" flex={1} pb={{ base: 20, md: 0 }}>
        {children}
      </Box>
      <Footer />
      <MobileNav />
    </>
  );
}
