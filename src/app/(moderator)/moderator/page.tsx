import { Box, Heading, Text, VStack, SimpleGrid, HStack, Badge } from '@chakra-ui/react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import { getModeratorDashboardData } from '@/core/services/dashboard.service';
import { type ModerationActionType } from '@prisma/client';
import Link from 'next/link';

// ─── Shared UI atoms ──────────────────────────────────

function StatCard({ label, value, icon, color = 'status.warning' }: {
  label: string; value: number | string; icon: string; color?: string;
}) {
  return (
    <Box bg="bg.secondary" p={5} borderRadius="lg" borderWidth={1} borderColor="border.default">
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" color="text.muted">{label}</Text>
        <Text fontSize="xl">{icon}</Text>
      </HStack>
      <Heading size="xl" color={color}>
        {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
      </Heading>
    </Box>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Heading size="md" color="text.primary" mb={4}>{children}</Heading>
  );
}

function EmptyState({ message, href, linkLabel }: { message: string; href?: string; linkLabel?: string }) {
  return (
    <Box p={8} textAlign="center">
      <Text color="text.secondary" mb={2}>{message}</Text>
      {href && linkLabel && (
        <Link href={href}>
          <Text color="brand.glow" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>{linkLabel}</Text>
        </Link>
      )}
    </Box>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href}>
      <Box
        bg="linear-gradient(135deg, rgba(249,178,34,0.1) 0%, rgba(249,115,22,0.1) 100%)"
        border="1px solid rgba(249,178,34,0.2)"
        borderRadius="lg"
        p={4}
        textAlign="center"
        cursor="pointer"
        transition="all 200ms"
        _hover={{ borderColor: 'status.warning', boxShadow: '0 0 15px rgba(249,178,34,0.3)' }}
      >
        <Text fontSize="2xl" mb={2}>{icon}</Text>
        <Text color="text.primary" fontWeight="medium" fontSize="sm">{label}</Text>
      </Box>
    </Link>
  );
}

// ─── helpers ──────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  news: 'أخبار',
  directory: 'دليل',
  market: 'سوق',
  community: 'مجتمع',
  initiative: 'مبادرة',
};

const REASON_LABELS: Record<string, string> = {
  SPAM: 'سبام',
  INAPPROPRIATE: 'غير لائق',
  HARASSMENT: 'تحرش',
  MISINFORMATION: 'معلومات مضللة',
  COPYRIGHT: 'حقوق نشر',
  OTHER: 'أخرى',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلق',
  REVIEWING: 'قيد المراجعة',
};

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
}

function getActionColor(action: ModerationActionType) {
  switch (action) {
    case 'WARN': return 'yellow';
    case 'HIDE': return 'orange';
    case 'TEMP_BAN':
    case 'PERM_BAN':
    case 'DELETE': return 'red';
    case 'UNHIDE':
    case 'UNBAN':
    case 'RESTORE': return 'green';
    default: return 'gray';
  }
}

// ─── Page ─────────────────────────────────────────────

