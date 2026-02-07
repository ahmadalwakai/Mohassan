import { Box, Heading, Text, VStack, SimpleGrid, HStack, Badge } from '@chakra-ui/react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import { auth } from '@/core/auth';
import { prisma } from '@/core/db/prisma';
import { ModerationActionType } from '@prisma/client';
import Link from 'next/link';

async function getModeratorStats() {
  const [
    pendingContent,
    reportedContent,
    hiddenToday,
  ] = await Promise.all([
    prisma.content.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.content.count({
      where: {
        status: 'HIDDEN',
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return { pendingContent, reportedContent, hiddenToday };
}

async function getRecentActions() {
  const actions = await prisma.moderationAction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      moderator: { select: { name: true } },
      targetUser: { select: { id: true } },
      targetContent: { select: { id: true } },
    },
  });
  return actions;
}

function StatCard({ label, value, icon, color = 'status.warning' }: { label: string; value: number; icon: string; color?: string }) {
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
        _hover={{
          borderColor: 'status.warning',
          boxShadow: '0 0 15px rgba(249,178,34,0.3)',
        }}
      >
        <Text fontSize="2xl" mb={2}>{icon}</Text>
        <Text color="text.primary" fontWeight="medium" fontSize="sm">{label}</Text>
      </Box>
    </Link>
  );
}

function getActionColor(action: ModerationActionType) {
  switch (action) {
    case 'WARN':
      return 'yellow';
    case 'HIDE':
      return 'orange';
    case 'TEMP_BAN':
      return 'red';
    case 'PERM_BAN':
      return 'red';
    case 'DELETE':
      return 'red';
    case 'UNHIDE':
    case 'UNBAN':
    case 'RESTORE':
      return 'green';
    default:
      return 'gray';
  }
}

export default async function ModeratorDashboardPage() {
  const stats = await getModeratorStats();
  const actions = await getRecentActions();

  return (
    <VStack gap={8} align="stretch">
      {/* Header */}
      <Box>
        <Heading size="lg" color="text.primary" mb={1}>
          لوحة الإشراف
        </Heading>
        <Text color="text.secondary">
          ملخص أنشطة الإشراف والمحتوى قيد المراجعة
        </Text>
      </Box>

      {/* Queue Summary */}
      <Box>
        <Heading size="md" color="text.primary" mb={4}>
          ملخص قائمة المراجعة
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <StatCard label="محتوى قيد المراجعة" value={stats.pendingContent} icon="📋" color="orange.500" />
          <StatCard label="بلاغات مفتوحة" value={stats.reportedContent} icon="⚠️" color="red.500" />
          <StatCard label="محتوى مخفي اليوم" value={stats.hiddenToday} icon="👁️" color="blue.500" />
        </SimpleGrid>
      </Box>

      {/* Quick Links */}
      <Box>
        <Heading size="md" color="text.primary" mb={4}>
          إجراءات سريعة
        </Heading>
        <SimpleGrid columns={{ base: 2 }} gap={4}>
          <QuickLink href="/moderator/queue" label="قائمة المراجعة" icon="📋" />
          <QuickLink href="/moderator/reports" label="البلاغات" icon="⚠️" />
        </SimpleGrid>
      </Box>

      {/* Recent Actions */}
      <Box>
        <Heading size="md" color="text.primary" mb={4}>
          الإجراءات الأخيرة (10 سجلات)
        </Heading>
        <Box bg="bg.secondary" borderRadius="lg" borderWidth={1} borderColor="border.default" overflowX="auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell>نوع الإجراء</TableHeadCell>
                <TableHeadCell>المشرف</TableHeadCell>
                <TableHeadCell>نوع الهدف</TableHeadCell>
                <TableHeadCell>الهدف</TableHeadCell>
                <TableHeadCell>التاريخ</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => {
                const targetType = action.targetUserId ? 'USER' : action.targetContentId ? 'CONTENT' : '-';
                const targetId = action.targetUserId || action.targetContentId || '-';
                return (
                  <TableRow key={action.id}>
                    <TableCell>
                      <Badge colorScheme={getActionColor(action.type)} fontSize="xs">
                        {action.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{action.moderator?.name || 'نظام'}</TableCell>
                    <TableCell>{targetType}</TableCell>
                    <TableCell>{typeof targetId === 'string' ? targetId.slice(0, 8) : '-'}</TableCell>
                    <TableCell>
                      {new Date(action.createdAt).toLocaleString('ar-SA')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {actions.length === 0 && (
            <Box p={6} textAlign="center">
              <Text color="text.secondary">لا توجد إجراءات إشراف</Text>
            </Box>
          )}
        </Box>
      </Box>
    </VStack>
  );
}
