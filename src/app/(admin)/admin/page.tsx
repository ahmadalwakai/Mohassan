import { Box, Heading, Text, VStack, SimpleGrid, HStack, Badge } from '@chakra-ui/react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import { getAdminDashboardData } from '@/core/services/dashboard.service';
import Link from 'next/link';

// ─── Shared UI atoms ──────────────────────────────────

function StatCard({ label, value, sub, icon, color = 'brand.glow' }: {
  label: string; value: number | string; sub?: string; icon: string; color?: string;
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
      {sub && <Text fontSize="xs" color="text.muted" mt={1}>{sub}</Text>}
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

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href}>
      <Box
        bg="linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(124,58,237,0.1) 100%)"
        border="1px solid rgba(249,115,22,0.2)"
        borderRadius="lg"
        p={4}
        textAlign="center"
        cursor="pointer"
        transition="all 200ms"
        _hover={{ borderColor: 'brand.glow', boxShadow: '0 0 15px rgba(249,115,22,0.3)' }}
      >
        <Text fontSize="2xl" mb={2}>{icon}</Text>
        <Text color="text.primary" fontWeight="medium" fontSize="sm">{label}</Text>
      </Box>
    </Link>
  );
}

function FilterTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <Box
        px={4}
        py={2}
        borderRadius="md"
        bg={active ? 'brand.glow' : 'transparent'}
        color={active ? 'white' : 'text.muted'}
        fontWeight={active ? 'bold' : 'normal'}
        fontSize="sm"
        cursor="pointer"
        transition="all 200ms"
        _hover={{ bg: active ? 'brand.glow' : 'bg.secondary' }}
      >
        {label}
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

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
}

