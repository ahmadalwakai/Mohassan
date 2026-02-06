'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from '@/core/auth';
import system from '@/ui/theme';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <ChakraProvider value={system}>
          {children}
        </ChakraProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
