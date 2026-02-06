/**
 * Report Statistics API
 * GET /api/reports/stats - Get report statistics (moderators only)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { reportService } from '@/core/services';

export async function GET() {
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

    const stats = await reportService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[REPORTS_STATS]', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
