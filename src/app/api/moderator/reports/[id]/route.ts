/**
 * POST /api/moderator/reports/[id]
 * Resolve/dismiss reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardModerator, handleApiError } from '@/core/auth/api-guard';
import { prisma } from '@/core/db/prisma';
import { writeAuditLog } from '@/core/logging/audit';
import { ReportStatusEnum } from '@/lib/validators/enums';

type Params = Promise<{ id: string }>;

const statusMap: Record<string, string> = {
  RESOLVE: 'RESOLVED',
  DISMISS: 'DISMISSED',
} as const;

export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const moderator = await guardModerator();

    const { action, resolution } = await request.json();
    if (!['RESOLVE', 'DISMISS'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = statusMap[action];
    
    // Validate status
    try {
      ReportStatusEnum.parse(newStatus);
    } catch {
      return NextResponse.json({ error: 'Invalid target status' }, { status: 400 });
    }

    // Get report with content author info
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        content: { select: { id: true, authorId: true, title: true } },
        reporter: { select: { id: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: newStatus as 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED',
        resolution: resolution,
        resolvedAt: new Date(),
        reviewerId: moderator.id,
      },
      select: { id: true, status: true },
    });

    // Create ModerationAction if report was resolved (action taken on content)
    if (action === 'RESOLVE' && report.content) {
      await prisma.moderationAction.create({
        data: {
          type: 'HIDE',
          reason: `Content reported: ${report.reason}`,
          targetContentId: report.content.id,
          moderatorId: moderator.id,
        },
      });

      // Notify content author that their content was hidden due to report
      await prisma.notification.create({
        data: {
          type: 'MODERATION',
          title: 'تم إجراء إجراء على محتواك',
          message: `تم إجراء إجراء على "${report.content.title}" بناءً على تقرير من المستخدمين`,
          userId: report.content.authorId,
          metadata: {
            actorRole: moderator.role,
            actionType: 'HIDE',
            targetType: 'CONTENT',
            targetId: report.content.id,
            reason: `Content reported: ${report.reason}`,
            createdAt: new Date(),
          },
        },
      });
    }

    // Notify reporter of decision with metadata
    await prisma.notification.create({
      data: {
        type: 'MODERATION',
        title: action === 'RESOLVE' ? 'تم معالجة تقريرك' : 'تم مراجعة تقريرك',
        message: action === 'RESOLVE' 
          ? `تم اتخاذ إجراء بناءً على تقريرك: ${resolution || 'تم إخفاء المحتوى'}`
          : `تم مراجعة تقريرك: ${resolution || 'تم رفض التقرير'}`,
        userId: report.reporter.id,
        metadata: {
          actorRole: moderator.role,
          actionType: action,
          targetType: 'REPORT',
          targetId: id,
          reason: resolution || 'No reason provided',
          createdAt: new Date(),
        },
      },
    });

    // Log action
    await writeAuditLog({
      action: action === 'RESOLVE' ? 'REPORT_RESOLVED' : 'SETTINGS_UPDATED',
      actorId: moderator.id,
      actorRole: moderator.role,
      targetType: 'REPORT',
      targetId: id,
      metadata: { decision: action, resolution },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    return handleApiError(error);
  }
}
