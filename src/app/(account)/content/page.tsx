'use client';

import { Box, Heading, Text, VStack, HStack, Button } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';

interface Content {
  id: string;
  title: string;
  type: string;
  status: string;
}

export default function ContentPage() {
  const { data: session } = useSession();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchContent();
    }
  }, [session?.user?.id, fetchContent]);

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <HStack justify="space-between" mb={6}>
          <Heading size="lg" color="text.primary">
            المحتوى الخاص بي
          </Heading>
          <Button colorScheme="blue">محتوى جديد</Button>
        </HStack>

        {loading ? (
          <Text color="text.secondary">جاري التحميل...</Text>
        ) : content.length === 0 ? (
          <Text color="text.secondary">لم تقم بنشر أي محتوى بعد</Text>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell align="right">العنوان</TableHeadCell>
                <TableHeadCell align="right">النوع</TableHeadCell>
                <TableHeadCell align="right">الحالة</TableHeadCell>
                <TableHeadCell align="right">الإجراءات</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell align="right">{item.title}</TableCell>
                  <TableCell align="right">{item.type}</TableCell>
                  <TableCell align="right">{item.status}</TableCell>
                  <TableCell align="right">
                    <Button size="sm" variant="ghost">تعديل</Button>
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