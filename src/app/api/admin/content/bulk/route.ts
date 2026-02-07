/**
 * POST /api/admin/content/bulk
 * Bulk content actions.
 *
 * Body:
 *   { contentIds: string[], action: 'approve' | 'reject' | 'unpublish' | 'feature' | 'hide' | 'delete' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';

export async function POST(request: NextRequest) {
  try {
    const admin = await guardAdmin();
    const body = await request.json();
    const { contentIds, action } = body as {
      contentIds: string[];
      action: string;
    };

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return NextResponse.json({ error: 'يجب تحديد محتوى واحد على الأقل' }, { status: 400 });
    }
    if (contentIds.length > 100) {
      return NextResponse.json({ error: 'الحد الأقصى 100 محتوى' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};
    let auditAction = 'CONTENT_BULK_ACTION';

    switch (action) {
      case 'approve':
        updateData = {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          moderatedAt: new Date(),
          moderatedBy: admin.id,
        };
        auditAction = 'CONTENT_APPROVED';
        break;
      case 'reject':
        updateData = {
          status: 'REJECTED',
          rejectionReason: 'تم الرفض جماعياً بواسطة المسؤول',
          moderatedAt: new Date(),
          moderatedBy: admin.id,
        };
        auditAction = 'CONTENT_REJECTED';
        break;
      case 'unpublish':
        updateData = { status: 'DRAFT' };
        auditAction = 'CONTENT_UPDATED';
        break;
      case 'hide':
        updateData = { status: 'HIDDEN' };
        auditAction = 'CONTENT_HIDDEN';
        break;
      case 'delete':
        updateData = { status: 'DELETED' };
        auditAction = 'CONTENT_DELETED';
        break;
      case 'feature':
        // Store featured flag in metadata  
        // We'll use a simple approach: update metadata JSON to include featured: true
        // Since Prisma doesn't support JSON merge in updateMany, we do individual updates
        const results = await Promise.all(
          contentIds.map(async (cid) => {
            const content = await prisma.content.findUnique({
              where: { id: cid },
              select: { metadata: true },
            });
            const meta = (content?.metadata as Record<string, unknown>) || {};
            return prisma.content.update({
              where: { id: cid },
              data: { metadata: { ...meta, featured: true } },
            });
          })
        );

        // Audit logs
        await Promise.all(
          contentIds.map((cid) =>
            writeAuditLog({
              action: 'CONTENT_FEATURED' as any,
              actorId: admin.id,
              actorRole: admin.role,
              targetType: 'CONTENT',
              targetId: cid,
              metadata: { bulkAction: 'feature', batchSize: contentIds.length },
            })
          )
        );

        return NextResponse.json({ success: true, affected: results.length, action });
      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }

    // Execute bulk update for non-feature actions
    const result = await prisma.content.updateMany({
      where: { id: { in: contentIds } },
      data: updateData,
    });

    // Audit logs
    await Promise.all(
      contentIds.map((cid) =>
        writeAuditLog({
          action: auditAction as any,
          actorId: admin.id,
          actorRole: admin.role,
          targetType: 'CONTENT',
          targetId: cid,
          metadata: { bulkAction: action, batchSize: contentIds.length },
        })
      )
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
