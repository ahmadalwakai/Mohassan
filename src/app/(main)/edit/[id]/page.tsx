/**
 * Edit Content Page
 * Dynamic edit page for all content types
 */

import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { Box, Container } from '@chakra-ui/react';
import { auth } from '@/lib/auth';
import { ContentForm } from '@/components/content';
import { LoadingOverlay } from '@/components/ui';
import { contentService } from '@/services/contentService';

interface EditContentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditContentPageProps) {
  const { id } = await params;
  const content = await contentService.getOne(id);
  
  if (!content) {
    return { title: 'غير موجود | موحسن' };
  }
  
  return {
    title: `تعديل: ${content.title} | موحسن`,
  };
}

export default async function EditContentPage({ params }: EditContentPageProps) {
  const { id } = await params;
  
  // Check authentication
  const session = await auth();
  
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/edit/${id}`);
  }
  
  // Fetch content
  const content = await contentService.getOne(id);
  
  if (!content) {
    notFound();
  }
  
  // Check ownership or admin rights
  const isOwner = content.authorId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  const isModerator = session.user.role === 'MODERATOR';
  
  if (!isOwner && !isAdmin && !isModerator) {
    redirect(`/${content.type === 'initiative' ? 'initiatives' : content.type}/${id}`);
  }
  
  // Parse metadata for type-specific fields
  const metadata = content.metadata as Record<string, unknown> | null;
  
  // Prepare initial data
  const initialData = {
    id: content.id,
    title: content.title,
    body: content.body ?? '',
    tags: content.tags.map((t: { tagId: string }) => t.tagId),
    price: metadata?.price as number | undefined,
    location: metadata?.location as string | undefined,
    contactInfo: metadata?.contactInfo as string | undefined,
    imageUrl: content.image ?? undefined,
  };
  
  return (
    <Box py={8}>
      <Container maxW="container.lg">
        <Suspense fallback={<LoadingOverlay message="جاري التحميل..." />}>
          <ContentForm
            mode="edit"
            contentType={content.type as 'news' | 'directory' | 'market' | 'community' | 'initiative'}
            initialData={initialData}
          />
        </Suspense>
      </Container>
    </Box>
  );
}
