/**
 * Content Moderation Actions API
 * POST /api/moderation/content/[id] - Perform moderation action on content
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { moderationService } from '@/core/services';
import { z } from 'zod';

const moderationActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'takedown']),
  reason: z.string().max(1000).optional(),
  skipAI: z.boolean().optional(),
});

type RouteParams = Promise<{ id: string }>;

// POST - Perform moderation action on content
export async function POST(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // Check if user is moderator or admin
    const userRole = (session.user as { role?: string }).role as 'USER' | 'MODERATOR' | 'ADMIN' | undefined;
    if (!userRole || !['ADMIN', 'MODERATOR'].includes(userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = moderationActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { action, reason, skipAI } = validation.data;
    let result;

    switch (action) {
      case 'approve':
        result = await moderationService.approveContent(
          id, 
          session.user.id,
          userRole,
          skipAI ?? false
        );
        break;
      
      case 'reject':
        if (!reason) {
          return NextResponse.json(
            { error: 'يجب تقديم سبب الرفض' },
            { status: 400 }
          );
        }
        result = await moderationService.rejectContent(id, session.user.id, userRole, reason);
        break;
      
      case 'takedown':
        if (!reason) {
          return NextResponse.json(
            { error: 'يجب تقديم سبب الإزالة' },
            { status: 400 }
          );
        }
        result = await moderationService.takedownContent(id, session.user.id, userRole, reason);
        break;
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' 
        ? 'تمت الموافقة على المحتوى'
        : action === 'reject'
        ? 'تم رفض المحتوى'
        : 'تمت إزالة المحتوى',
      result,
    });
  } catch (error) {
    console.error('[CONTENT_MODERATION]', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'فشل في تنفيذ الإجراء' },
      { status: 500 }
    );
  }
}
