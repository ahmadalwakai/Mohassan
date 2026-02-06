'use client';

import { Box, Heading, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import { Select } from '@/components/ui/select';

interface AuditLog {
  id: string;
  action: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  targetId: string | null;
  details: string | null;
  createdAt: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  // Simple notification
  const notify = (message: string, type: string) => console.log(`[${type}] ${message}`);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const url = `/api/admin/audit?limit=50${action ? `&action=${action}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      notify('فشل تحميل السجلات', 'error');
    } finally {
      setLoading(false);
    }
  }, [action]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={6}>
          سجل المراجعة
        </Heading>

        <Select
          value={action}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAction(e.target.value)}
          options={[
            { value: '', label: 'جميع الإجراءات' },
            { value: 'UPDATE_USER_ROLE', label: 'تحديث الدور' },
            { value: 'BAN_USER', label: 'حظر مستخدم' },
            { value: 'UNBAN_USER', label: 'رفع الحظر' },
            { value: 'CONTENT_MODERATION', label: 'تعديل المحتوى' },
          ]}
          mb={4}
        />

        {loading ? (
          <div>جاري التحميل...</div>
        ) : logs.length === 0 ? (
          <div>لا توجد سجلات</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell align="right">الإجراء</TableHeadCell>
                <TableHeadCell align="right">المستخدم</TableHeadCell>
                <TableHeadCell align="right">الهدف</TableHeadCell>
                <TableHeadCell align="right">التاريخ</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell align="right">{log.action}</TableCell>
                  <TableCell align="right">{log.user?.email}</TableCell>
                  <TableCell align="right">{log.targetId}</TableCell>
                  <TableCell align="right">
                    {new Date(log.createdAt).toLocaleDateString('ar-SA')}
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
