/**
 * POST /api/admin/content/[id]/override
 * Admin content override — publish anyway, clear flags, or unhide content.
 *
 * Body: { action: 'PUBLISH_ANYWAY' | 'CLEAR_FLAGS' | 'UNHIDE', reason: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';
import { safetyService } from '@/core/services/safety.service';

type Params = Promise<{ id: string }>;

export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const admin = await guardAdmin();

    const body = await request.json();
    const { action, reason } = body as {
      action?: string;
      reason?: string;
    };

    const validActions = ['PUBLISH_ANYWAY', 'CLEAR_FLAGS', 'UNHIDE'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: 'إجراء غير صالح. الإجراءات المتاحة: PUBLISH_ANYWAY, CLEAR_FLAGS, UNHIDE' },
        { status: 400 }
      );
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        { error: 'السبب مطلوب لإجراء التجاوز' },
        { status: 400 }
      );
    }

    const content = await prisma.content.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        hiddenReason: true,
        matchedKeywords: true,
        moderationTrigger: true,
        moderationMeta: true,
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'المحتوى غير موجود' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const overrideMeta = {
      ...(content.moderationMeta as Record<string, unknown> || {}),
      overrideAction: action,
      overrideReason: reason,
      overrideActorId: admin.id,
      overrideAt: new Date().toISOString(),
    };

    switch (action) {
      case 'PUBLISH_ANYWAY':
        updateData.status = 'PUBLISHED';
        updateData.publishedAt = new Date();
        updateData.moderatedAt = new Date();
        updateData.moderatedBy = admin.id;
        updateData.moderationMeta = overrideMeta;
        break;

      case 'CLEAR_FLAGS':
        updateData.matchedKeywords = null;
        updateData.moderationTrigger = null;
        updateData.hiddenReason = null;
        updateData.moderationMeta = overrideMeta;
        break;

      case 'UNHIDE':
        if (content.status !== 'HIDDEN') {
          return NextResponse.json({ error: 'المحتوى ليس مخفياً' }, { status: 400 });
        }
        updateData.status = 'PUBLISHED';
        updateData.hiddenReason = null;
        updateData.publishedAt = new Date();
        updateData.moderatedAt = new Date();
        updateData.moderatedBy = admin.id;
        updateData.moderationMeta = overrideMeta;
        break;
    }

    const updated = await prisma.content.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        status: true,
        hiddenReason: true,
        matchedKeywords: true,
        moderationTrigger: true,
        moderationMeta: true,
      },
    });

    await writeAuditLog({
      action: 'CONTENT_OVERRIDE',
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'CONTENT',
      targetId: id,
      metadata: {
        overrideAction: action,
        reason,
        before: {
          status: content.status,
          hiddenReason: content.hiddenReason,
          moderationTrigger: content.moderationTrigger,
        },
        after: {
          status: updated.status,
          hiddenReason: updated.hiddenReason,
          moderationTrigger: updated.moderationTrigger,
        },
      },
    });

    // Invalidate safety cache in case we cleared flags
    safetyService.invalidateCache();

    return NextResponse.json({
      success: true,
      content: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
