'use client';

import {
  Box, Heading, Text, VStack, HStack, Button, Badge, Input, Textarea,
} from '@chakra-ui/react';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import { useState, useCallback, useEffect } from 'react';

interface ContentItem {
  id: string;
  type: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  image: string | null;
  status: string;
  viewCount: number;
  createdAt: string;
  publishedAt: string | null;
  author: { id: string; name: string | null; email: string };
  _count: { reports: number };
}

interface ContentDetail {
  id: string;
  type: string;
  title: string;
  body: string | null;
  excerpt: string | null;
  status: string;
  viewCount: number;
  createdAt: string;
  publishedAt: string | null;
  moderatedAt: string | null;
  moderatedBy: string | null;
  rejectionReason: string | null;
  hiddenReason: string | null;
  matchedKeywords: { keyword: string; severity: string }[] | null;
  moderationTrigger: string | null;
  moderationMeta: Record<string, unknown> | null;
  author: { id: string; name: string | null; email: string };
  reports: { id: string; reason: string; status: string; createdAt: string }[];
}

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const CONTENT_TYPES = [
  { value: '', label: 'كل الأنواع' },
  { value: 'news', label: 'أخبار' },
  { value: 'directory', label: 'دليل' },
  { value: 'market', label: 'سوق' },
  { value: 'community', label: 'مجتمع' },
  { value: 'initiative', label: 'مبادرات' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'DRAFT', label: 'مسودة' },
  { value: 'PENDING', label: 'قيد المراجعة' },
  { value: 'PUBLISHED', label: 'منشور' },
  { value: 'REJECTED', label: 'مرفوض' },
  { value: 'HIDDEN', label: 'مخفي' },
  { value: 'DELETED', label: 'محذوف' },
];

const BULK_ACTIONS = [
  { value: '', label: 'إجراء جماعي...' },
  { value: 'approve', label: 'نشر' },
  { value: 'reject', label: 'رفض' },
  { value: 'unpublish', label: 'إلغاء النشر' },
  { value: 'hide', label: 'إخفاء' },
  { value: 'feature', label: 'تمييز' },
  { value: 'delete', label: 'حذف' },
];

const statusColor = (s: string) => {
  switch (s) {
    case 'PUBLISHED': return 'green';
    case 'PENDING': return 'yellow';
    case 'REJECTED': return 'red';
    case 'HIDDEN': return 'orange';
    case 'DELETED': return 'gray';
    default: return 'blue';
  }
};
const statusLabel = (s: string) => {
  switch (s) {
    case 'DRAFT': return 'مسودة';
    case 'PENDING': return 'قيد المراجعة';
    case 'PUBLISHED': return 'منشور';
    case 'REJECTED': return 'مرفوض';
    case 'HIDDEN': return 'مخفي';
    case 'DELETED': return 'محذوف';
    default: return s;
  }
};
const typeLabel = (t: string) => {
  switch (t) {
    case 'news': return 'أخبار';
    case 'directory': return 'دليل';
    case 'market': return 'سوق';
    case 'community': return 'مجتمع';
    case 'initiative': return 'مبادرات';
    default: return t;
  }
};

