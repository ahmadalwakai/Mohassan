/**
 * GET   /api/admin/content/[id] — full content detail
 * PATCH /api/admin/content/[id] — update content fields / status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';

type Params = Promise<{ id: string }>;

export async function GET(_request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    await guardAdmin();

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        reports: {
          select: { id: true, reason: true, status: true, createdAt: true },
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        tags: { include: { tag: true } },
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'المحتوى غير موجود' }, { status: 404 });
    }

    // Content already includes hiddenReason, matchedKeywords, moderationTrigger, moderationMeta
    return NextResponse.json(content);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const admin = await guardAdmin();

    const body = await request.json();
    const { title, body: bodyText, excerpt, status, rejectionReason, metaTitle, metaDescription } = body as {
      title?: string;
      body?: string;
      excerpt?: string;
      status?: string;
      rejectionReason?: string;
      metaTitle?: string;
      metaDescription?: string;
    };

    const existing = await prisma.content.findUnique({
      where: { id },
      select: { id: true, title: true, status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'المحتوى غير موجود' }, { status: 404 });
    }

    const validStatuses = ['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN', 'DELETED'];
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (bodyText !== undefined) updateData.body = bodyText;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

    if (status && validStatuses.includes(status)) {
      updateData.status = status;
      if (status === 'PUBLISHED' && !existing.status) {
        updateData.publishedAt = new Date();
      }
      if (status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
        updateData.moderatedAt = new Date();
        updateData.moderatedBy = admin.id;
      }
      if (status === 'REJECTED') {
        updateData.rejectionReason = rejectionReason || 'تم الرفض بواسطة المسؤول';
        updateData.moderatedAt = new Date();
        updateData.moderatedBy = admin.id;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 });
    }

    const updated = await prisma.content.update({
      where: { id },
      data: updateData,
      select: {
        id: true, type: true, title: true, status: true,
        createdAt: true, publishedAt: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });

    // Determine specific audit action
    let auditAction: string = 'CONTENT_UPDATED';
    if (status === 'PUBLISHED') auditAction = 'CONTENT_APPROVED';
    else if (status === 'REJECTED') auditAction = 'CONTENT_REJECTED';
    else if (status === 'HIDDEN') auditAction = 'CONTENT_HIDDEN';

    await writeAuditLog({
      action: auditAction as any,
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'CONTENT',
      targetId: id,
      metadata: {
        before: { title: existing.title, status: existing.status },
        after: { title: updated.title, status: updated.status },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
