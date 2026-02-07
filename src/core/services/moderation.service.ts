/**
 * Moderation Service Layer
 * Admin moderation actions for content and users
 */

import { prisma } from '@/core/db/prisma';
import { ContentStatus, UserStatus, Prisma } from '@prisma/client';
import { aiService } from './ai.service';
import { writeAuditLog } from '@/core/logging/audit';
import type { Role } from '@/core/config/rbac';

export interface ModerationStats {
  pendingContent: number;
  pendingReports: number;
  bannedUsers: number;
  flaggedContent: number;
}

export interface ContentModerationFilters {
  status?: ContentStatus;
  type?: string;
  authorId?: string;
  flagged?: boolean;
}

export const moderationService = {
  /**
   * Get pending content for moderation
   */
  async getPendingContent(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where: { status: ContentStatus.PENDING },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }, // FIFO
        include: {
          author: {
            select: { id: true, name: true, email: true, role: true },
          },
          _count: {
            select: { reports: true },
          },
        },
      }),
      prisma.content.count({ where: { status: ContentStatus.PENDING } }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  /**
   * Get flagged content (with reports)
   */
  async getFlaggedContent(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: Prisma.ContentWhereInput = {
      reports: { some: { status: 'PENDING' } },
      status: ContentStatus.PUBLISHED,
    };

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          reports: {
            where: { status: 'PENDING' },
            select: { id: true, reason: true, description: true, createdAt: true },
          },
          _count: {
            select: { reports: true },
          },
        },
      }),
      prisma.content.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  /**
   * Approve content with optional AI check
   */
  async approveContent(contentId: string, moderatorId: string, moderatorRole: Role = 'MODERATOR', skipAI = false) {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: { id: true, title: true, body: true, authorId: true },
    });

    if (!content) {
      throw new Error('المحتوى غير موجود');
    }

    // Optional AI double-check
    if (!skipAI) {
      const moderation = await aiService.moderateContent(
        `${content.title}\n\n${content.body}`,
        contentId,
        moderatorId
      );

      if (!moderation.approved) {
        // Flag for manual review with AI concerns
        return {
          approved: false,
          aiConcerns: moderation.categories,
          message: 'AI flagged potential issues - please review manually',
        };
      }
    }

    // Update content status
    const updated = await prisma.content.update({
      where: { id: contentId },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    // Create ModerationAction
    await prisma.moderationAction.create({
      data: {
        type: 'RESTORE',
        reason: 'Content approved',
        targetContentId: contentId,
        moderatorId,
      },
    });

    // Notify author with metadata
    await prisma.notification.create({
      data: {
        type: 'MODERATION',
        title: 'تمت الموافقة على محتواك',
        message: `تمت الموافقة على "${content.title}" وأصبح مرئياً للجميع`,
        userId: content.authorId,
        metadata: {
          actorRole: moderatorRole,
          actionType: 'APPROVE',
          targetType: 'CONTENT',
          targetId: contentId,
          reason: 'Content approved',
          createdAt: new Date(),
        },
      },
    });

    // Log action to audit log
    await writeAuditLog({
      action: 'CONTENT_CREATED',
      actorId: moderatorId,
      actorRole: moderatorRole,
      targetType: 'CONTENT',
      targetId: contentId,
      metadata: { title: content.title },
    });

    return { approved: true, content: updated };
  },

  /**
   * Reject content with reason
   */
  async rejectContent(contentId: string, moderatorId: string, moderatorRole: Role = 'MODERATOR', reason: string) {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: { id: true, title: true, authorId: true },
    });

    if (!content) {
      throw new Error('المحتوى غير موجود');
    }

    const updated = await prisma.content.update({
      where: { id: contentId },
      data: {
        status: ContentStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    // Create ModerationAction
    await prisma.moderationAction.create({
      data: {
        type: 'DELETE',
        reason,
        targetContentId: contentId,
        moderatorId,
      },
    });

    // Notify author with metadata
    await prisma.notification.create({
      data: {
        type: 'MODERATION',
        title: 'تم رفض محتواك',
        message: `تم رفض "${content.title}": ${reason}`,
        userId: content.authorId,
        metadata: {
          actorRole: moderatorRole,
          actionType: 'REJECT',
          targetType: 'CONTENT',
          targetId: contentId,
          reason,
          createdAt: new Date(),
        },
      },
    });

    // Log action to audit log
    await writeAuditLog({
      action: 'CONTENT_DELETED',
      actorId: moderatorId,
      actorRole: moderatorRole,
      targetType: 'CONTENT',
      targetId: contentId,
      metadata: { title: content.title, reason },
    });

    return updated;
  },

  /**
   * Take down published content (hide)
   */
  async takedownContent(contentId: string, moderatorId: string, moderatorRole: Role = 'MODERATOR', reason: string) {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: { id: true, title: true, status: true, authorId: true },
    });

    if (!content) {
      throw new Error('المحتوى غير موجود');
    }

    if (content.status !== ContentStatus.PUBLISHED) {
      throw new Error('لا يمكن إزالة محتوى غير منشور');
    }

    const updated = await prisma.content.update({
      where: { id: contentId },
      data: {
        status: ContentStatus.HIDDEN,
        rejectionReason: `تمت إزالة المحتوى: ${reason}`,
      },
    });

    // Resolve all pending reports for this content
    await prisma.report.updateMany({
      where: { contentId, status: 'PENDING' },
      data: {
        status: 'RESOLVED',
        resolution: 'تمت إزالة المحتوى',
        reviewerId: moderatorId,
        resolvedAt: new Date(),
      },
    });

    // Create ModerationAction
    await prisma.moderationAction.create({
      data: {
        type: 'HIDE',
        reason,
        targetContentId: contentId,
        moderatorId,
      },
    });

    // Notify author with metadata
    await prisma.notification.create({
      data: {
        type: 'MODERATION',
        title: 'تمت إزالة محتواك',
        message: `تمت إزالة "${content.title}" بسبب: ${reason}`,
        userId: content.authorId,
        metadata: {
          actorRole: moderatorRole,
          actionType: 'HIDE',
          targetType: 'CONTENT',
          targetId: contentId,
          reason,
          createdAt: new Date(),
        },
      },
    });

    // Log action to audit log
    await writeAuditLog({
      action: 'CONTENT_HIDDEN',
      actorId: moderatorId,
      actorRole: moderatorRole,
      targetType: 'CONTENT',
      targetId: contentId,
      metadata: { title: content.title, reason },
    });

    return updated;
  },

  /**
   * Warn a user
   */
  async warnUser(userId: string, moderatorId: string, moderatorRole: Role = 'MODERATOR', reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, warningsCount: true },
    });

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    // Increment warnings
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { warningsCount: { increment: 1 } },
    });

    // Auto-ban after 3 warnings
    if (updated.warningsCount >= 3 && updated.status === UserStatus.ACTIVE) {
      await this.banUser(userId, moderatorId, moderatorRole, 'تجاوز عدد التحذيرات المسموح', 7);
    }

    // Create ModerationAction
    await prisma.moderationAction.create({
      data: {
        type: 'WARN',
        reason,
        targetUserId: userId,
        moderatorId,
      },
    });

    // Notify user with metadata
    await prisma.notification.create({
      data: {
        type: 'MODERATION',
        title: 'تحذير',
        message: `لقد تلقيت تحذيراً: ${reason}`,
        userId,
        metadata: {
          actorRole: moderatorRole,
          actionType: 'WARN',
          targetType: 'USER',
          targetId: userId,
          reason,
          createdAt: new Date(),
        },
      },
    });

    // Log action to audit log
    await writeAuditLog({
      action: 'CONTENT_WARNED',
      actorId: moderatorId,
      actorRole: moderatorRole,
      targetType: 'USER',
      targetId: userId,
      metadata: { reason, warningsCount: updated.warningsCount },
    });

    return updated;
  },

  /**
   * Ban a user
   */
  async banUser(userId: string, moderatorId: string, moderatorRole: Role = 'MODERATOR', reason: string, durationDays?: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    if (user.role === 'ADMIN') {
      throw new Error('لا يمكن حظر مدير');
    }

    const banExpiry = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.BANNED,
        bannedAt: new Date(),
        banReason: reason,
        banExpiry,
      },
    });

    // Create ModerationAction
    await prisma.moderationAction.create({
      data: {
        type: durationDays ? 'TEMP_BAN' : 'PERM_BAN',
        reason,
        targetUserId: userId,
        moderatorId,
        duration: durationDays ? durationDays * 24 : undefined,
        expiresAt: banExpiry || undefined,
      },
    });

    // Notify user with metadata
    await prisma.notification.create({
      data: {
        type: 'MODERATION',
        title: 'تم حظر حسابك',
        message: durationDays
          ? `تم حظر حسابك لمدة ${durationDays} أيام: ${reason}`
          : `تم حظر حسابك نهائياً: ${reason}`,
        userId,
        metadata: {
          actorRole: moderatorRole,
          actionType: durationDays ? 'TEMP_BAN' : 'PERM_BAN',
          targetType: 'USER',
          targetId: userId,
          reason,
          createdAt: new Date(),
        },
      },
    });

    // Log action to audit log
    const auditAction = durationDays ? ('USER_BANNED' as const) : ('USER_BANNED' as const);
    await writeAuditLog({
      action: auditAction,
      actorId: moderatorId,
      actorRole: moderatorRole,
      targetType: 'USER',
      targetId: userId,
      metadata: { reason, durationDays, banExpiry },
    });

    return updated;
  },

  /**
   * Unban a user
   */
  async unbanUser(userId: string, moderatorId: string, moderatorRole: Role = 'MODERATOR', reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    if (user.status !== UserStatus.BANNED) {
      throw new Error('المستخدم غير محظور');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
        bannedAt: null,
        banReason: null,
        banExpiry: null,
      },
    });

    // Create ModerationAction
    await prisma.moderationAction.create({
      data: {
        type: 'UNBAN',
        reason,
        targetUserId: userId,
        moderatorId,
      },
    });

    // Notify user with metadata
    await prisma.notification.create({
      data: {
        type: 'MODERATION',
        title: 'تم إلغاء حظر حسابك',
        message: `تم إلغاء حظر حسابك: ${reason}`,
        userId,
        metadata: {
          actorRole: moderatorRole,
          actionType: 'UNBAN',
          targetType: 'USER',
          targetId: userId,
          reason,
          createdAt: new Date(),
        },
      },
    });

    // Log action to audit log
    await writeAuditLog({
      action: 'USER_UNBANNED',
      actorId: moderatorId,
      actorRole: moderatorRole,
      targetType: 'USER',
      targetId: userId,
      metadata: { reason },
    });

    return updated;
  },

  /**
   * Get moderation dashboard stats
   */
  async getStats(): Promise<ModerationStats> {
    const [pendingContent, pendingReports, bannedUsers, flaggedContent] = await Promise.all([
      prisma.content.count({ where: { status: ContentStatus.PENDING } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: UserStatus.BANNED } }),
      prisma.content.count({
        where: {
          status: ContentStatus.PUBLISHED,
          reports: { some: { status: 'PENDING' } },
        },
      }),
    ]);

    return {
      pendingContent,
      pendingReports,
      bannedUsers,
      flaggedContent,
    };
  },

  /**
   * Get moderation log
   */
  async getLog(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.moderationLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          moderator: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.moderationLog.count(),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  /**
   * Bulk moderate content
   */
  async bulkApprove(contentIds: string[], moderatorId: string, moderatorRole: Role = 'MODERATOR') {
    const results = await Promise.allSettled(
      contentIds.map((id) => this.approveContent(id, moderatorId, moderatorRole, true))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { succeeded, failed, total: contentIds.length };
  },

  /**
   * Bulk reject content
   */
  async bulkReject(contentIds: string[], moderatorId: string, moderatorRole: Role = 'MODERATOR', reason: string) {
    const results = await Promise.allSettled(
      contentIds.map((id) => this.rejectContent(id, moderatorId, moderatorRole, reason))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { succeeded, failed, total: contentIds.length };
  },
};
