'use client';

import { Box, Heading, Input, VStack, Button } from '@chakra-ui/react';
import { useState, useCallback, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import { Select } from '@/components/ui/select';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  bannedAt: Date | null;
  emailVerified: Date | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // Simple notification
  const notify = (message: string, type: string) => console.log(`[${type}] ${message}`);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${search}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      notify('فشل تحميل المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function changeRole(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        notify('تم تحديث الدور', 'success');
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to change role:', error);
      notify('فشل تحديث الدور', 'error');
    }
  }

  async function toggleBan(userId: string, banned: boolean) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned: !banned }),
      });
      if (res.ok) {
        notify(!banned ? 'تم حظر المستخدم' : 'تم رفع الحظر', 'success');
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to toggle ban:', error);
      notify('فشل تنفيذ العملية', 'error');
    }
  }

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={6}>
          إدارة المستخدمين
        </Heading>

        <Input
          placeholder="البحث عن مستخدم..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          mb={4}
          color="text.primary"
        />

        {loading ? (
          <div>جاري التحميل...</div>
        ) : users.length === 0 ? (
          <div>لا توجد نتائج</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell align="right">البريد</TableHeadCell>
                <TableHeadCell align="right">الاسم</TableHeadCell>
                <TableHeadCell align="right">الدور</TableHeadCell>
                <TableHeadCell align="right">الحالة</TableHeadCell>
                <TableHeadCell align="right">الإجراءات</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell align="right">{user.email}</TableCell>
                  <TableCell align="right">{user.name}</TableCell>
                  <TableCell align="right">
                    <Select
                      value={user.role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeRole(user.id, e.target.value)}
                      options={[
                        { value: 'USER', label: 'USER' },
                        { value: 'MODERATOR', label: 'MODERATOR' },
                        { value: 'ADMIN', label: 'ADMIN' },
                      ]}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {user.bannedAt ? 'محظور' : user.emailVerified ? 'نشط' : 'قيد الانتظار'}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme={user.bannedAt ? 'green' : 'red'}
                      onClick={() => toggleBan(user.id, !!user.bannedAt)}
                    >
                      {user.bannedAt ? 'رفع الحظر' : 'حظر'}
                    </Button>
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
