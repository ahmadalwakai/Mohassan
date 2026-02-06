/**
 * Reports API Routes
 * POST /api/reports - Create a report
 * GET /api/reports - List reports (moderators only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { reportService } from '@/core/services';
import { ReportReason, ReportStatus } from '@prisma/client';
import { z } from 'zod';

const createReportSchema = z.object({
  contentId: z.string().uuid(),
  reason: z.nativeEnum(ReportReason),
  description: z.string().max(1000).optional(),
});

// POST - Create a report
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول للإبلاغ' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const report = await reportService.create({
      ...validation.data,
      reporterId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال البلاغ بنجاح',
      report: {
        id: report.id,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[REPORTS_POST]', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'فشل في إرسال البلاغ' },
      { status: 500 }
    );
  }
}

// GET - List reports (moderators only)
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status') as ReportStatus | null;
    const reason = searchParams.get('reason') as ReportReason | null;

    const result = await reportService.list(
      {
        ...(status && { status }),
        ...(reason && { reason }),
      },
      page,
      limit
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[REPORTS_GET]', error);
    return NextResponse.json(
      { error: 'فشل في جلب البلاغات' },
      { status: 500 }
    );
  }
}
