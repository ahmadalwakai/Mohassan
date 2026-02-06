/**
 * Create Directory Entry Page
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Box, Container } from '@chakra-ui/react';
import { auth } from '@/lib/auth';
import { ContentForm } from '@/components/content';
import { LoadingOverlay } from '@/components/ui';

export const metadata = {
  title: 'إضافة إلى الدليل | موحسن',
  description: 'أضف خدمة أو جهة إلى الدليل المحلي',
};

export default async function CreateDirectoryPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/directory/create');
  }
  
  return (
    <Box py={8}>
      <Container maxW="container.lg">
        <Suspense fallback={<LoadingOverlay message="جاري التحميل..." />}>
          <ContentForm mode="create" contentType="directory" />
        </Suspense>
      </Container>
    </Box>
  );
}
