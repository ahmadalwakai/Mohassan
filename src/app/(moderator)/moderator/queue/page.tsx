'use client';

import { Box, Heading, VStack, Button, HStack } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  author: {
    id: string;
    name: string | null;
  };
}

export default function ModeratorQueuePage() {
  const [queue, setQueue] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Simple notification
  const notify = (message: string, type: string) => console.log(`[${type}] ${message}`);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/moderator/queue');
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue);
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
      notify('فشل تحميل قائمة المراجعة', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  async function moderateContent(contentId: string, action: string, reason: string) {
    try {
      const res = await fetch(`/api/moderator/content/${contentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        notify('تم معالجة المحتوى', 'success');
        fetchQueue();
      }
    } catch (error) {
      console.error('Failed to moderate:', error);
      notify('فشل معالجة المحتوى', 'error');
    }
  }

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={6}>
          قائمة المراجعة
        </Heading>

        {loading ? (
          <div>جاري التحميل...</div>
        ) : queue.length === 0 ? (
          <div>لا يوجد محتوى جديد للمراجعة</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell align="right">العنوان</TableHeadCell>
                <TableHeadCell align="right">المؤلف</TableHeadCell>
                <TableHeadCell align="right">النوع</TableHeadCell>
                <TableHeadCell align="right">الإجراءات</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((content) => (
                <TableRow key={content.id}>
                  <TableCell align="right">{content.title}</TableCell>
                  <TableCell align="right">{content.author?.name}</TableCell>
                  <TableCell align="right">{content.type}</TableCell>
                  <TableCell align="right">
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => moderateContent(content.id, 'APPROVE', '')}
                      >
                        موافقة
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => moderateContent(content.id, 'REJECT', 'محتوى غير مناسب')}
                      >
                        رفض
                      </Button>
                    </HStack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </VStack>
  );
}
