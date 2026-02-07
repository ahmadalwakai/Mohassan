'use client';

import { Box, Heading, Input, VStack, HStack, Button, Badge, Text, Textarea } from '@chakra-ui/react';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { useState, useCallback, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import Link from 'next/link';

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

const BULK_ACTIONS = [
  { value: '', label: 'إجراء جماعي...' },
  { value: 'setRole:USER', label: 'تعيين كـ مستخدم' },
  { value: 'setRole:MODERATOR', label: 'تعيين كـ مشرف' },
  { value: 'setRole:ADMIN', label: 'تعيين كـ مسؤول' },
  { value: 'setStatus:ACTIVE', label: 'تنشيط' },
  { value: 'setStatus:SUSPENDED', label: 'إيقاف' },
  { value: 'banPerm', label: 'حظر دائم' },
  { value: 'unban', label: 'إلغاء الحظر' },
  { value: 'addWarning', label: '+ تحذير' },
  { value: 'clearWarnings', label: 'مسح التحذيرات' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1, pageSize: 20, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkReason, setBulkReason] = useState('');

  // Bulk preview
  const [bulkStep, setBulkStep] = useState<'preview' | 'confirm'>('preview');
  const [previewData, setPreviewData] = useState<{
    totalTargeted: number;
    eligible: number;
    excluded: number;
    exclusions: { userId: string; reason: string }[];
    sample: { id: string; name: string | null; email: string; role: string; status: string }[];
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

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
    fetchUsers();
  }, [fetchUsers]);

  async function updateUser(userId: string, updates: any) {
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

  // ── Bulk helpers ──────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.id)));
    }
  }

  function prepareBulk(val: string) {
    if (!val || selected.size === 0) return;
    setBulkAction(val);
    setBulkStep('preview');
    setPreviewData(null);
    setBulkReason('');
    setConfirmOpen(true);
  }

  // Check if reason is required
  const reasonRequired = (action: string): boolean => {
    const a = action.startsWith('setRole:') ? 'setRole' : action.startsWith('setStatus:') ? 'setStatus' : action;
    return ['banTemp', 'banPerm', 'setRole', 'setStatus'].includes(a);
  };

  async function fetchBulkPreview() {
    if (!bulkAction || selected.size === 0) return;
    setPreviewLoading(true);
    try {
      let action = bulkAction;
      let payload: Record<string, unknown> = { reason: bulkReason };

      if (bulkAction.startsWith('setRole:')) {
        action = 'setRole';
        payload.role = bulkAction.split(':')[1];
      } else if (bulkAction.startsWith('setStatus:')) {
        action = 'setStatus';
        payload.status = bulkAction.split(':')[1];
      }

      const res = await fetch('/api/admin/users/bulk/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from(selected), action, payload }),
      });
      if (res.ok) {
        setPreviewData(await res.json());
        setBulkStep('confirm');
      } else {
        const err = await res.json();
        showMessage(err.error || 'فشل المعاينة', 'error');
      }
    } catch {
      showMessage('خطأ في المعاينة', 'error');
    } finally {
      setPreviewLoading(false);
    }
  }

  async function executeBulk() {
    if (!bulkAction || selected.size === 0) return;
    if (reasonRequired(bulkAction) && !bulkReason.trim()) {
      showMessage('السبب مطلوب لهذا الإجراء', 'error');
      return;
    }
    try {
      setBulkProcessing(true);
      let action = bulkAction;
      let payload: Record<string, unknown> = { reason: bulkReason };

      if (bulkAction.startsWith('setRole:')) {
        action = 'setRole';
        payload = { role: bulkAction.split(':')[1], reason: bulkReason };
      } else if (bulkAction.startsWith('setStatus:')) {
        action = 'setStatus';
        payload = { status: bulkAction.split(':')[1], reason: bulkReason };
      }

      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from(selected), action, payload }),
      });

      if (res.ok) {
        const data = await res.json();
        showMessage(`تم تنفيذ الإجراء على ${data.affected} مستخدم`, 'success');
        setSelected(new Set());
        fetchUsers();
      } else {
        const err = await res.json();
        showMessage(err.error || 'فشل تنفيذ الإجراء الجماعي', 'error');
      }
    } catch {
      showMessage('خطأ في الإجراء الجماعي', 'error');
    } finally {
      setBulkProcessing(false);
      setConfirmOpen(false);
      setBulkAction('');
      setBulkReason('');
      setBulkStep('preview');
      setPreviewData(null);
    }
  }

  const getRoleBadgeColor = (role: string) =>
    role === 'ADMIN' ? 'red' : role === 'MODERATOR' ? 'yellow' : 'blue';
  const getStatusBadgeColor = (status: string) =>
    status === 'BANNED' ? 'red' : status === 'SUSPENDED' ? 'orange' : 'green';

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={6}>
          إدارة المستخدمين
        </Heading>

        {message && (
          <Box mb={4} p={3} borderRadius="md"
            bg={message.type === 'success' ? 'green.100' : 'red.100'}
            color={message.type === 'success' ? 'green.800' : 'red.800'}>
            {message.text}
          </Box>
        )}

        {/* Filters */}
        <VStack gap={4} align="stretch" mb={6}>
          <HStack gap={4}>
            <Input
              placeholder="البحث عن الاسم أو البريد..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              flex={1} color="text.primary"
            />
            <Select
              value={roleFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setRoleFilter(e.target.value); setPagination(p => ({ ...p, page: 1 }));
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
                setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 }));
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

          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <HStack gap={3} p={3} bg="blue.900" borderRadius="md">
              <Text color="blue.200" fontSize="sm" fontWeight="bold">
                {selected.size} محدد
              </Text>
              <Select
                value=""
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => prepareBulk(e.target.value)}
                options={BULK_ACTIONS}
                style={{ width: '180px' }}
              />
              <Button size="xs" variant="outline" onClick={() => setSelected(new Set())}>
                إلغاء التحديد
              </Button>
            </HStack>
          )}
        </VStack>

        {loading ? (
          <Box textAlign="center" color="text.secondary" py={8}>جاري التحميل...</Box>
        ) : users.length === 0 ? (
          <Box textAlign="center" color="text.secondary" py={8}>لا توجد نتائج</Box>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeadCell align="right">
                      <input
                        type="checkbox"
                        checked={selected.size === users.length && users.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </TableHeadCell>
                    <TableHeadCell align="right">البريد</TableHeadCell>
                    <TableHeadCell align="right">الاسم</TableHeadCell>
                    <TableHeadCell align="right">الدور</TableHeadCell>
                    <TableHeadCell align="right">الحالة</TableHeadCell>
                    <TableHeadCell align="right">تحذيرات</TableHeadCell>
                    <TableHeadCell align="right">التحقق</TableHeadCell>
                    <TableHeadCell align="right">الإجراءات</TableHeadCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell align="right">
                        <input
                          type="checkbox"
                          checked={selected.has(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell align="right">{user.email}</TableCell>
                      <TableCell align="right">
                        <Link href={`/admin/users/${user.id}`}>
                          <Text color="blue.400" textDecoration="underline" _hover={{ color: 'blue.300' }}>
                            {user.name || '-'}
                          </Text>
                        </Link>
                      </TableCell>
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
                        <Badge colorScheme={user.warningsCount > 0 ? 'orange' : 'gray'}>
                          {user.warningsCount}
                        </Badge>
                      </TableCell>
                      <TableCell align="right">{user.emailVerified ? '✓' : '✗'}</TableCell>
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
                <Button size="sm" disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                  السابق
                </Button>
                <Box color="text.secondary" fontSize="sm">
                  الصفحة {pagination.page} من {pagination.totalPages} ({pagination.total} إجمالي)
                </Box>
                <Button size="sm" disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                  التالي
                </Button>
              </HStack>
            )}
          </>
        )}
      </Box>

      {/* Bulk Preview + Confirmation Modal */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setBulkAction(''); setBulkReason(''); setBulkStep('preview'); setPreviewData(null); }}
        title={bulkStep === 'preview' ? 'معاينة الإجراء الجماعي' : 'تأكيد الإجراء الجماعي'}
        size="md"
        footer={
          <HStack gap={3} justify="flex-end">
            <Button variant="outline" onClick={() => { setConfirmOpen(false); setBulkAction(''); setBulkReason(''); setBulkStep('preview'); setPreviewData(null); }}>
              إلغاء
            </Button>
            {bulkStep === 'preview' ? (
              <Button colorScheme="blue" onClick={fetchBulkPreview}
                loading={previewLoading}
                disabled={reasonRequired(bulkAction) && !bulkReason.trim()}>
                معاينة
              </Button>
            ) : (
              <Button colorScheme="red" onClick={executeBulk} loading={bulkProcessing}>
                تنفيذ على {previewData?.eligible || 0} مستخدم
              </Button>
            )}
          </HStack>
        }
      >
        {bulkStep === 'preview' ? (
          <VStack gap={3} align="stretch">
            <Text color="text.primary">
              الإجراء: <Badge>{BULK_ACTIONS.find((a) => a.value === bulkAction)?.label || bulkAction}</Badge>
            </Text>
            <Text color="text.secondary" fontSize="sm">
              عدد المحدد: {selected.size} مستخدم
            </Text>
            {reasonRequired(bulkAction) && (
              <Box>
                <Text color="text.secondary" fontSize="sm" mb={1}>السبب (مطلوب)</Text>
                <Textarea value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="أدخل سبب الإجراء الجماعي..."
                  color="text.primary" rows={2} />
              </Box>
            )}
          </VStack>
        ) : previewData ? (
          <VStack gap={3} align="stretch">
            <HStack gap={4}>
              <Box textAlign="center">
                <Text color="text.primary" fontSize="xl" fontWeight="bold">{previewData.eligible}</Text>
                <Text color="green.400" fontSize="xs">مؤهل</Text>
              </Box>
              <Box textAlign="center">
                <Text color="text.primary" fontSize="xl" fontWeight="bold">{previewData.excluded}</Text>
                <Text color="red.400" fontSize="xs">مستبعد</Text>
              </Box>
            </HStack>

            {previewData.exclusions.length > 0 && (
              <Box>
                <Text color="text.secondary" fontSize="sm" fontWeight="bold" mb={1}>الاستبعادات:</Text>
                <VStack gap={1} align="stretch" maxH="120px" overflowY="auto">
                  {previewData.exclusions.map((ex, i) => (
                    <Text key={i} color="red.300" fontSize="xs">
                      {ex.userId.slice(0, 8)}... — {ex.reason}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}

            {previewData.sample.length > 0 && (
              <Box>
                <Text color="text.secondary" fontSize="sm" fontWeight="bold" mb={1}>عينة:</Text>
                <VStack gap={1} align="stretch">
                  {previewData.sample.map((u) => (
                    <HStack key={u.id} gap={2}>
                      <Text color="text.primary" fontSize="xs">{u.name || u.email}</Text>
                      <Badge fontSize="xs">{u.role}</Badge>
                      <Badge fontSize="xs">{u.status}</Badge>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {bulkReason && (
              <Box p={2} bg="bg.elevated" borderRadius="md">
                <Text color="text.secondary" fontSize="xs">السبب: {bulkReason}</Text>
              </Box>
            )}
          </VStack>
        ) : null}
      </Modal>
    </VStack>
  );
}
