'use client';

import { Box, Heading, Input, VStack, HStack, Badge } from '@chakra-ui/react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui';
import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  emailVerified: Date | null;
  bannedAt: Date | null;
  banExpiry: Date | null;
  warningsCount: number;
  createdAt: string;
}

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function DashboardUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = (session?.user as { role?: string })?.role;

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (session && userRole !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, userRole, router]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(pagination.page));
      params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('q', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        showMessage('فشل تحميل المستخدمين', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showMessage('خطأ في تحميل المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, search, roleFilter, statusFilter]);

  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetchUsers();
    }
  }, [fetchUsers, userRole]);

  async function updateUser(userId: string, updates: Record<string, string>) {
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        showMessage('تم تحديث المستخدم بنجاح', 'success');
        fetchUsers();
      } else {
        const error = await res.json();
        showMessage(error.error || 'فشل تحديث المستخدم', 'error');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      showMessage('خطأ في تحديث المستخدم', 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'red';
      case 'MODERATOR': return 'yellow';
      default: return 'blue';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'BANNED': return 'red';
      case 'SUSPENDED': return 'orange';
      default: return 'green';
    }
  };

  if (userRole !== 'ADMIN') {
    return null;
  }

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={6}>
          إدارة المستخدمين
        </Heading>

        {message && (
          <Box
            mb={4}
            p={3}
            borderRadius="md"
            bg={message.type === 'success' ? 'green.100' : 'red.100'}
            color={message.type === 'success' ? 'green.800' : 'red.800'}
          >
            {message.text}
          </Box>
        )}

        <VStack gap={4} align="stretch" mb={6}>
          <HStack gap={4}>
            <Input
              placeholder="البحث عن الاسم أو البريد..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
              flex={1}
              color="text.primary"
            />
            <Select
              value={roleFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setRoleFilter(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
              options={[
                { value: '', label: 'الدور' },
                { value: 'USER', label: 'مستخدم' },
                { value: 'MODERATOR', label: 'مشرف' },
                { value: 'ADMIN', label: 'مسؤول' },
              ]}
              style={{ width: '120px' }}
            />
            <Select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setStatusFilter(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
              options={[
                { value: '', label: 'الحالة' },
                { value: 'ACTIVE', label: 'نشط' },
                { value: 'SUSPENDED', label: 'موقوف' },
                { value: 'BANNED', label: 'محظور' },
              ]}
              style={{ width: '120px' }}
            />
          </HStack>
        </VStack>

        {loading ? (
          <Box textAlign="center" color="text.secondary" py={8}>
            جاري التحميل...
          </Box>
        ) : users.length === 0 ? (
          <Box textAlign="center" color="text.secondary" py={8}>
            لا توجد نتائج
          </Box>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeadCell align="right">البريد</TableHeadCell>
                    <TableHeadCell align="right">الاسم</TableHeadCell>
                    <TableHeadCell align="right">الدور</TableHeadCell>
                    <TableHeadCell align="right">الحالة</TableHeadCell>
                    <TableHeadCell align="right">تم التحقق</TableHeadCell>
                    <TableHeadCell align="right">الإجراءات</TableHeadCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell align="right">{user.email}</TableCell>
                      <TableCell align="right">{user.name || '-'}</TableCell>
                      <TableCell align="right">
                        <Badge colorScheme={getRoleBadgeColor(user.role)}>
                          {user.role === 'USER' ? 'مستخدم' : user.role === 'MODERATOR' ? 'مشرف' : 'مسؤول'}
                        </Badge>
                      </TableCell>
                      <TableCell align="right">
                        <Badge colorScheme={getStatusBadgeColor(user.status)}>
                          {user.status === 'ACTIVE' ? 'نشط' : user.status === 'SUSPENDED' ? 'موقوف' : 'محظور'}
                        </Badge>
                      </TableCell>
                      <TableCell align="right">
                        {user.emailVerified ? '✓' : '✗'}
                      </TableCell>
                      <TableCell align="right">
                        <VStack gap={2} align="flex-start">
                          <Select
                            value={user.role}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateUser(user.id, { role: e.target.value })}
                            disabled={updatingId === user.id}
                            options={[
                              { value: 'USER', label: 'مستخدم' },
                              { value: 'MODERATOR', label: 'مشرف' },
                              { value: 'ADMIN', label: 'مسؤول' },
                            ]}
                            style={{ width: '100px' }}
                          />
                          <Select
                            value={user.status}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateUser(user.id, { status: e.target.value })}
                            disabled={updatingId === user.id}
                            options={[
                              { value: 'ACTIVE', label: 'نشط' },
                              { value: 'SUSPENDED', label: 'موقوف' },
                              { value: 'BANNED', label: 'محظور' },
                            ]}
                            style={{ width: '100px' }}
                          />
                        </VStack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <HStack gap={4} justify="center" mt={6}>
                <Button
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  السابق
                </Button>
                <Box color="text.secondary" fontSize="sm">
                  الصفحة {pagination.page} من {pagination.totalPages} ({pagination.total} إجمالي)
                </Box>
                <Button
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  التالي
                </Button>
              </HStack>
            )}
          </>
        )}
      </Box>
    </VStack>
  );
}
