/**
 * POST /api/moderator/reports/[id]
 * Resolve/dismiss reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/core/auth/guards';
import { prisma } from '@/core/db/prisma';
import { writeAuditLog } from '@/core/logging/audit';
import { ReportStatusEnum, RoleEnum } from '@/lib/validators/enums';

type Params = Promise<{ id: string }>;

const statusMap: Record<string, string> = {
  RESOLVE: 'RESOLVED',
  DISMISS: 'DISMISSED',
} as const;

export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const session = await getSession();

    if (!session?.user || !['MODERATOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action, resolution } = await request.json();
    if (!['RESOLVE', 'DISMISS'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = statusMap[action];
    
    // Validate status
    try {
      ReportStatusEnum.parse(newStatus);
    } catch {
      return NextResponse.json({ error: 'Invalid target status' }, { status: 400 });
    }

    // Validate role
    try {
      RoleEnum.parse(session.user.role);
    } catch {
      return NextResponse.json({ error: 'Invalid actor role' }, { status: 400 });
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: newStatus as 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED',
        resolution: resolution,
        resolvedAt: new Date(),
        reviewerId: session.user.id,
      },
      select: { id: true, status: true },
    });

    // Log action
    await writeAuditLog({
      action: action === 'RESOLVE' ? 'REPORT_RESOLVED' : 'SETTINGS_UPDATED',
      actorId: session.user.id,
      actorRole: session.user.role as 'USER' | 'MODERATOR' | 'ADMIN',
      targetType: 'REPORT',
      targetId: id,
      metadata: { decision: action, resolution },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('POST /api/moderator/reports/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
