/**
 * Bulk Content Moderation API
 * POST /api/moderation/content/bulk - Bulk moderate multiple content items
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { moderationService } from '@/core/services';
import { z } from 'zod';

const bulkModerationSchema = z.object({
  action: z.enum(['approve', 'reject']),
  contentIds: z.array(z.string().uuid()).min(1).max(50),
  reason: z.string().max(1000).optional(),
});

// POST - Bulk moderate content
export async function POST(request: NextRequest) {
  try {
    const admin = await guardAdmin();

    const body = await request.json();
    const validation = bulkModerationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { action, contentIds, reason } = validation.data;
    let result;

    if (action === 'approve') {
      result = await moderationService.bulkApprove(contentIds, admin.id, admin.role);
    } else {
      if (!reason) {
        return NextResponse.json(
          { error: 'يجب تقديم سبب الرفض للعمليات الجماعية' },
          { status: 400 }
        );
      }
      result = await moderationService.bulkReject(contentIds, admin.id, admin.role, reason);
    }

    return NextResponse.json({
      success: true,
      message: `تم ${action === 'approve' ? 'الموافقة على' : 'رفض'} ${result.succeeded} من ${result.total} محتوى`,
      result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
