/**
 * POST /api/moderator/content/[id]
 * Moderate content (approve/reject/hide)
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardModerator, handleApiError } from '@/core/auth/api-guard';
import { prisma } from '@/core/db/prisma';
import { writeAuditLog } from '@/core/logging/audit';
import { ContentStatusEnum } from '@/lib/validators/enums';

type Params = Promise<{ id: string }>;

const statusMap: Record<string, string> = {
  APPROVE: 'PUBLISHED',
  REJECT: 'REJECTED',
  HIDE: 'HIDDEN',
} as const;

export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const moderator = await guardModerator();

    const { action, reason } = await request.json();
    if (!['APPROVE', 'REJECT', 'HIDE'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = statusMap[action];
    
    // Validate that mapped status is a valid ContentStatus enum
    try {
      ContentStatusEnum.parse(newStatus);
    } catch {
      return NextResponse.json({ error: 'Invalid target status' }, { status: 400 });
    }

    // Get content author before updating
    const content = await prisma.content.findUnique({
      where: { id },
      select: { id: true, authorId: true, title: true },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        status: newStatus as 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'HIDDEN' | 'DELETED',
        rejectionReason: action === 'REJECT' ? reason : null,
        moderatedBy: moderator.id,
        moderatedAt: new Date(),
      },
      select: { id: true, status: true },
    });

    // Create ModerationAction record
    const actionTypeMap: Record<string, 'WARN' | 'HIDE' | 'UNHIDE' | 'TEMP_BAN' | 'PERM_BAN' | 'UNBAN' | 'DELETE' | 'RESTORE'> = {
      HIDE: 'HIDE',
      REJECT: 'DELETE',
      APPROVE: 'RESTORE',
    };

    await prisma.moderationAction.create({
      data: {
        type: actionTypeMap[action] || 'WARN',
        reason: reason || 'Moderation decision',
        targetContentId: content.id,
        moderatorId: moderator.id,
      },
    });

    // Notify content author with proper metadata
    const notificationMessages: Record<string, { title: string; message: string }> = {
      APPROVE: {
        title: 'تمت الموافقة على محتواك',
        message: `تمت الموافقة على "${content.title}" وأصبح مرئياً للجميع`,
      },
      REJECT: {
        title: 'تم رفض محتواك',
        message: `تم رفض "${content.title}"${reason ? ': ' + reason : ''}`,
      },
      HIDE: {
        title: 'تم إخفاء محتواك',
        message: `تم إخفاء "${content.title}" من المشاهدة العامة`,
      },
    };

    const notif = notificationMessages[action];
    if (notif) {
      await prisma.notification.create({
        data: {
          type: 'MODERATION',
          title: notif.title,
          message: notif.message,
          userId: content.authorId,
          metadata: {
            actorRole: moderator.role,
            actionType: action,
            targetType: 'CONTENT',
            targetId: id,
            reason: reason || 'No reason provided',
            createdAt: new Date(),
          },
        },
      });
    }

    // Log action to audit log
    await writeAuditLog({
      action: action === 'APPROVE' ? 'CONTENT_CREATED' : action === 'REJECT' ? 'CONTENT_DELETED' : 'CONTENT_HIDDEN',
      actorId: moderator.id,
      actorRole: moderator.role,
      targetType: 'CONTENT',
      targetId: id,
      metadata: { decision: action, reason },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    return handleApiError(error);
  }
}
