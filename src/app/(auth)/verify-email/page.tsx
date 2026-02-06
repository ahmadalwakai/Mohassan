'use client';

import { Suspense } from 'react';
import { Box, Text } from '@chakra-ui/react';
import VerifyEmailContent from './verify-email-content';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
          <Text color="text.secondary">جاري التحميل...</Text>
        </Box>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
