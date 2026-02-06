/**
 * Moderation Dashboard API Routes
 * GET /api/moderation - Get moderation dashboard data
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { moderationService } from '@/core/services';

// GET - Get moderation dashboard stats and pending items
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // Check if user is moderator or admin
    const userRole = (session.user as { role?: string }).role;
    if (!userRole || !['ADMIN', 'MODERATOR'].includes(userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'stats';
    const page = parseInt(searchParams.get('page') || '1');

    switch (view) {
      case 'stats':
        const stats = await moderationService.getStats();
        return NextResponse.json(stats);
      
      case 'pending':
        const pending = await moderationService.getPendingContent(page);
        return NextResponse.json(pending);
      
      case 'flagged':
        const flagged = await moderationService.getFlaggedContent(page);
        return NextResponse.json(flagged);
      
      case 'log':
        const log = await moderationService.getLog(page);
        return NextResponse.json(log);
      
      default:
        return NextResponse.json(
          { error: 'عرض غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[MODERATION_GET]', error);
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الإدارة' },
      { status: 500 }
    );
  }
}
