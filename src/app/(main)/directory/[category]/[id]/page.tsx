/**
 * Directory Item Detail Page
 * Dynamic page for viewing directory items with category and id
 */

import { Metadata } from 'next';
import { ContentDetail, EnhancedContentDetail, getContentData } from '@/components/content';

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getContentData(id);

  if (!content) {
    return { title: 'غير موجود | موحسن' };
  }

  return {
    title: `${content.title} | الدليل | موحسن`,
    description: content.excerpt || content.body?.substring(0, 160),
  };
}

export default async function DirectoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <EnhancedContentDetail contentId={id}>
      <ContentDetail id={id} />
    </EnhancedContentDetail>
  );
}
