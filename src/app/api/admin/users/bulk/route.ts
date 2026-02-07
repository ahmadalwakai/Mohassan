/**
 * POST /api/admin/users/bulk
 * Bulk user actions.
 *
 * Body:
 *   { userIds: string[], action: string, payload?: Record<string, unknown> }
 *
 * Supported actions:
 *   setRole     — payload.role
 *   setStatus   — payload.status
 *   banTemp     — payload.banUntil (ISO), payload.reason?
 *   banPerm     — payload.reason?
 *   unban
 *   addWarning
 *   clearWarnings
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';

const VALID_ROLES = ['USER', 'MODERATOR', 'ADMIN'];
const VALID_STATUSES = ['ACTIVE', 'SUSPENDED', 'BANNED'];

export async function POST(request: NextRequest) {
  try {
    const admin = await guardAdmin();
    const body = await request.json();
    const { userIds, action, payload } = body as {
      userIds: string[];
      action: string;
      payload?: Record<string, unknown>;
    };

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'يجب تحديد مستخدم واحد على الأقل' }, { status: 400 });
    }
    if (userIds.length > 100) {
      return NextResponse.json({ error: 'الحد الأقصى 100 مستخدم' }, { status: 400 });
    }

    // Prevent self-targeting
    if (userIds.includes(admin.id)) {
      return NextResponse.json({ error: 'لا يمكنك تنفيذ هذا الإجراء على نفسك' }, { status: 400 });
    }

    // Enforce reason for destructive actions (ban/suspend/role changes)
    const requiresReason = ['banTemp', 'banPerm', 'setRole', 'setStatus'].includes(action);
    const reason = (payload?.reason as string) || '';
    if (requiresReason && !reason.trim()) {
      return NextResponse.json({ error: 'السبب مطلوب لهذا الإجراء' }, { status: 400 });
    }

    // Prevent bulk-modifying ADMIN users (safety guard)
    const adminTargets = await prisma.user.count({
      where: { id: { in: userIds }, role: 'ADMIN' },
    });
    if (adminTargets > 0) {
      return NextResponse.json({ error: 'لا يمكن تعديل حسابات المسؤولين جماعياً' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};
    let auditAction = 'USER_BULK_ACTION';

    switch (action) {
      case 'setRole': {
        const role = payload?.role as string;
        if (!role || !VALID_ROLES.includes(role)) {
          return NextResponse.json({ error: 'الدور غير صالح' }, { status: 400 });
        }
        updateData = { role };
        auditAction = 'USER_ROLE_CHANGED';
        break;
      }
      case 'setStatus': {
        const status = payload?.status as string;
        if (!status || !VALID_STATUSES.includes(status)) {
          return NextResponse.json({ error: 'الحالة غير صالحة' }, { status: 400 });
        }
        updateData = { status };
        break;
      }
      case 'banTemp': {
        const banUntil = payload?.banUntil as string;
        if (!banUntil) {
          return NextResponse.json({ error: 'تاريخ انتهاء الحظر مطلوب' }, { status: 400 });
        }
        updateData = {
          status: 'BANNED',
          bannedAt: new Date(),
          banExpiry: new Date(banUntil),
          banReason: (payload?.reason as string) || 'حظر مؤقت جماعي',
        };
        auditAction = 'USER_BANNED';
        break;
      }
      case 'banPerm': {
        updateData = {
          status: 'BANNED',
          bannedAt: new Date(),
          banExpiry: null,
          banReason: (payload?.reason as string) || 'حظر دائم جماعي',
        };
        auditAction = 'USER_BANNED';
        break;
      }
      case 'unban': {
        updateData = {
          status: 'ACTIVE',
          bannedAt: null,
          banExpiry: null,
          banReason: null,
        };
        auditAction = 'USER_UNBANNED';
        break;
      }
      case 'addWarning': {
        updateData = { warningsCount: { increment: 1 } };
        auditAction = 'USER_WARNING_ADDED';
        break;
      }
      case 'clearWarnings': {
        updateData = { warningsCount: 0 };
        auditAction = 'USER_WARNINGS_CLEARED';
        break;
      }
      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }

    // Fetch before-state for audit
    const beforeUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, role: true, status: true, warningsCount: true },
    });

    // Execute bulk update
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: updateData,
    });

    // Audit log for each user with before/after
    await Promise.all(
      userIds.map((uid) => {
        const before = beforeUsers.find((u) => u.id === uid);
        return writeAuditLog({
          action: auditAction as any,
          actorId: admin.id,
          actorRole: admin.role,
          targetType: 'USER',
          targetId: uid,
          metadata: {
            bulkAction: action,
            payload,
            reason: reason || undefined,
            batchSize: userIds.length,
            before: before ? { role: before.role, status: before.status, warningsCount: before.warningsCount } : undefined,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      affected: result.count,
      action,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
