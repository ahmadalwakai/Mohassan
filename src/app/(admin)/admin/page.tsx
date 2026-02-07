import { Box, Heading, Text, VStack, SimpleGrid, HStack, Badge } from '@chakra-ui/react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import { auth } from '@/core/auth';
import { prisma } from '@/core/db/prisma';
import Link from 'next/link';

async function getAdminStats() {
  const [
    totalUsers,
    activeUsers,
    bannedUsers,
    totalContent,
    pendingContent,
    totalReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'BANNED' } }),
    prisma.content.count(),
    prisma.content.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ]);

  return { totalUsers, activeUsers, bannedUsers, totalContent, pendingContent, totalReports };
}

async function getRecentActivity() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      actor: { select: { name: true, role: true } },
    },
  });
  return logs;
}

function StatCard({ label, value, icon, color = 'brand.glow' }: { label: string; value: number; icon: string; color?: string }) {
  return (
    <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
      <HStack justify="space-between" mb={2}>
        <Text fontSize="md" color="text.muted">{label}</Text>
        <Text fontSize="2xl">{icon}</Text>
      </HStack>
      <Heading size="2xl" color={color}>
        {value.toLocaleString('ar-SA')}
      </Heading>
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
        _hover={{
          borderColor: 'brand.glow',
          boxShadow: '0 0 15px rgba(249,115,22,0.3)',
        }}
      >
        <Text fontSize="2xl" mb={2}>{icon}</Text>
        <Text color="text.primary" fontWeight="medium" fontSize="sm">{label}</Text>
      </Box>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const logs = await getRecentActivity();

  return (
    <VStack gap={8} align="stretch">
      {/* Header */}
      <Box>
        <Heading size="lg" color="text.primary" mb={1}>
          لوحة تحكم الإدارة
        </Heading>
        <Text color="text.secondary">
          إحصائيات النظام والإجراءات الإدارية الرئيسية
        </Text>
      </Box>

      {/* System Stats */}
      <Box>
        <Heading size="md" color="text.primary" mb={4}>
          نظرة عامة على النظام
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={4}>
          <StatCard label="إجمالي المستخدمين" value={stats.totalUsers} icon="👥" />
          <StatCard label="نشطون" value={stats.activeUsers} icon="✅" color="green.500" />
          <StatCard label="محظورون" value={stats.bannedUsers} icon="🔒" color="red.500" />
          <StatCard label="إجمالي المحتوى" value={stats.totalContent} icon="📄" />
          <StatCard label="قيد المراجعة" value={stats.pendingContent} icon="⏳" color="orange.500" />
          <StatCard label="بلاغات معلقة" value={stats.totalReports} icon="⚠️" color="red.600" />
        </SimpleGrid>
      </Box>

      {/* Quick Actions */}
      <Box>
        <Heading size="md" color="text.primary" mb={4}>
          إجراءات سريعة
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          <QuickAction href="/admin/users" label="إدارة المستخدمين" icon="👥" />
          <QuickAction href="/admin/settings" label="الإعدادات العامة" icon="⚙️" />
          <QuickAction href="/admin/ai-center" label="مركز الذكاء الاصطناعي" icon="🤖" />
          <QuickAction href="/admin/audit" label="سجل المراجعة" icon="📋" />
        </SimpleGrid>
      </Box>

      {/* Recent Activity */}
      <Box>
        <Heading size="md" color="text.primary" mb={4}>
          النشاط الأخير (10 سجلات)
        </Heading>
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" overflowX="auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell>الإجراء</TableHeadCell>
                <TableHeadCell>المسؤول</TableHeadCell>
                <TableHeadCell>الدور</TableHeadCell>
                <TableHeadCell>الهدف</TableHeadCell>
                <TableHeadCell>التاريخ</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.actor?.name || 'نظام'}</TableCell>
                  <TableCell>
                    <Badge
                      colorScheme={log.actor?.role === 'ADMIN' ? 'red' : log.actor?.role === 'MODERATOR' ? 'orange' : 'blue'}
                      fontSize="xs"
                    >
                      {log.actor?.role || 'SYSTEM'}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.targetType || '-'}</TableCell>
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString('ar-SA')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {logs.length === 0 && (
            <Box p={6} textAlign="center">
              <Text color="text.secondary">لا توجد سجلات نشاط</Text>
            </Box>
          )}
        </Box>
      </Box>
    </VStack>
  );
}
