/**
 * GET /api/moderator/reports
 * Get reports from users
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardModerator, handleApiError } from '@/core/auth/api-guard';
import { prisma } from '@/core/db/prisma';
import { parseReportStatusOrDefault, type ReportStatus } from '@/lib/validators/enums';

export async function GET(request: NextRequest) {
  try {
    await guardModerator();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = parseReportStatusOrDefault(searchParams.get('status'), 'PENDING');

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status: status as ReportStatus },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          content: { select: { id: true, title: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.count({ where: { status: status as ReportStatus } }),
    ]);

    return NextResponse.json({
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