export default function AdminContentPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  // Bulk
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Preview drawer
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ContentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Override modal
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideAction, setOverrideAction] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideProcessing, setOverrideProcessing] = useState(false);

  const flash = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  // ── Fetch content ────────────────────────────────────────────────
  const fetchContents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(pagination.page));
      params.set('pageSize', String(pagination.pageSize));
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (q) params.set('q', q);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (flaggedOnly) params.set('flagged', 'true');

      const res = await fetch(`/api/admin/content?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContents(data.contents);
        setPagination(data.pagination);
      } else {
        flash('فشل تحميل المحتوى', 'error');
      }
    } catch {
      flash('خطأ في التحميل', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, typeFilter, statusFilter, q, dateFrom, dateTo, flaggedOnly]);

  useEffect(() => { fetchContents(); }, [fetchContents]);

  // ── Fetch detail (preview) ───────────────────────────────────────
  async function openPreview(id: string) {
    setPreviewId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/content/${id}`);
      if (res.ok) setDetail(await res.json());
    } catch { /* silent */ }
    finally { setDetailLoading(false); }
  }

  // ── Quick action ─────────────────────────────────────────────────
  async function quickAction(id: string, action: string) {
    const statusMap: Record<string, string> = {
      approve: 'PUBLISHED', reject: 'REJECTED', hide: 'HIDDEN', unpublish: 'DRAFT',
    };
    const newStatus = statusMap[action];
    if (!newStatus) return;

    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        flash('تم التحديث', 'success');
        fetchContents();
        if (previewId === id) openPreview(id);
      } else {
        const err = await res.json();
        flash(err.error || 'فشل', 'error');
      }
    } catch { flash('خطأ', 'error'); }
  }

  // ── Override action ──────────────────────────────────────────────
  async function executeOverride() {
    if (!previewId || !overrideAction || !overrideReason.trim()) return;
    try {
      setOverrideProcessing(true);
      const res = await fetch(`/api/admin/content/${previewId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: overrideAction, reason: overrideReason }),
      });
      if (res.ok) {
        flash('تم تنفيذ التجاوز بنجاح', 'success');
        setOverrideOpen(false);
        setOverrideAction('');
        setOverrideReason('');
        fetchContents();
        openPreview(previewId);
      } else {
        const err = await res.json();
        flash(err.error || 'فشل التجاوز', 'error');
      }
    } catch { flash('خطأ', 'error'); }
    finally { setOverrideProcessing(false); }
  }

  // ── Bulk ─────────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function toggleAll() {
    if (selected.size === contents.length) setSelected(new Set());
    else setSelected(new Set(contents.map(c => c.id)));
  }
  function prepareBulk(val: string) {
    if (!val || selected.size === 0) return;
    setBulkAction(val);
    setConfirmOpen(true);
  }
  async function executeBulk() {
    try {
      setBulkProcessing(true);
      const res = await fetch('/api/admin/content/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentIds: Array.from(selected), action: bulkAction }),
      });
      if (res.ok) {
        const data = await res.json();
        flash(`تم تنفيذ الإجراء على ${data.affected} محتوى`, 'success');
        setSelected(new Set());
        fetchContents();
      } else {
        const err = await res.json();
        flash(err.error || 'فشل', 'error');
      }
    } catch { flash('خطأ', 'error'); }
    finally { setBulkProcessing(false); setConfirmOpen(false); setBulkAction(''); }
  }

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={6}>إدارة المحتوى</Heading>

        {msg && (
          <Box mb={4} p={3} borderRadius="md"
            bg={msg.type === 'success' ? 'green.100' : 'red.100'}
            color={msg.type === 'success' ? 'green.800' : 'red.800'}>
            {msg.text}
          </Box>
        )}

        {/* Filters */}
        <VStack gap={3} align="stretch" mb={6}>
          <HStack gap={3} flexWrap="wrap">
            <Input placeholder="بحث بالعنوان..." value={q}
              onChange={(e) => { setQ(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              flex={1} minW="200px" color="text.primary" />
            <Select value={typeFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 }));
              }}
              options={CONTENT_TYPES} style={{ width: '140px' }} />
            <Select value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 }));
              }}
              options={STATUS_OPTIONS} style={{ width: '140px' }} />
          </HStack>
          <HStack gap={3} flexWrap="wrap">
            <HStack gap={1}>
              <Text color="text.secondary" fontSize="sm">من:</Text>
              <Input type="date" value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                color="text.primary" w="160px" />
            </HStack>
            <HStack gap={1}>
              <Text color="text.secondary" fontSize="sm">إلى:</Text>
              <Input type="date" value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                color="text.primary" w="160px" />
            </HStack>
            <Button size="sm" variant={flaggedOnly ? 'solid' : 'outline'}
              colorScheme={flaggedOnly ? 'red' : undefined}
              onClick={() => { setFlaggedOnly(!flaggedOnly); setPagination(p => ({ ...p, page: 1 })); }}>
              {flaggedOnly ? '🚩 مُبلَّغ عنه' : '🚩 فلتر البلاغات'}
            </Button>
          </HStack>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <HStack gap={3} p={3} bg="blue.900" borderRadius="md">
              <Text color="blue.200" fontSize="sm" fontWeight="bold">{selected.size} محدد</Text>
              <Select value=""
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => prepareBulk(e.target.value)}
                options={BULK_ACTIONS} style={{ width: '180px' }} />
              <Button size="xs" variant="outline" onClick={() => setSelected(new Set())}>إلغاء</Button>
            </HStack>
          )}
        </VStack>

        {/* Table */}
        {loading ? (
          <Box textAlign="center" color="text.secondary" py={8}>جاري التحميل...</Box>
        ) : contents.length === 0 ? (
          <Box textAlign="center" color="text.secondary" py={8}>لا توجد نتائج</Box>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeadCell align="right">
                      <input type="checkbox"
                        checked={selected.size === contents.length && contents.length > 0}
                        onChange={toggleAll} style={{ cursor: 'pointer' }} />
                    </TableHeadCell>
                    <TableHeadCell align="right">العنوان</TableHeadCell>
                    <TableHeadCell align="right">النوع</TableHeadCell>
                    <TableHeadCell align="right">الحالة</TableHeadCell>
                    <TableHeadCell align="right">الكاتب</TableHeadCell>
                    <TableHeadCell align="right">بلاغات</TableHeadCell>
                    <TableHeadCell align="right">مشاهدات</TableHeadCell>
                    <TableHeadCell align="right">التاريخ</TableHeadCell>
                    <TableHeadCell align="right">إجراءات</TableHeadCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contents.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell align="right">
                        <input type="checkbox" checked={selected.has(c.id)}
                          onChange={() => toggleSelect(c.id)} style={{ cursor: 'pointer' }} />
                      </TableCell>
                      <TableCell align="right">
                        <Text color="blue.400" cursor="pointer" textDecoration="underline"
                          _hover={{ color: 'blue.300' }}
                          onClick={() => openPreview(c.id)}>
                          {c.title.length > 40 ? c.title.slice(0, 40) + '...' : c.title}
                        </Text>
                      </TableCell>
                      <TableCell align="right">
                        <Badge>{typeLabel(c.type)}</Badge>
                      </TableCell>
                      <TableCell align="right">
                        <Badge colorScheme={statusColor(c.status)}>{statusLabel(c.status)}</Badge>
                      </TableCell>
                      <TableCell align="right">{c.author?.name || c.author?.email || '-'}</TableCell>
                      <TableCell align="right">
                        {c._count.reports > 0 ? (
                          <Badge colorScheme="red">🚩 {c._count.reports}</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right">{c.viewCount}</TableCell>
                      <TableCell align="right">
                        {new Date(c.createdAt).toLocaleDateString('ar')}
                      </TableCell>
                      <TableCell align="right">
                        <HStack gap={1} flexWrap="wrap">
                          {c.status !== 'PUBLISHED' && (
                            <Button size="xs" colorScheme="green" onClick={() => quickAction(c.id, 'approve')}>نشر</Button>
                          )}
                          {c.status !== 'REJECTED' && (
                            <Button size="xs" colorScheme="red" variant="outline" onClick={() => quickAction(c.id, 'reject')}>رفض</Button>
                          )}
                          {c.status === 'PUBLISHED' && (
                            <Button size="xs" variant="outline" onClick={() => quickAction(c.id, 'hide')}>إخفاء</Button>
                          )}
                        </HStack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <HStack gap={4} justify="center" mt={6}>
                <Button size="sm" disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>السابق</Button>
                <Box color="text.secondary" fontSize="sm">
                  {pagination.page} / {pagination.totalPages} ({pagination.total})
                </Box>
                <Button size="sm" disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>التالي</Button>
              </HStack>
            )}
          </>
        )}
      </Box>

      {/* Preview Drawer Modal */}
      <Modal isOpen={!!previewId} onClose={() => { setPreviewId(null); setDetail(null); }}
        title="معاينة المحتوى" size="lg">
        {detailLoading ? (
          <Box py={6} textAlign="center" color="text.secondary">جاري التحميل...</Box>
        ) : detail ? (
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <Badge colorScheme={statusColor(detail.status)}>{statusLabel(detail.status)}</Badge>
              <Badge>{typeLabel(detail.type)}</Badge>
            </HStack>
            <Heading size="md" color="text.primary">{detail.title}</Heading>
            <Text color="text.secondary" fontSize="sm">
              بواسطة {detail.author?.name || detail.author?.email} — {new Date(detail.createdAt).toLocaleDateString('ar')}
            </Text>
            {detail.excerpt && <Text color="text.secondary" fontSize="sm">{detail.excerpt}</Text>}
            {detail.body && (
              <Box maxH="300px" overflowY="auto" p={3} bg="bg.elevated" borderRadius="md">
                <Text color="text.primary" fontSize="sm" whiteSpace="pre-wrap">{detail.body}</Text>
              </Box>
            )}
            {detail.rejectionReason && (
              <Box p={3} bg="red.900" borderRadius="md">
                <Text color="red.200" fontSize="sm">سبب الرفض: {detail.rejectionReason}</Text>
              </Box>
            )}
            {/* Moderation metadata */}
            {(detail.hiddenReason || detail.moderationTrigger || detail.matchedKeywords) && (
              <Box p={3} bg="orange.900" borderRadius="md">
                <Text color="orange.200" fontWeight="bold" fontSize="sm" mb={2}>بيانات الإشراف</Text>
                {detail.hiddenReason && (
                  <Text color="orange.200" fontSize="xs" mb={1}>سبب الإخفاء: {detail.hiddenReason}</Text>
                )}
                {detail.moderationTrigger && (
                  <Text color="orange.200" fontSize="xs" mb={1}>المُحفّز: {detail.moderationTrigger}</Text>
                )}
                {detail.matchedKeywords && Array.isArray(detail.matchedKeywords) && detail.matchedKeywords.length > 0 && (
                  <HStack gap={1} flexWrap="wrap" mt={1}>
                    <Text color="orange.200" fontSize="xs">كلمات مطابقة:</Text>
                    {detail.matchedKeywords.map((kw, i) => (
                      <Badge key={i} colorScheme={kw.severity === 'high' ? 'red' : kw.severity === 'medium' ? 'orange' : 'yellow'} fontSize="xs">
                        {kw.keyword}
                      </Badge>
                    ))}
                  </HStack>
                )}
                {detail.moderationMeta && typeof detail.moderationMeta === 'object' && 'overrideReason' in detail.moderationMeta && (
                  <Box mt={2} p={2} bg="green.900" borderRadius="sm">
                    <Text color="green.200" fontSize="xs">تجاوز سابق: {String((detail.moderationMeta as Record<string, unknown>).overrideReason)}</Text>
                    <Text color="green.300" fontSize="xs">
                      بواسطة: {String((detail.moderationMeta as Record<string, unknown>).overrideActorId || '-')} — {String((detail.moderationMeta as Record<string, unknown>).overrideAt || '')}
                    </Text>
                  </Box>
                )}
              </Box>
            )}
            {detail.reports.length > 0 && (
              <Box>
                <Text color="text.secondary" fontWeight="bold" mb={2}>البلاغات ({detail.reports.length})</Text>
                {detail.reports.map(r => (
                  <Box key={r.id} p={2} bg="bg.elevated" borderRadius="sm" mb={1}>
                    <Text color="text.primary" fontSize="xs">{r.reason} — {r.status} — {new Date(r.createdAt).toLocaleDateString('ar')}</Text>
                  </Box>
                ))}
              </Box>
            )}
            {/* Quick actions in preview */}
            <HStack gap={2} pt={2} borderTop="1px solid" borderTopColor="border.default" flexWrap="wrap">
              {detail.status !== 'PUBLISHED' && (
                <Button size="sm" colorScheme="green" onClick={() => quickAction(detail.id, 'approve')}>نشر</Button>
              )}
              {detail.status !== 'REJECTED' && (
                <Button size="sm" colorScheme="red" variant="outline" onClick={() => quickAction(detail.id, 'reject')}>رفض</Button>
              )}
              {detail.status === 'PUBLISHED' && (
                <Button size="sm" variant="outline" onClick={() => quickAction(detail.id, 'hide')}>إخفاء</Button>
              )}
              {detail.status !== 'DRAFT' && (
                <Button size="sm" variant="outline" onClick={() => quickAction(detail.id, 'unpublish')}>مسودة</Button>
              )}
              {/* Admin override button */}
              {(detail.status === 'HIDDEN' || detail.matchedKeywords || detail.moderationTrigger) && (
                <Button size="sm" colorScheme="orange" onClick={() => setOverrideOpen(true)}>
                  تجاوز إداري
                </Button>
              )}
            </HStack>
          </VStack>
        ) : (
          <Box py={6} textAlign="center" color="text.secondary">لا توجد بيانات</Box>
        )}
      </Modal>

      {/* Bulk Confirmation Modal */}
      <Modal isOpen={confirmOpen} onClose={() => { setConfirmOpen(false); setBulkAction(''); }}
        title="تأكيد الإجراء الجماعي" size="sm"
        footer={
          <HStack gap={3} justify="flex-end">
            <Button variant="outline" onClick={() => { setConfirmOpen(false); setBulkAction(''); }}>إلغاء</Button>
            <Button colorScheme="red" onClick={executeBulk} loading={bulkProcessing}>تنفيذ</Button>
          </HStack>
        }>
        <Text color="text.primary">هل تريد تنفيذ &quot;{BULK_ACTIONS.find(a => a.value === bulkAction)?.label}&quot; على {selected.size} محتوى؟</Text>
      </Modal>

      {/* Override Modal */}
      <Modal isOpen={overrideOpen} onClose={() => { setOverrideOpen(false); setOverrideAction(''); setOverrideReason(''); }}
        title="تجاوز إداري" size="md"
        footer={
          <HStack gap={3} justify="flex-end">
            <Button variant="outline" onClick={() => { setOverrideOpen(false); setOverrideAction(''); setOverrideReason(''); }}>إلغاء</Button>
            <Button colorScheme="orange" onClick={executeOverride}
              loading={overrideProcessing}
              disabled={!overrideAction || !overrideReason.trim()}>
              تنفيذ التجاوز
            </Button>
          </HStack>
        }>
        <VStack gap={3} align="stretch">
          <Text color="text.secondary" fontSize="sm">
            سيتم تسجيل هذا التجاوز في سجل المراجعة. يرجى اختيار الإجراء وتقديم السبب.
          </Text>
          <Box>
            <Text color="text.secondary" fontSize="sm" mb={1}>الإجراء</Text>
            <Select value={overrideAction}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOverrideAction(e.target.value)}
              options={[
                { value: '', label: 'اختر الإجراء...' },
                { value: 'PUBLISH_ANYWAY', label: 'نشر رغم المخالفات' },
                { value: 'CLEAR_FLAGS', label: 'مسح جميع الأعلام' },
                { value: 'UNHIDE', label: 'إلغاء الإخفاء ونشر' },
              ]}
              style={{ width: '100%' }} />
          </Box>
          <Box>
            <Text color="text.secondary" fontSize="sm" mb={1}>السبب (مطلوب)</Text>
            <Textarea value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="أدخل سبب التجاوز..."
              color="text.primary" rows={3} />
          </Box>
        </VStack>
      </Modal>
    </VStack>
  );
}
