/**
 * Create Initiative Page
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Box, Container } from '@chakra-ui/react';
import { auth } from '@/lib/auth';
import { ContentForm } from '@/components/content';
import { LoadingOverlay } from '@/components/ui';

export const metadata = {
  title: 'تقديم مبادرة | موحسن',
  description: 'قدم مبادرة أو فكرة تخدم المجتمع',
};

export default async function CreateInitiativePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/initiatives/create');
  }
  
  return (
    <Box py={8}>
      <Container maxW="container.lg">
        <Suspense fallback={<LoadingOverlay message="جاري التحميل..." />}>
          <ContentForm mode="create" contentType="initiative" />
        </Suspense>
      </Container>
    </Box>
  );
}
