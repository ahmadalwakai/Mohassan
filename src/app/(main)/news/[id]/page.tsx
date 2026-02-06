/**
 * News Detail Page
 * Dynamic page for viewing individual news items
 */

import { Metadata } from 'next';
import { ContentDetail, getContentData } from '@/components/content';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getContentData(id);

  if (!content) {
    return { title: 'غير موجود | موحسن' };
  }

  return {
    title: `${content.title} | موحسن`,
    description: content.excerpt || content.body?.substring(0, 160),
    openGraph: {
      title: content.title,
      description: content.excerpt || content.body?.substring(0, 160),
      images: content.image ? [content.image] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ContentDetail id={id} />;
}
