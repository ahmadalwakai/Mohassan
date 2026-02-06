'use client';

import { Box, Heading, VStack, Button, HStack } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import { Select } from '@/components/ui/select';

interface ReportItem {
  id: string;
  status: string;
  reason: string;
  content: {
    id: string;
    title: string;
  };
  reporter: {
    id: string;
    name: string | null;
  };
}

export default function ModeratorReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PENDING');
  // Simple notification
  const notify = (message: string, type: string) => console.log(`[${type}] ${message}`);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/moderator/reports?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      notify('فشل تحميل البلاغات', 'error');
    } finally {
      setLoading(false);
    }
  }, [status, notify]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function handleReport(reportId: string, action: string) {
    try {
      const res = await fetch(`/api/moderator/reports/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, resolution: '' }),
      });
      if (res.ok) {
        notify('تم معالجة البلاغ', 'success');
        fetchReports();
      }
    } catch (error) {
      console.error('Failed to handle report:', error);
      notify('فشل معالجة البلاغ', 'error');
    }
  }

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={6}>
          البلاغات
        </Heading>

        <Select
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
          options={[
            { value: 'PENDING', label: 'قيد الانتظار' },
            { value: 'RESOLVED', label: 'معالجة' },
            { value: 'DISMISSED', label: 'مرفوضة' },
          ]}
          mb={4}
        />

        {loading ? (
          <div>جاري التحميل...</div>
        ) : reports.length === 0 ? (
          <div>لا توجد بلاغات</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell align="right">المحتوى</TableHeadCell>
                <TableHeadCell align="right">المبلغ</TableHeadCell>
                <TableHeadCell align="right">السبب</TableHeadCell>
                <TableHeadCell align="right">الإجراءات</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell align="right">{report.content?.title}</TableCell>
                  <TableCell align="right">{report.reporter?.name}</TableCell>
                  <TableCell align="right">{report.reason}</TableCell>
                  <TableCell align="right">
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleReport(report.id, 'RESOLVE')}
                      >
                        معالجة
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="gray"
                        onClick={() => handleReport(report.id, 'DISMISS')}
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
