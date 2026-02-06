/**
 * Create News Page
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Box, Container } from '@chakra-ui/react';
import { auth } from '@/lib/auth';
import { ContentForm } from '@/components/content';
import { LoadingOverlay } from '@/components/ui';

export const metadata = {
  title: 'نشر خبر جديد | موحسن',
  description: 'شارك آخر الأخبار مع مجتمع موحسن',
};

export default async function CreateNewsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/news/create');
  }
  
  return (
    <Box py={8}>
      <Container maxW="container.lg">
        <Suspense fallback={<LoadingOverlay message="جاري التحميل..." />}>
          <ContentForm mode="create" contentType="news" />
        </Suspense>
      </Container>
    </Box>
  );
}
