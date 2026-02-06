/**
 * Single Report API Routes
 * GET /api/reports/[id] - Get report details
 * PATCH /api/reports/[id] - Update report status (resolve/dismiss)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { reportService } from '@/core/services';
import { z } from 'zod';

const updateReportSchema = z.object({
  action: z.enum(['review', 'resolve', 'dismiss']),
  resolution: z.string().max(1000).optional(),
});

type RouteParams = Promise<{ id: string }>;

// GET - Get report details
export async function GET(
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
    const userRole = (session.user as { role?: string }).role;
    if (!userRole || !['ADMIN', 'MODERATOR'].includes(userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const report = await reportService.getOne(id);

    if (!report) {
      return NextResponse.json(
        { error: 'البلاغ غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('[REPORT_GET]', error);
    return NextResponse.json(
      { error: 'فشل في جلب البلاغ' },
      { status: 500 }
    );
  }
}

// PATCH - Update report status
export async function PATCH(
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
    const userRole = (session.user as { role?: string }).role;
    if (!userRole || !['ADMIN', 'MODERATOR'].includes(userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { action, resolution } = validation.data;
    let report;

    switch (action) {
      case 'review':
        report = await reportService.startReview(id, session.user.id);
        break;
      case 'resolve':
        if (!resolution) {
          return NextResponse.json(
            { error: 'يجب تقديم سبب الحل' },
            { status: 400 }
          );
        }
        report = await reportService.resolve(id, session.user.id, resolution);
        break;
      case 'dismiss':
        report = await reportService.dismiss(id, session.user.id, resolution || 'تم الرفض');
        break;
    }

    return NextResponse.json({
      success: true,
      message: action === 'review' 
        ? 'تم بدء المراجعة'
        : action === 'resolve'
        ? 'تم حل البلاغ'
        : 'تم رفض البلاغ',
      report,
    });
  } catch (error) {
    console.error('[REPORT_PATCH]', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'فشل في تحديث البلاغ' },
      { status: 500 }
    );
  }
}
