/**
 * Create Content Page
 * General content creation page
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Box, Container } from '@chakra-ui/react';
import { auth } from '@/lib/auth';
import { ContentForm } from '@/components/content';
import { LoadingOverlay } from '@/components/ui';

export const metadata = {
  title: 'إنشاء محتوى جديد | موحسن',
  description: 'شارك محتواك مع مجتمع موحسن',
};

export default async function CreateContentPage() {
  // Check authentication
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/create');
  }
  
  return (
    <Box py={8}>
      <Container maxW="container.lg">
        <Suspense fallback={<LoadingOverlay message="جاري التحميل..." />}>
          <ContentForm mode="create" />
        </Suspense>
      </Container>
    </Box>
  );
}
