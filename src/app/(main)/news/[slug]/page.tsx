/**
 * News Detail Page
 * Dynamic page for viewing individual news items by slug
 */

import { Metadata } from 'next';
import { ContentDetail, EnhancedContentDetail, getContentData } from '@/components/content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContentData(slug);

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
  const { slug } = await params;
  return (
    <EnhancedContentDetail contentId={slug}>
      <ContentDetail id={slug} />
    </EnhancedContentDetail>
  );
}
