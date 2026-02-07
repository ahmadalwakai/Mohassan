/**
 * GET  /api/admin/users/[id]  — full user detail
 * PATCH /api/admin/users/[id] — update user role/status/warnings
 *
 * Body (all optional):
 *   { role?, status?, banUntil?, banReason?, addWarning?, clearWarnings? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';
import { sendRoleChangeEmail } from '@/services/email';
import type { Role, UserStatus } from '@prisma/client';

type Params = Promise<{ id: string }>;

/* ------------------------------------------------------------------ */
/*  GET — full user detail                                             */
/* ------------------------------------------------------------------ */
export async function GET(_request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    await guardAdmin();

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, image: true,
        bio: true, phone: true, location: true,
        role: true, status: true,
        emailVerified: true,
        bannedAt: true, banReason: true, banExpiry: true,
        warningsCount: true,
        createdAt: true, updatedAt: true,
        _count: {
          select: { contents: true, reportsFiled: true, notifications: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH — update user                                                */
/* ------------------------------------------------------------------ */

export async function PATCH(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const admin = await guardAdmin();

    const body = await request.json();
    const { role, status, banUntil, banReason, addWarning, clearWarnings } = body as {
      role?: string;
      status?: string;
      banUntil?: string;
      banReason?: string;
      addWarning?: boolean;
      clearWarnings?: boolean;
    };

    // ── Fetch target user ──────────────────────────────────────────
    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true,
        role: true, status: true,
        bannedAt: true, banExpiry: true,
      },
    });
    if (!target) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // ── Safety checks ──────────────────────────────────────────────
    if (role && target.id === admin.id && role !== admin.role) {
      return NextResponse.json({ error: 'لا يمكنك تغيير دورك بنفسك' }, { status: 400 });
    }

    if (role && role !== 'ADMIN' && target.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'لا يمكن تخفيض آخر مسؤول' }, { status: 400 });
      }
    }

    // ── Build update payload ───────────────────────────────────────
    const updateData: Record<string, unknown> = {};
    const validRoles: string[] = ['USER', 'MODERATOR', 'ADMIN'];
    const validStatuses: string[] = ['ACTIVE', 'SUSPENDED', 'BANNED'];

    // ── Warning mutations ──────────────────────────────────────────
    if (addWarning) {
      updateData.warningsCount = { increment: 1 };
    }
    if (clearWarnings) {
      updateData.warningsCount = 0;
    }

    if (role && validRoles.includes(role)) {
      updateData.role = role as Role;
    }

    if (status && validStatuses.includes(status)) {
      updateData.status = status as UserStatus;

      if (status === 'BANNED') {
        updateData.bannedAt = new Date();
        updateData.banExpiry = banUntil ? new Date(banUntil) : null;
        updateData.banReason = banReason || 'تم الحظر بواسطة المسؤول';
      } else if (status === 'ACTIVE') {
        // Clear all ban fields on reactivation
        updateData.bannedAt = null;
        updateData.banExpiry = null;
        updateData.banReason = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'لا توجد بيانات صالحة للتحديث' }, { status: 400 });
    }

    // ── Persist ────────────────────────────────────────────────────
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, email: true, name: true,
        role: true, status: true, emailVerified: true,
        bannedAt: true, banExpiry: true, warningsCount: true,
        createdAt: true,
      },
    });

    // ── Audit log ──────────────────────────────────────────────────
    const auditAction = role
      ? 'USER_ROLE_CHANGED'
      : status === 'BANNED'
        ? 'USER_BANNED'
        : addWarning
          ? 'USER_WARNING_ADDED'
          : clearWarnings
            ? 'USER_WARNINGS_CLEARED'
            : 'USER_UPDATED';

    await writeAuditLog({
      action: auditAction,
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'USER',
      targetId: id,
      metadata: {
        before: {
          role: target.role,
          status: target.status,
          bannedAt: target.bannedAt,
          banExpiry: target.banExpiry,
        },
        after: {
          role: updated.role,
          status: updated.status,
          bannedAt: updated.bannedAt,
          banExpiry: updated.banExpiry,
        },
      },
    });

    // ── Email notification on role change ───────────────────────────
    if (role && target.role !== role) {
      try {
        await sendRoleChangeEmail(
          updated.email,
          updated.name || 'عزيزي المستخدم',
          role as 'USER' | 'MODERATOR' | 'ADMIN'
        );
      } catch (e) {
        console.error('[PATCH user] email notification failed:', e);
        // non-blocking — don't fail the request
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
