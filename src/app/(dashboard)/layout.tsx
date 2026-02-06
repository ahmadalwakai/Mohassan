/**
 * Dashboard Layout
 * Layout for authenticated user dashboard pages
 */

import { redirect } from 'next/navigation';
import { Box, Flex, Container } from '@chakra-ui/react';
import { auth } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Check authentication
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }
  
  return (
    <Box minH="100vh" bg="gray.900" dir="rtl">
      {/* Header */}
      <Header />
      
      <Flex pt="64px">
        {/* Sidebar - Desktop only */}
        <Box
          as="aside"
          display={{ base: 'none', lg: 'block' }}
          w="280px"
          flexShrink={0}
        >
          <Box
            position="fixed"
            top="64px"
            right={0}
            w="280px"
            h="calc(100vh - 64px)"
            overflowY="auto"
            borderLeft="1px solid"
            borderColor="gray.700"
            bg="gray.900"
          >
            <Sidebar />
          </Box>
        </Box>
        
        {/* Main content */}
        <Box flex={1} minW={0}>
          <Container maxW="container.xl" py={6} px={{ base: 4, md: 6 }}>
            {children}
          </Container>
        </Box>
      </Flex>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </Box>
  );
}
