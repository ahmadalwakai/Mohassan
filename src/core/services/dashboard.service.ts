/**
 * Dashboard Service
 * Server-only helper for admin & moderator dashboard data.
 * All queries use Prisma aggregate / groupBy for efficiency.
 *
 * Admin  dashboard: 8 Prisma queries total (1 Promise.all)
 * Moderator dashboard: 6 Prisma queries total (1 Promise.all)
 */

import { prisma } from '@/core/db/prisma';

// ─── helpers ───────────────────────────────────────────

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000);
}

function daysAgo(d: number) {
  return new Date(Date.now() - d * 86_400_000);
}

function sumBy<T>(arr: T[], fn: (item: T) => number) {
  return arr.reduce((s, item) => s + fn(item), 0);
}

// ─── ADMIN DASHBOARD (8 queries) ──────────────────────

export async function getAdminDashboardData(auditPeriod: '24h' | '7d' = '7d') {
  const today = startOfToday();
  const sevenDaysAgo = daysAgo(7);
  const twentyFourHoursAgo = hoursAgo(24);
  const auditSince = auditPeriod === '24h' ? twentyFourHoursAgo : sevenDaysAgo;

  const [
    usersByStatus,          // Q1
    contentByStatusType,    // Q2
    reportsByStatusReason,  // Q3
    modActionsRaw,          // Q4
    aiBySuccess,            // Q5
    pendingContentList,     // Q6
    openReportsList,        // Q7
    activityList,           // Q8
  ] = await Promise.all([
    // Q1 – user KPIs: groupBy status; field-level _count gives verified per group
    prisma.user.groupBy({
      by: ['status'],
      _count: { _all: true, emailVerified: true },
    }),
    // Q2 – content KPIs + pending-by-type breakdown in one shot
    prisma.content.groupBy({
      by: ['status', 'type'],
      _count: { _all: true },
    }),
    // Q3 – report KPIs + reports-by-reason breakdown in one shot
    prisma.report.groupBy({
      by: ['status', 'reason'],
      _count: { _all: true },
    }),
    // Q4 – mod actions last 7 d (derive today + week counts in JS)
    prisma.moderationAction.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    // Q5 – AI stats: groupBy success → total, success count, weighted avg latency
    prisma.aIEventLog.groupBy({
      by: ['success'],
      where: { createdAt: { gte: twentyFourHoursAgo } },
      _count: { _all: true },
      _avg: { latencyMs: true },
    }),
    // Q6 – pending content preview (table)
    prisma.content.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, title: true, type: true, createdAt: true, author: { select: { name: true, email: true } } },
    }),
    // Q7 – open reports preview (table)
    prisma.report.findMany({
      where: { status: { in: ['PENDING', 'REVIEWING'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, reason: true, status: true, createdAt: true, content: { select: { type: true, title: true } } },
    }),
    // Q8 – audit log
    prisma.auditLog.findMany({
      where: { createdAt: { gte: auditSince } },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: { id: true, action: true, targetType: true, targetId: true, createdAt: true, actor: { select: { name: true, email: true, role: true } } },
    }),
  ]);

  // ── derive user KPIs from Q1 ──
  const usersTotal = sumBy(usersByStatus, (g) => g._count._all);
  const usersActive = usersByStatus.find((g) => g.status === 'ACTIVE')?._count._all ?? 0;
  const usersSuspended = usersByStatus.find((g) => g.status === 'SUSPENDED')?._count._all ?? 0;
  const usersBanned = usersByStatus.find((g) => g.status === 'BANNED')?._count._all ?? 0;
  const usersVerified = sumBy(usersByStatus, (g) => g._count.emailVerified);

  // ── derive content KPIs + pendingByType from Q2 ──
  const contentTotal = sumBy(contentByStatusType, (g) => g._count._all);
  const cntByStatus = (s: string) => sumBy(contentByStatusType.filter((g) => g.status === s), (g) => g._count._all);
  const contentPublished = cntByStatus('PUBLISHED');
  const contentPending = cntByStatus('PENDING');
  const contentRejected = cntByStatus('REJECTED');
  const contentHidden = cntByStatus('HIDDEN');

  const pendingByType = contentByStatusType
    .filter((g) => g.status === 'PENDING')
    .map((g) => ({ type: g.type, count: g._count._all }));

  // ── derive report KPIs + reportsByReason from Q3 ──
  const rptByStatus = (s: string[]) => sumBy(reportsByStatusReason.filter((g) => s.includes(g.status)), (g) => g._count._all);
  const reportsOpen = rptByStatus(['PENDING', 'REVIEWING']);
  const reportsResolved = rptByStatus(['RESOLVED']);
  const reportsDismissed = rptByStatus(['DISMISSED']);

  const reasonMap = new Map<string, number>();
  for (const g of reportsByStatusReason.filter((g) => g.status === 'PENDING' || g.status === 'REVIEWING')) {
    reasonMap.set(g.reason, (reasonMap.get(g.reason) ?? 0) + g._count._all);
  }
  const reportsByReason = Array.from(reasonMap.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ── derive mod KPIs from Q4 ──
  const modActionsWeek = modActionsRaw.length;
  const modActionsToday = modActionsRaw.filter((a) => a.createdAt >= today).length;

  // ── derive AI KPIs from Q5 ──
  const aiTotal = sumBy(aiBySuccess, (g) => g._count._all);
  const aiSuccessCount = aiBySuccess.find((g) => g.success)?._count._all ?? 0;
  let aiAvgLatency = 0;
  if (aiTotal > 0) {
    aiAvgLatency = Math.round(sumBy(aiBySuccess, (g) => (g._avg.latencyMs ?? 0) * g._count._all) / aiTotal);
  }

  return {
    kpis: {
      users: { total: usersTotal, active: usersActive, suspended: usersSuspended, banned: usersBanned, verified: usersVerified },
      content: { total: contentTotal, published: contentPublished, pending: contentPending, rejected: contentRejected, hidden: contentHidden },
      reports: { open: reportsOpen, resolved: reportsResolved, dismissed: reportsDismissed },
      moderation: { actionsToday: modActionsToday, actionsWeek: modActionsWeek },
      ai: {
        requests24h: aiTotal,
        successRate: aiTotal > 0 ? Math.round((aiSuccessCount / aiTotal) * 100) : 0,
        avgLatencyMs: aiAvgLatency,
      },
    },
    breakdowns: { pendingByType, reportsByReason },
    queues: { pendingContent: pendingContentList, openReports: openReportsList },
    activity: activityList,
  };
}

