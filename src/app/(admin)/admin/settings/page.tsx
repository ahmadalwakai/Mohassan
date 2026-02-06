'use client';

import { Box, Heading, Text, VStack, HStack, Input, Button, Badge } from '@chakra-ui/react';
import { useState, useCallback, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import { Select } from '@/components/ui/select';

interface StaffUser {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'MODERATOR';
  createdAt: string;
  emailVerified: Date | null;
}

export default function AdminSettingsPage() {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; email: string; name: string | null; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'MODERATOR'>('MODERATOR');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchStaffUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users?role=staff');
      if (res.ok) {
        const data = await res.json();
        setStaffUsers(data.users.filter((u: StaffUser) => u.role === 'ADMIN' || u.role === 'MODERATOR'));
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      showMessage('فشل تحميل المشرفين والمسؤولين', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async () => {
    if (!searchEmail.trim()) {
      setAllUsers([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users.filter((u: { role: string }) => u.role === 'USER'));
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  }, [searchEmail]);

  useEffect(() => {
    fetchStaffUsers();
  }, [fetchStaffUsers]);

  useEffect(() => {
    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchUsers]);

  async function promoteUser() {
    if (!selectedUserId) {
      showMessage('يرجى اختيار مستخدم', 'error');
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users/${selectedUserId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (res.ok) {
        showMessage(`تم ترقية المستخدم إلى ${selectedRole === 'ADMIN' ? 'مسؤول' : 'مشرف'} بنجاح`, 'success');
        setSearchEmail('');
        setSelectedUserId('');
        setAllUsers([]);
        fetchStaffUsers();
      } else {
        const data = await res.json();
        showMessage(data.error || 'فشل ترقية المستخدم', 'error');
      }
    } catch (error) {
      console.error('Failed to promote user:', error);
      showMessage('فشل ترقية المستخدم', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function changeRole(userId: string, newRole: 'ADMIN' | 'MODERATOR' | 'USER') {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        if (newRole === 'USER') {
          showMessage('تم إزالة الصلاحيات بنجاح', 'success');
        } else {
          showMessage(`تم تحديث الدور إلى ${newRole === 'ADMIN' ? 'مسؤول' : 'مشرف'}`, 'success');
        }
        fetchStaffUsers();
      } else {
        const data = await res.json();
        showMessage(data.error || 'فشل تحديث الدور', 'error');
      }
    } catch (error) {
      console.error('Failed to change role:', error);
      showMessage('فشل تحديث الدور', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  const admins = staffUsers.filter(u => u.role === 'ADMIN');
  const moderators = staffUsers.filter(u => u.role === 'MODERATOR');

  return (
    <VStack gap={6} align="stretch">
      {/* Message notification */}
      {message && (
        <Box
          p={4}
          borderRadius="md"
          bg={message.type === 'success' ? 'green.900' : 'red.900'}
          borderWidth={1}
          borderColor={message.type === 'success' ? 'green.500' : 'red.500'}
        >
          <Text color={message.type === 'success' ? 'green.200' : 'red.200'}>
            {message.text}
          </Text>
        </Box>
      )}

      {/* System Settings Header */}
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={2}>
          إعدادات النظام
        </Heading>
        <Text color="text.secondary">
          إدارة إعدادات المنصة والصلاحيات
        </Text>
      </Box>

      {/* Add New Admin/Moderator Section */}
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="md" color="text.primary" mb={4}>
          إضافة مسؤول أو مشرف جديد
        </Heading>
        <VStack gap={4} align="stretch">
          <HStack gap={4}>
            <Input
              placeholder="ابحث بالبريد الإلكتروني..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              flex={2}
              color="text.primary"
            />
            <Select
              value={selectedRole}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRole(e.target.value as 'ADMIN' | 'MODERATOR')}
              options={[
                { value: 'MODERATOR', label: 'مشرف' },
                { value: 'ADMIN', label: 'مسؤول' },
              ]}
              style={{ flex: 1 }}
            />
            <Button
              colorScheme="green"
              onClick={promoteUser}
              disabled={!selectedUserId || actionLoading}
              loading={actionLoading}
            >
              إضافة
            </Button>
          </HStack>

          {/* User search results */}
          {allUsers.length > 0 && (
            <Box borderWidth={1} borderColor="border.default" borderRadius="md" p={2}>
              <Text color="text.secondary" fontSize="sm" mb={2}>اختر مستخدم:</Text>
              <VStack gap={2} align="stretch">
                {allUsers.map((user) => (
                  <HStack
                    key={user.id}
                    p={2}
                    borderRadius="md"
                    bg={selectedUserId === user.id ? 'green.900' : 'transparent'}
                    borderWidth={1}
                    borderColor={selectedUserId === user.id ? 'green.500' : 'border.default'}
                    cursor="pointer"
                    onClick={() => setSelectedUserId(user.id)}
                    _hover={{ bg: 'bg.tertiary' }}
                  >
                    <Text color="text.primary" flex={1}>{user.email}</Text>
                    <Text color="text.secondary" fontSize="sm">{user.name || 'بدون اسم'}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>

      {/* Admins List */}
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <HStack mb={4} justify="space-between">
          <Heading size="md" color="text.primary">
            المسؤولون
          </Heading>
          <Badge colorScheme="red" fontSize="md" px={3} py={1}>
            {admins.length}
          </Badge>
        </HStack>

        {loading ? (
          <Text color="text.secondary">جاري التحميل...</Text>
        ) : admins.length === 0 ? (
          <Text color="text.secondary">لا يوجد مسؤولون</Text>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell align="right">البريد الإلكتروني</TableHeadCell>
                <TableHeadCell align="right">الاسم</TableHeadCell>
                <TableHeadCell align="right">الحالة</TableHeadCell>
                <TableHeadCell align="right">الإجراءات</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((user) => (
                <TableRow key={user.id}>
                  <TableCell align="right">{user.email}</TableCell>
                  <TableCell align="right">{user.name || '-'}</TableCell>
                  <TableCell align="right">
                    <Badge colorScheme={user.emailVerified ? 'green' : 'yellow'}>
                      {user.emailVerified ? 'مفعل' : 'غير مفعل'}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => changeRole(user.id, 'MODERATOR')}
                        disabled={actionLoading}
                      >
                        تحويل لمشرف
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => changeRole(user.id, 'USER')}
                        disabled={actionLoading}
                      >
                        إزالة الصلاحيات
                      </Button>
                    </HStack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      {/* Moderators List */}
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <HStack mb={4} justify="space-between">
          <Heading size="md" color="text.primary">
            المشرفون
          </Heading>
          <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
            {moderators.length}
          </Badge>
        </HStack>

        {loading ? (
          <Text color="text.secondary">جاري التحميل...</Text>
        ) : moderators.length === 0 ? (
          <Text color="text.secondary">لا يوجد مشرفون</Text>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell align="right">البريد الإلكتروني</TableHeadCell>
                <TableHeadCell align="right">الاسم</TableHeadCell>
                <TableHeadCell align="right">الحالة</TableHeadCell>
                <TableHeadCell align="right">الإجراءات</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moderators.map((user) => (
                <TableRow key={user.id}>
                  <TableCell align="right">{user.email}</TableCell>
                  <TableCell align="right">{user.name || '-'}</TableCell>
                  <TableCell align="right">
                    <Badge colorScheme={user.emailVerified ? 'green' : 'yellow'}>
                      {user.emailVerified ? 'مفعل' : 'غير مفعل'}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="purple"
                        onClick={() => changeRole(user.id, 'ADMIN')}
                        disabled={actionLoading}
                      >
                        ترقية لمسؤول
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => changeRole(user.id, 'USER')}
                        disabled={actionLoading}
                      >
                        إزالة الصلاحيات
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
