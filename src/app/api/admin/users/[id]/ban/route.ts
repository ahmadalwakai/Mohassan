/**
 * POST /api/admin/users/[id]/ban
 * Ban or unban a user.
 *
 * Body: { banned: boolean, reason?: string, banUntil?: string (ISO) }
 *
 * FIXES: now updates BOTH `status` and `bannedAt` so auth guards
 *        actually block banned users at login.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';

type Params = Promise<{ id: string }>;

export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const admin = await guardAdmin();

    const { banned, reason, banUntil } = (await request.json()) as {
      banned: boolean;
      reason?: string;
      banUntil?: string;
    };

    // Prevent banning yourself
    if (banned && id === admin.id) {
      return NextResponse.json({ error: 'لا يمكنك حظر نفسك' }, { status: 400 });
    }

    // Prevent banning other admins
    if (banned) {
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
      if (target?.role === 'ADMIN') {
        return NextResponse.json({ error: 'لا يمكن حظر مسؤول آخر' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: banned
        ? {
            status: 'BANNED',
            bannedAt: new Date(),
            banReason: reason || 'تم الحظر بواسطة المسؤول',
            banExpiry: banUntil ? new Date(banUntil) : null,
          }
        : {
            status: 'ACTIVE',
            bannedAt: null,
            banReason: null,
            banExpiry: null,
          },
      select: { id: true, email: true, status: true, bannedAt: true, banExpiry: true },
    });

    await writeAuditLog({
      action: banned ? 'USER_BANNED' : 'USER_UNBANNED',
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'USER',
      targetId: id,
      metadata: { banned, reason, banUntil },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}
