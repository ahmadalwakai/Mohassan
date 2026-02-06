/**
 * Bulk Content Moderation API
 * POST /api/moderation/content/bulk - Bulk moderate multiple content items
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
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
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // Check if user is admin only for bulk actions
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'العمليات الجماعية متاحة للمدراء فقط' },
        { status: 403 }
      );
    }

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
      result = await moderationService.bulkApprove(contentIds, session.user.id);
    } else {
      if (!reason) {
        return NextResponse.json(
          { error: 'يجب تقديم سبب الرفض للعمليات الجماعية' },
          { status: 400 }
        );
      }
      result = await moderationService.bulkReject(contentIds, session.user.id, reason);
    }

    return NextResponse.json({
      success: true,
      message: `تم ${action === 'approve' ? 'الموافقة على' : 'رفض'} ${result.succeeded} من ${result.total} محتوى`,
      result,
    });
  } catch (error) {
    console.error('[BULK_MODERATION]', error);
    return NextResponse.json(
      { error: 'فشل في تنفيذ العمليات الجماعية' },
      { status: 500 }
    );
  }
}
