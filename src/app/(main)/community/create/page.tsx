/**
 * Create Community Post Page
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Box, Container } from '@chakra-ui/react';
import { auth } from '@/lib/auth';
import { ContentForm } from '@/components/content';
import { LoadingOverlay } from '@/components/ui';

export const metadata = {
  title: 'نشر في المجتمع | موحسن',
  description: 'ابدأ نقاشاً أو شارك تجربتك مع المجتمع',
};

export default async function CreateCommunityPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/community/create');
  }
  
  return (
    <Box py={8}>
      <Container maxW="container.lg">
        <Suspense fallback={<LoadingOverlay message="جاري التحميل..." />}>
          <ContentForm mode="create" contentType="community" />
        </Suspense>
      </Container>
    </Box>
  );
}
