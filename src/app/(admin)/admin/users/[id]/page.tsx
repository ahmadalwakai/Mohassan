'use client';

import {
  Box, Heading, Text, VStack, HStack, Badge, Button, Textarea, Input,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Select } from '@/components/ui/select';
import Link from 'next/link';

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  emailVerified: string | null;
  bannedAt: string | null;
  banReason: string | null;
  banExpiry: string | null;
  warningsCount: number;
  createdAt: string;
  _count: {
    contents: number;
    reportsFiled: number;
    notifications: number;
  };
}

interface AdminNote {
  id: string;
  note: string;
  actorId: string;
  actor: { name: string | null; email: string };
  createdAt: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const flash = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  // ── Fetch user ----------------------------------------------------------------
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?q=${userId}&pageSize=1`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      // API returns list; find exact match
      if (data.users?.length) {
        // Fetch full detail via dedicated endpoint
        const detailRes = await fetch(`/api/admin/users/${userId}`);
        if (detailRes.ok) {
          setUser(await detailRes.json());
        }
      }
    } catch {
      flash('فشل تحميل بيانات المستخدم', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ── Fetch notes ---------------------------------------------------------------
  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes ?? []);
      }
    } catch {
      // silent
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
    fetchNotes();
  }, [fetchUser, fetchNotes]);

  // ── Update user field --------------------------------------------------------
  async function updateField(updates: Record<string, unknown>) {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(prev => prev ? { ...prev, ...updated } : prev);
        flash('تم التحديث بنجاح', 'success');
      } else {
        const err = await res.json();
        flash(err.error || 'فشل التحديث', 'error');
      }
    } catch {
      flash('خطأ في التحديث', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Add note -----------------------------------------------------------------
  async function addNote() {
    if (!newNote.trim()) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/users/${userId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim() }),
      });
      if (res.ok) {
        setNewNote('');
        fetchNotes();
        flash('تمت إضافة الملاحظة', 'success');
      } else {
        flash('فشل إضافة الملاحظة', 'error');
      }
    } catch {
      flash('خطأ', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Render -------------------------------------------------------------------
  if (loading) {
    return <Box py={10} textAlign="center" color="text.secondary">جاري التحميل...</Box>;
  }
  if (!user) {
    return <Box py={10} textAlign="center" color="text.secondary">المستخدم غير موجود</Box>;
  }

  const roleBadge = (r: string) =>
    r === 'ADMIN' ? 'red' : r === 'MODERATOR' ? 'yellow' : 'blue';
  const statusBadge = (s: string) =>
    s === 'BANNED' ? 'red' : s === 'SUSPENDED' ? 'orange' : 'green';

  return (
    <VStack gap={6} align="stretch">
      {/* Back link */}
      <Box>
        <Link href="/admin/users">
          <Button variant="outline" size="sm">→ العودة للقائمة</Button>
        </Link>
      </Box>

      {msg && (
        <Box p={3} borderRadius="md"
          bg={msg.type === 'success' ? 'green.100' : 'red.100'}
          color={msg.type === 'success' ? 'green.800' : 'red.800'}>
          {msg.text}
        </Box>
      )}

      {/* Profile Card */}
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="md" color="text.primary" mb={4}>الملف الشخصي</Heading>
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between">
            <Text color="text.secondary">البريد:</Text>
            <Text color="text.primary">{user.email}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.secondary">الاسم:</Text>
            <Text color="text.primary">{user.name || '-'}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.secondary">الموقع:</Text>
            <Text color="text.primary">{user.location || '-'}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.secondary">الهاتف:</Text>
            <Text color="text.primary">{user.phone || '-'}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.secondary">النبذة:</Text>
            <Text color="text.primary" maxW="60%">{user.bio || '-'}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.secondary">تاريخ الإنشاء:</Text>
            <Text color="text.primary">{new Date(user.createdAt).toLocaleDateString('ar')}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.secondary">التحقق من البريد:</Text>
            <Text color="text.primary">{user.emailVerified ? '✓ تم التحقق' : '✗ لم يتم'}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.secondary">المحتويات:</Text>
            <Text color="text.primary">{user._count?.contents ?? 0}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.secondary">البلاغات المقدمة:</Text>
            <Text color="text.primary">{user._count?.reportsFiled ?? 0}</Text>
          </HStack>
        </VStack>
      </Box>

      {/* Role & Status Card */}
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="md" color="text.primary" mb={4}>الدور والحالة</Heading>
        <VStack gap={4} align="stretch">
          <HStack gap={4}>
            <Box flex={1}>
              <Text color="text.secondary" mb={1}>الدور</Text>
              <HStack gap={2}>
                <Badge colorScheme={roleBadge(user.role)}>
                  {user.role === 'ADMIN' ? 'مسؤول' : user.role === 'MODERATOR' ? 'مشرف' : 'مستخدم'}
                </Badge>
                <Select
                  value={user.role}
                  onChange={(e) => updateField({ role: e.target.value })}
                  disabled={saving}
                  options={[
                    { value: 'USER', label: 'مستخدم' },
                    { value: 'MODERATOR', label: 'مشرف' },
                    { value: 'ADMIN', label: 'مسؤول' },
                  ]}
                  style={{ width: '120px' }}
                />
              </HStack>
            </Box>
            <Box flex={1}>
              <Text color="text.secondary" mb={1}>الحالة</Text>
              <HStack gap={2}>
                <Badge colorScheme={statusBadge(user.status)}>
                  {user.status === 'ACTIVE' ? 'نشط' : user.status === 'SUSPENDED' ? 'موقوف' : 'محظور'}
                </Badge>
                <Select
                  value={user.status}
                  onChange={(e) => updateField({ status: e.target.value })}
                  disabled={saving}
                  options={[
                    { value: 'ACTIVE', label: 'نشط' },
                    { value: 'SUSPENDED', label: 'موقوف' },
                    { value: 'BANNED', label: 'محظور' },
                  ]}
                  style={{ width: '120px' }}
                />
              </HStack>
            </Box>
          </HStack>

          <HStack justify="space-between">
            <Text color="text.secondary">التحذيرات:</Text>
            <HStack gap={2}>
              <Badge colorScheme={user.warningsCount > 0 ? 'orange' : 'green'}>
                {user.warningsCount}
              </Badge>
              {user.warningsCount > 0 && (
                <Button size="xs" colorScheme="red" variant="outline"
                  onClick={() => updateField({ clearWarnings: true })} disabled={saving}>
                  مسح التحذيرات
                </Button>
              )}
              <Button size="xs" colorScheme="orange" variant="outline"
                onClick={() => updateField({ addWarning: true })} disabled={saving}>
                + تحذير
              </Button>
            </HStack>
          </HStack>

          {user.bannedAt && (
            <VStack align="stretch" gap={1} p={3} bg="red.900" borderRadius="md">
              <Text color="red.200" fontWeight="bold">معلومات الحظر</Text>
              <Text color="red.300" fontSize="sm">
                تاريخ الحظر: {new Date(user.bannedAt).toLocaleDateString('ar')}
              </Text>
              {user.banExpiry && (
                <Text color="red.300" fontSize="sm">
                  انتهاء الحظر: {new Date(user.banExpiry).toLocaleDateString('ar')}
                </Text>
              )}
              {user.banReason && (
                <Text color="red.300" fontSize="sm">السبب: {user.banReason}</Text>
              )}
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Internal Notes */}
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="md" color="text.primary" mb={4}>ملاحظات داخلية</Heading>

        <VStack gap={3} align="stretch" mb={4}>
          <HStack gap={2}>
            <Textarea
              placeholder="اكتب ملاحظة داخلية..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              color="text.primary"
              rows={2}
            />
            <Button colorScheme="blue" onClick={addNote} disabled={saving || !newNote.trim()}>
              إضافة
            </Button>
          </HStack>
        </VStack>

        {notes.length === 0 ? (
          <Text color="text.secondary" fontSize="sm">لا توجد ملاحظات بعد</Text>
        ) : (
          <VStack gap={3} align="stretch">
            {notes.map((n) => (
              <Box key={n.id} p={3} bg="bg.elevated" borderRadius="md">
                <Text color="text.primary" fontSize="sm" mb={1}>{n.note}</Text>
                <Text color="text.secondary" fontSize="xs">
                  بواسطة {n.actor?.name || n.actor?.email} — {new Date(n.createdAt).toLocaleString('ar')}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
