/**
 * GET    /api/admin/safety/keywords — list banned keywords
 * POST   /api/admin/safety/keywords — add keyword
 * DELETE /api/admin/safety/keywords — remove keyword
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';
import { safetyService } from '@/core/services/safety.service';

export async function GET(request: NextRequest) {
  try {
    await guardAdmin();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const keywords = await prisma.bannedKeyword.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return NextResponse.json({ keywords });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await guardAdmin();
    const body = await request.json();
    const { keyword, reason, severity } = body as {
      keyword?: string;
      reason?: string;
      severity?: string;
    };

    if (!keyword?.trim()) {
      return NextResponse.json({ error: 'الكلمة مطلوبة' }, { status: 400 });
    }

    const trimmed = keyword.trim().toLowerCase();

    // Check for duplicate
    const existing = await prisma.bannedKeyword.findUnique({ where: { keyword: trimmed } });
    if (existing) {
      // Reactivate if it was deactivated
      if (!existing.isActive) {
        const reactivated = await prisma.bannedKeyword.update({
          where: { id: existing.id },
          data: { isActive: true, reason, severity: severity || 'medium' },
        });
        return NextResponse.json(reactivated);
      }
      return NextResponse.json({ error: 'الكلمة موجودة بالفعل' }, { status: 409 });
    }

    const created = await prisma.bannedKeyword.create({
      data: {
        keyword: trimmed,
        reason: reason || null,
        severity: severity || 'medium',
        createdBy: admin.id,
      },
    });

    await writeAuditLog({
      action: 'BANNED_KEYWORD_ADDED',
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'SAFETY',
      targetId: created.id,
      metadata: { keyword: trimmed, severity },
    });

    safetyService.invalidateCache();

    // Create version snapshot
    await safetyService.createVersionSnapshot(admin.id, `Added keyword: ${trimmed}`);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await guardAdmin();
    const body = await request.json();
    const { id } = body as { id?: string };

    if (!id) {
      return NextResponse.json({ error: 'معرف الكلمة مطلوب' }, { status: 400 });
    }

    const keyword = await prisma.bannedKeyword.findUnique({ where: { id } });
    if (!keyword) {
      return NextResponse.json({ error: 'الكلمة غير موجودة' }, { status: 404 });
    }

    // Soft-delete: deactivate instead of hard delete
    await prisma.bannedKeyword.update({
      where: { id },
      data: { isActive: false },
    });

    await writeAuditLog({
      action: 'BANNED_KEYWORD_REMOVED',
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'SAFETY',
      targetId: id,
      metadata: { keyword: keyword.keyword },
    });

    safetyService.invalidateCache();

    // Create version snapshot
    await safetyService.createVersionSnapshot(admin.id, `Removed keyword: ${keyword.keyword}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
