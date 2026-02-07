/**
 * User Moderation Actions API
 * POST /api/moderation/users/[id] - Perform moderation action on user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { moderationService } from '@/core/services';
import { z } from 'zod';

const userModerationSchema = z.object({
  action: z.enum(['warn', 'ban', 'unban']),
  reason: z.string().min(1).max(1000),
  durationDays: z.number().int().positive().max(365).optional(),
});

type RouteParams = Promise<{ id: string }>;

// POST - Perform moderation action on user
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

    // Check if user is admin
    const userRole = (session.user as { role?: string }).role as 'USER' | 'MODERATOR' | 'ADMIN' | undefined;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'إدارة المستخدمين متاحة للمدراء فقط' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    // Can't moderate yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'لا يمكنك تنفيذ إجراءات على حسابك' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = userModerationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { action, reason, durationDays } = validation.data;

    let result;
    switch (action) {
      case 'warn':
        result = await moderationService.warnUser(id, session.user.id, userRole, reason);
        break;
      
      case 'ban':
        result = await moderationService.banUser(id, session.user.id, userRole, reason, durationDays);
        break;
      
      case 'unban':
        result = await moderationService.unbanUser(id, session.user.id, userRole, reason);
        break;

      default:
        return NextResponse.json(
          { error: 'إجراء غير صالح' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: action === 'warn' 
        ? 'تم إرسال التحذير'
        : action === 'ban'
        ? 'تم حظر المستخدم'
        : 'تم إلغاء حظر المستخدم',
      user: {
        id: result.id,
        name: result.name,
        status: result.status,
        warningsCount: result.warningsCount,
      },
    });
  } catch (error) {
    console.error('[USER_MODERATION]', error);
    
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