// ─── MODERATOR DASHBOARD (6 queries) ──────────────────

export async function getModeratorDashboardData() {
  const today = startOfToday();
  const sevenDaysAgo = daysAgo(7);

  const [
    pendingByType,       // Q1
    reportsByStatus,     // Q2
    modActionsRaw,       // Q3 (counts in JS + recent 15 rows)
    hiddenToday,         // Q4
    priorityPending,     // Q5
    hotReports,          // Q6
  ] = await Promise.all([
    // Q1 – pending content grouped by type
    prisma.content.groupBy({
      by: ['type'],
      where: { status: 'PENDING' },
      _count: { _all: true },
    }),
    // Q2 – open reports by status
    prisma.report.groupBy({
      by: ['status'],
      where: { status: { in: ['PENDING', 'REVIEWING'] } },
      _count: { _all: true },
    }),
    // Q3 – mod actions last 7 d: derive week/today counts + recentActions (first 15)
    prisma.moderationAction.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, type: true, createdAt: true, targetUserId: true, targetContentId: true },
    }),
    // Q4 – hidden today
    prisma.content.count({ where: { status: 'HIDDEN', updatedAt: { gte: today } } }),
    // Q5 – priority pending table
    prisma.content.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, title: true, type: true, createdAt: true, author: { select: { name: true, email: true } } },
    }),
    // Q6 – hot reports table
    prisma.report.findMany({
      where: { status: { in: ['PENDING', 'REVIEWING'] } },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, reason: true, status: true, createdAt: true, content: { select: { type: true, title: true } } },
    }),
  ]);

  // ── derive KPIs ──
  const pendingTotal = sumBy(pendingByType, (g) => g._count._all);
  const openReportsTotal = sumBy(reportsByStatus, (g) => g._count._all);
  const modActionsWeek = modActionsRaw.length;
  const modActionsToday = modActionsRaw.filter((a) => a.createdAt >= today).length;
  const recentActions = modActionsRaw.slice(0, 15);

  return {
    kpis: {
      pendingTotal,
      pendingByType: pendingByType.map((g) => ({ type: g.type, count: g._count._all })),
      openReportsTotal,
      openReportsByStatus: reportsByStatus.map((g) => ({ status: g.status, count: g._count._all })),
      modActionsToday,
      modActionsWeek,
      hiddenToday,
    },
    workbench: { priorityPending, hotReports },
    recentActions,
  };
}
