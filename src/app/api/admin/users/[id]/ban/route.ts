/**
 * POST /api/admin/users/[id]/ban
 * Ban/unban user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/core/auth/guards';
import { prisma } from '@/core/db/prisma';
import { writeAuditLog } from '@/core/logging/audit';

type Params = Promise<{ id: string }>;

export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const session = await getSession();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { banned } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        bannedAt: banned ? new Date() : null,
        banReason: banned ? 'Admin ban' : null,
      },
      select: { id: true, email: true, bannedAt: true },
    });

    // Log action
    await writeAuditLog({
      action: banned ? 'USER_BANNED' : 'USER_UNBANNED',
      actorId: session.user.id,
      actorRole: session.user.role as 'USER' | 'MODERATOR' | 'ADMIN',
      targetType: 'USER',
      targetId: id,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('POST /api/admin/users/[id]/ban error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
