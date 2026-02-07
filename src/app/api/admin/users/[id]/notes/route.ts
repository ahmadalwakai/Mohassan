/**
 * GET  /api/admin/users/[id]/notes — list admin notes for a user
 * POST /api/admin/users/[id]/notes — add a new admin note
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';

type Params = Promise<{ id: string }>;

export async function GET(_request: NextRequest, props: { params: Params }) {
  try {
    const { id: userId } = await props.params;
    await guardAdmin();

    const notes = await prisma.adminNote.findMany({
      where: { userId },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ notes });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const { id: userId } = await props.params;
    const admin = await guardAdmin();

    const { note } = (await request.json()) as { note?: string };
    if (!note?.trim()) {
      return NextResponse.json({ error: 'الملاحظة مطلوبة' }, { status: 400 });
    }

    // Verify user exists
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const created = await prisma.adminNote.create({
      data: {
        note: note.trim(),
        userId,
        actorId: admin.id,
      },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });

    await writeAuditLog({
      action: 'USER_NOTE_ADDED',
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'USER',
      targetId: userId,
      metadata: { noteId: created.id },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