export default async function ModeratorDashboardPage() {
  const { kpis, workbench, recentActions } = await getModeratorDashboardData();

  return (
    <VStack gap={8} align="stretch">
      {/* Header */}
      <Box>
        <Heading size="lg" color="text.primary" mb={1}>لوحة الإشراف</Heading>
        <Text color="text.secondary">ملخص شامل لأنشطة الإشراف وقوائم المراجعة</Text>
      </Box>

      {/* ── A) KPI Cards ── */}

      {/* Primary KPIs */}
      <Box>
        <SectionHeading>ملخص قوائم العمل</SectionHeading>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          <StatCard label="محتوى معلق" value={kpis.pendingTotal} icon="📋" color="orange.500" />
          <StatCard label="بلاغات مفتوحة" value={kpis.openReportsTotal} icon="⚠️" color="red.500" />
          <StatCard label="إجراءات اليوم" value={kpis.modActionsToday} icon="🛡️" color="blue.500" />
          <StatCard label="محتوى مخفي اليوم" value={kpis.hiddenToday} icon="👁️" color="gray.500" />
        </SimpleGrid>
      </Box>

      {/* Breakdown: Pending by type + Reports by status */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" p={5}>
          <SectionHeading>المحتوى المعلق حسب النوع</SectionHeading>
          {kpis.pendingByType.length === 0 ? (
            <EmptyState message="لا يوجد محتوى معلق 🎉" />
          ) : (
            <VStack align="stretch" gap={3}>
              {kpis.pendingByType.map((item) => (
                <HStack key={item.type} justify="space-between" px={2}>
                  <Text color="text.primary">{TYPE_LABELS[item.type] ?? item.type}</Text>
                  <Badge colorPalette="orange" fontSize="sm" px={3} py={1}>{item.count.toLocaleString('ar-SA')}</Badge>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>

        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" p={5}>
          <SectionHeading>البلاغات حسب الحالة</SectionHeading>
          {kpis.openReportsByStatus.length === 0 ? (
            <EmptyState message="لا توجد بلاغات مفتوحة 🎉" />
          ) : (
            <VStack align="stretch" gap={3}>
              {kpis.openReportsByStatus.map((item) => (
                <HStack key={item.status} justify="space-between" px={2}>
                  <Text color="text.primary">{STATUS_LABELS[item.status] ?? item.status}</Text>
                  <Badge colorPalette="red" fontSize="sm" px={3} py={1}>{item.count.toLocaleString('ar-SA')}</Badge>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      </SimpleGrid>

      {/* Actions week + today summary */}
      <SimpleGrid columns={{ base: 2 }} gap={4}>
        <StatCard label="إجراءات آخر ٧ أيام" value={kpis.modActionsWeek} icon="📊" color="blue.500" />
        <StatCard label="إجراءات اليوم" value={kpis.modActionsToday} icon="🛡️" color="orange.500" />
      </SimpleGrid>

      {/* ── B) Workbench ── */}

      {/* Priority Pending */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <SectionHeading>محتوى أولوية المراجعة (آخر ١٢)</SectionHeading>
          <Link href="/moderator/queue?status=pending">
            <Text color="brand.glow" fontSize="sm" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>عرض الكل ←</Text>
          </Link>
        </HStack>
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" overflowX="auto">
          {workbench.priorityPending.length === 0 ? (
            <EmptyState message="لا يوجد محتوى معلق" href="/moderator/queue" linkLabel="انتقل لقائمة المراجعة" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeadCell>العنوان</TableHeadCell>
                  <TableHeadCell>النوع</TableHeadCell>
                  <TableHeadCell>الكاتب</TableHeadCell>
                  <TableHeadCell>التاريخ</TableHeadCell>
                  <TableHeadCell>إجراء</TableHeadCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workbench.priorityPending.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.title.length > 45 ? `${c.title.slice(0, 45)}…` : c.title}</TableCell>
                    <TableCell><Badge colorPalette="blue" fontSize="xs">{TYPE_LABELS[c.type] ?? c.type}</Badge></TableCell>
                    <TableCell>{c.author?.name ?? maskEmail(c.author?.email ?? '')}</TableCell>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/moderator/queue?id=${c.id}`}>
                        <Text color="brand.glow" fontSize="sm" _hover={{ textDecoration: 'underline' }}>مراجعة</Text>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>

      {/* Hot Reports */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <SectionHeading>بلاغات ساخنة (آخر ١٢)</SectionHeading>
          <Link href="/moderator/reports?status=pending">
            <Text color="brand.glow" fontSize="sm" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>عرض الكل ←</Text>
          </Link>
        </HStack>
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" overflowX="auto">
          {workbench.hotReports.length === 0 ? (
            <EmptyState message="لا توجد بلاغات مفتوحة" href="/moderator/reports" linkLabel="انتقل للبلاغات" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeadCell>السبب</TableHeadCell>
                  <TableHeadCell>نوع المحتوى</TableHeadCell>
                  <TableHeadCell>الحالة</TableHeadCell>
                  <TableHeadCell>التاريخ</TableHeadCell>
                  <TableHeadCell>إجراء</TableHeadCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workbench.hotReports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{REASON_LABELS[r.reason] ?? r.reason}</TableCell>
                    <TableCell>{r.content ? (TYPE_LABELS[r.content.type] ?? r.content.type) : '-'}</TableCell>
                    <TableCell>
                      <Badge colorPalette={r.status === 'REVIEWING' ? 'yellow' : 'red'} fontSize="xs">
                        {STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/moderator/reports?id=${r.id}`}>
                        <Text color="brand.glow" fontSize="sm" _hover={{ textDecoration: 'underline' }}>مراجعة</Text>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>

      {/* ── C) Recent Moderation Actions ── */}
      <Box>
        <SectionHeading>إجراءات الإشراف الأخيرة (آخر ١٥)</SectionHeading>
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" overflowX="auto">
          {recentActions.length === 0 ? (
            <EmptyState message="لا توجد إجراءات إشراف حديثة" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeadCell>نوع الإجراء</TableHeadCell>
                  <TableHeadCell>الهدف</TableHeadCell>
                  <TableHeadCell>التاريخ</TableHeadCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActions.map((action) => {
                  const targetLabel = action.targetUserId
                    ? `مستخدم #${action.targetUserId.slice(0, 8)}`
                    : action.targetContentId
                      ? `محتوى #${action.targetContentId.slice(0, 8)}`
                      : '-';
                  return (
                    <TableRow key={action.id}>
                      <TableCell>
                        <Badge colorPalette={getActionColor(action.type)} fontSize="xs">
                          {action.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{targetLabel}</TableCell>
                      <TableCell>{formatDate(action.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>

      {/* ── D) Quick action links ── */}
      <Box>
        <SectionHeading>إجراءات سريعة</SectionHeading>
        <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
          <QuickLink href="/moderator/queue?status=pending" label="قائمة المراجعة - معلق" icon="📋" />
          <QuickLink href="/moderator/reports?status=pending" label="البلاغات - معلقة" icon="⚠️" />
          <QuickLink href="/moderator/actions" label="سجل الإجراءات" icon="📜" />
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
