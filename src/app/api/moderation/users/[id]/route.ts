/**
 * User Moderation Actions API
 * POST /api/moderation/users/[id] - Perform moderation action on user
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
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
    const admin = await guardAdmin();

    const { id } = await params;
    
    // Can't moderate yourself
    if (id === admin.id) {
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
        result = await moderationService.warnUser(id, admin.id, admin.role, reason);
        break;
      
      case 'ban':
        result = await moderationService.banUser(id, admin.id, admin.role, reason, durationDays);
        break;
      
      case 'unban':
        result = await moderationService.unbanUser(id, admin.id, admin.role, reason);
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
    return handleApiError(error);
  }
}
