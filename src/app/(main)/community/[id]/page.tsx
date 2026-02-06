/**
 * Community Item Detail Page
 */

import { Metadata } from 'next';
import { ContentDetail, getContentData } from '@/components/content';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getContentData(id);

  if (!content) {
    return { title: 'غير موجود | موحسن' };
  }

  return {
    title: `${content.title} | المجتمع | موحسن`,
    description: content.excerpt || content.body?.substring(0, 160),
  };
}

export default async function CommunityDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ContentDetail id={id} />;
}