// ─── Page ─────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const auditPeriod = params.period === '24h' ? '24h' as const : '7d' as const;

  const { kpis, breakdowns, queues, activity } = await getAdminDashboardData(auditPeriod);

  return (
    <VStack gap={8} align="stretch">
      {/* Header */}
      <Box>
        <Heading size="lg" color="text.primary" mb={1}>لوحة تحكم الإدارة</Heading>
        <Text color="text.secondary">إحصائيات النظام الشاملة والإجراءات الإدارية</Text>
      </Box>

      {/* ── A) KPI Cards ── */}

      {/* Users */}
      <Box>
        <SectionHeading>المستخدمون</SectionHeading>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={4}>
          <StatCard label="إجمالي" value={kpis.users.total} icon="👥" />
          <StatCard label="نشطون" value={kpis.users.active} icon="✅" color="green.500" />
          <StatCard label="موقوفون" value={kpis.users.suspended} icon="⏸️" color="yellow.500" />
          <StatCard label="محظورون" value={kpis.users.banned} icon="🔒" color="red.500" />
          <StatCard label="بريد موثق" value={kpis.users.verified} icon="📧" color="blue.500" />
        </SimpleGrid>
      </Box>

      {/* Content */}
      <Box>
        <SectionHeading>المحتوى</SectionHeading>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={4}>
          <StatCard label="إجمالي" value={kpis.content.total} icon="📄" />
          <StatCard label="منشور" value={kpis.content.published} icon="📢" color="green.500" />
          <StatCard label="قيد المراجعة" value={kpis.content.pending} icon="⏳" color="orange.500" />
          <StatCard label="مرفوض" value={kpis.content.rejected} icon="❌" color="red.500" />
          <StatCard label="مخفي" value={kpis.content.hidden} icon="👁️" color="gray.500" />
        </SimpleGrid>
      </Box>

      {/* Reports + Moderation + AI */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
        <Box>
          <SectionHeading>البلاغات</SectionHeading>
          <VStack gap={3}>
            <StatCard label="مفتوحة" value={kpis.reports.open} icon="⚠️" color="red.500" />
            <StatCard label="محلولة" value={kpis.reports.resolved} icon="✔️" color="green.500" />
            <StatCard label="مرفوضة" value={kpis.reports.dismissed} icon="🗑️" color="gray.500" />
          </VStack>
        </Box>
        <Box>
          <SectionHeading>إجراءات الإشراف</SectionHeading>
          <VStack gap={3}>
            <StatCard label="اليوم" value={kpis.moderation.actionsToday} icon="🛡️" color="orange.500" />
            <StatCard label="آخر ٧ أيام" value={kpis.moderation.actionsWeek} icon="📊" color="blue.500" />
          </VStack>
        </Box>
        <Box>
          <SectionHeading>الذكاء الاصطناعي (٢٤ ساعة)</SectionHeading>
          <VStack gap={3}>
            <StatCard label="الطلبات" value={kpis.ai.requests24h} icon="🤖" color="purple.500" />
            <StatCard label="نسبة النجاح" value={`${kpis.ai.successRate}%`} icon="✅" color="green.500" />
            <StatCard label="متوسط الاستجابة" value={`${kpis.ai.avgLatencyMs}ms`} icon="⚡" color="yellow.500" />
          </VStack>
        </Box>
      </SimpleGrid>

      {/* ── B) Breakdown panels ── */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        {/* Pending by type */}
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" p={5}>
          <SectionHeading>المحتوى المعلق حسب النوع</SectionHeading>
          {breakdowns.pendingByType.length === 0 ? (
            <EmptyState message="لا يوجد محتوى معلق 🎉" />
          ) : (
            <VStack align="stretch" gap={3}>
              {breakdowns.pendingByType.map((item) => (
                <HStack key={item.type} justify="space-between" px={2}>
                  <Text color="text.primary">{TYPE_LABELS[item.type] ?? item.type}</Text>
                  <Badge colorPalette="orange" fontSize="sm" px={3} py={1}>{item.count.toLocaleString('ar-SA')}</Badge>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>

        {/* Reports by reason */}
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" p={5}>
          <SectionHeading>أعلى أسباب البلاغات</SectionHeading>
          {breakdowns.reportsByReason.length === 0 ? (
            <EmptyState message="لا توجد بلاغات مفتوحة 🎉" />
          ) : (
            <VStack align="stretch" gap={3}>
              {breakdowns.reportsByReason.map((item) => (
                <HStack key={item.reason} justify="space-between" px={2}>
                  <Text color="text.primary">{REASON_LABELS[item.reason] ?? item.reason}</Text>
                  <Badge colorPalette="red" fontSize="sm" px={3} py={1}>{item.count.toLocaleString('ar-SA')}</Badge>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      </SimpleGrid>

      {/* ── C) Work Queues Preview ── */}

      {/* Pending content */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <SectionHeading>محتوى قيد المراجعة (آخر ١٠)</SectionHeading>
          <Link href="/moderator/queue?status=pending">
            <Text color="brand.glow" fontSize="sm" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>عرض الكل ←</Text>
          </Link>
        </HStack>
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" overflowX="auto">
          {queues.pendingContent.length === 0 ? (
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
                {queues.pendingContent.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.title.length > 40 ? `${c.title.slice(0, 40)}…` : c.title}</TableCell>
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

      {/* Open reports */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <SectionHeading>بلاغات مفتوحة (آخر ١٠)</SectionHeading>
          <Link href="/moderator/reports?status=pending">
            <Text color="brand.glow" fontSize="sm" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>عرض الكل ←</Text>
          </Link>
        </HStack>
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" overflowX="auto">
          {queues.openReports.length === 0 ? (
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
                {queues.openReports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{REASON_LABELS[r.reason] ?? r.reason}</TableCell>
                    <TableCell>{r.content ? (TYPE_LABELS[r.content.type] ?? r.content.type) : '-'}</TableCell>
                    <TableCell>
                      <Badge colorPalette={r.status === 'REVIEWING' ? 'yellow' : 'red'} fontSize="xs">
                        {r.status === 'PENDING' ? 'معلق' : 'قيد المراجعة'}
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

      {/* ── D) Recent Activity (AuditLog) ── */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <SectionHeading>سجل النشاط الأخير (آخر ١٥)</SectionHeading>
          <HStack gap={1}>
            <FilterTab href="/admin?period=24h" label="٢٤ ساعة" active={auditPeriod === '24h'} />
            <FilterTab href="/admin?period=7d" label="٧ أيام" active={auditPeriod === '7d'} />
          </HStack>
        </HStack>
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" overflowX="auto">
          {activity.length === 0 ? (
            <EmptyState message="لا توجد سجلات في هذه الفترة" href="/admin/audit" linkLabel="عرض السجل الكامل" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeadCell>الإجراء</TableHeadCell>
                  <TableHeadCell>المسؤول</TableHeadCell>
                  <TableHeadCell>الهدف</TableHeadCell>
                  <TableHeadCell>التاريخ</TableHeadCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge colorPalette={log.actor?.role === 'ADMIN' ? 'red' : log.actor?.role === 'MODERATOR' ? 'orange' : 'blue'} fontSize="xs">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.actor?.name ?? maskEmail(log.actor?.email ?? 'نظام')}
                    </TableCell>
                    <TableCell>{log.targetType} #{log.targetId.slice(0, 8)}</TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>

      {/* ── E) Quick Links ── */}
      <Box>
        <SectionHeading>روابط سريعة</SectionHeading>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={4}>
          <QuickAction href="/admin/users" label="إدارة المستخدمين" icon="👥" />
          <QuickAction href="/admin/settings" label="الإعدادات العامة" icon="⚙️" />
          <QuickAction href="/admin/tools/ai" label="مركز الذكاء الاصطناعي" icon="🤖" />
          <QuickAction href="/admin/audit" label="سجل المراجعة" icon="📋" />
          <QuickAction href="/moderator/queue" label="قائمة المراجعة" icon="📝" />
          <QuickAction href="/moderator/reports" label="البلاغات" icon="⚠️" />
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
