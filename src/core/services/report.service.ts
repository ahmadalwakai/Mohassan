/**
 * Report Service Layer
 * Handles content reporting and moderation
 */

import { prisma } from '@/core/db/prisma';
import { ReportStatus, ReportReason, Prisma } from '@prisma/client';
import { safetyService } from './safety.service';

export interface CreateReportInput {
  contentId: string;
  reason: ReportReason;
  description?: string;
  reporterId: string;
}

export interface ReportFilters {
  status?: ReportStatus;
  reason?: ReportReason;
  contentId?: string;
  reporterId?: string;
}

export const reportService = {
  /**
   * Create a new report
   */
  async create(input: CreateReportInput) {
    // Check if user already reported this content
    const existing = await prisma.report.findFirst({
      where: {
        contentId: input.contentId,
        reporterId: input.reporterId,
        status: { in: [ReportStatus.PENDING, ReportStatus.REVIEWING] },
      },
    });

    if (existing) {
      throw new Error('لقد قمت بالإبلاغ عن هذا المحتوى مسبقاً');
    }

    // Verify content exists
    const content = await prisma.content.findUnique({
      where: { id: input.contentId },
      select: { id: true, authorId: true },
    });

    if (!content) {
      throw new Error('المحتوى غير موجود');
    }

    // Can't report your own content
    if (content.authorId === input.reporterId) {
      throw new Error('لا يمكنك الإبلاغ عن محتواك');
    }

    const report = await prisma.report.create({
      data: {
        ...input,
        status: ReportStatus.PENDING,
      },
      include: {
        content: {
          select: { id: true, title: true, type: true },
        },
        reporter: {
          select: { id: true, name: true },
        },
      },
    });

    // Auto-hide content if report threshold is reached
    await safetyService.autoHideOnReportThreshold(input.contentId, input.reason);

    return report;
  },

  /**
   * Get report by ID
   */
  async getOne(id: string) {
    return prisma.report.findUnique({
      where: { id },
      include: {
        content: {
          select: { id: true, title: true, type: true, body: true, authorId: true },
        },
        reporter: {
          select: { id: true, name: true, email: true },
        },
        reviewer: {
          select: { id: true, name: true },
        },
      },
    });
  },

  /**
   * List reports with filters
   */
  async list(filters: ReportFilters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {
      ...(filters.status && { status: filters.status }),
      ...(filters.reason && { reason: filters.reason }),
      ...(filters.contentId && { contentId: filters.contentId }),
      ...(filters.reporterId && { reporterId: filters.reporterId }),
    };

    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          content: {
            select: { id: true, title: true, type: true },
          },
          reporter: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Start reviewing a report
   */
  async startReview(id: string, reviewerId: string) {
    return prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.REVIEWING,
        reviewerId,
      },
    });
  },

  /**
   * Resolve a report
   */
  async resolve(id: string, reviewerId: string, resolution: string) {
    const report = await prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.RESOLVED,
        reviewerId,
        resolution,
        resolvedAt: new Date(),
      },
      include: {
        content: true,
      },
    });

    // Notify reporter
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'تم معالجة بلاغك',
        message: `تم معالجة بلاغك حول "${report.content.title}"`,
        userId: report.reporterId,
      },
    });

    return report;
  },

  /**
   * Dismiss a report
   */
  async dismiss(id: string, reviewerId: string, resolution: string) {
    return prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.DISMISSED,
        reviewerId,
        resolution,
        resolvedAt: new Date(),
      },
    });
  },

  /**
   * Get report statistics
   */
  async getStats() {
    const [pending, reviewing, resolved, dismissed] = await Promise.all([
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.report.count({ where: { status: ReportStatus.REVIEWING } }),
      prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
      prisma.report.count({ where: { status: ReportStatus.DISMISSED } }),
    ]);

    const byReason = await prisma.report.groupBy({
      by: ['reason'],
      _count: true,
      where: { status: ReportStatus.PENDING },
    });

    return {
      pending,
      reviewing,
      resolved,
      dismissed,
      total: pending + reviewing + resolved + dismissed,
      byReason: byReason.reduce((acc, item) => {
        acc[item.reason] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  },
};
