/**
 * POST /api/admin/users/bulk/preview
 * Bulk user action preview — returns counts + sample + exclusions.
 * No actual changes are made.
 *
 * Body: same as bulk action { userIds, action, payload }
 * Returns: { totalTargeted, eligible, excluded, exclusions[], sample[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';

const VALID_ROLES = ['USER', 'MODERATOR', 'ADMIN'];
const VALID_STATUSES = ['ACTIVE', 'SUSPENDED', 'BANNED'];
const REQUIRES_REASON = ['banTemp', 'banPerm', 'setRole', 'setStatus'];

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

    // Validate action
    const validActions = ['setRole', 'setStatus', 'banTemp', 'banPerm', 'unban', 'addWarning', 'clearWarnings'];
    let normalizedAction = action;
    if (action.startsWith('setRole:')) normalizedAction = 'setRole';
    if (action.startsWith('setStatus:')) normalizedAction = 'setStatus';

    if (!validActions.includes(normalizedAction)) {
      return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }

    // Validate reason for destructive actions
    const reason = (payload?.reason as string) || '';
    if (REQUIRES_REASON.includes(normalizedAction) && !reason.trim()) {
      return NextResponse.json({ error: 'السبب مطلوب لهذا الإجراء' }, { status: 400 });
    }

    // Validate role/status params
    if (normalizedAction === 'setRole') {
      const role = (payload?.role as string) || (action.includes(':') ? action.split(':')[1] : '');
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ error: 'الدور غير صالح' }, { status: 400 });
      }
    }
    if (normalizedAction === 'setStatus') {
      const status = (payload?.status as string) || (action.includes(':') ? action.split(':')[1] : '');
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'الحالة غير صالحة' }, { status: 400 });
      }
    }

    // Fetch targeted users
    const targetedUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true, status: true, warningsCount: true },
    });

    const exclusions: { userId: string; reason: string }[] = [];
    const eligible: typeof targetedUsers = [];

    for (const user of targetedUsers) {
      // Exclude self
      if (user.id === admin.id) {
        exclusions.push({ userId: user.id, reason: 'لا يمكنك تنفيذ الإجراء على نفسك' });
        continue;
      }

      // ADMIN users cannot be bulk modified
      if (user.role === 'ADMIN') {
        exclusions.push({ userId: user.id, reason: 'لا يمكن تعديل حسابات المسؤولين جماعياً' });
        continue;
      }

      eligible.push(user);
    }

    // IDs that weren't found
    const foundIds = new Set(targetedUsers.map((u) => u.id));
    for (const uid of userIds) {
      if (!foundIds.has(uid)) {
        exclusions.push({ userId: uid, reason: 'المستخدم غير موجود' });
      }
    }

    // Sample: first 5 eligible users
    const sample = eligible.slice(0, 5).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      warningsCount: u.warningsCount,
    }));

    // Preview audit log
    await writeAuditLog({
      action: 'USER_BULK_PREVIEW',
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'USER',
      targetId: 'PREVIEW',
      metadata: {
        action: normalizedAction,
        totalTargeted: userIds.length,
        eligible: eligible.length,
        excluded: exclusions.length,
      },
    });

    return NextResponse.json({
      totalTargeted: userIds.length,
      eligible: eligible.length,
      excluded: exclusions.length,
      exclusions,
      sample,
      action: normalizedAction,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
