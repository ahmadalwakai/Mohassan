'use client';

/**
 * Enhanced Content Detail Wrapper
 * Client-side wrapper that adds reporting functionality to ContentDetail
 * Uses event delegation to catch report button clicks
 */

import { useEffect, useRef, useState } from 'react';
import { ReportDialog } from './report-dialog';

interface EnhancedContentDetailProps {
  contentId: string;
  children: React.ReactNode;
}

export function EnhancedContentDetail({ contentId, children }: EnhancedContentDetailProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if a report button was clicked (look for button with report-related text)
      if (
        target.tagName === 'BUTTON' &&
        (target.textContent?.includes('إبلاغ') || target.textContent?.includes('Report'))
      ) {
        e.preventDefault();
        // Try to find the content title from the page
        const titleEl = containerRef.current?.querySelector('h1, [class*="title"]') as HTMLElement;
        const title = titleEl?.textContent || 'محتوى';
        setContentTitle(title);
        setReportDialogOpen(true);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', handleClick);
      return () => container.removeEventListener('click', handleClick);
    }
  }, []);

  return (
    <div ref={containerRef}>
      {children}
      <ReportDialog
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        contentId={contentId}
        contentTitle={contentTitle}
      />
    </div>
  );
}
