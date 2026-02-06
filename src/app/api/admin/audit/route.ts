/**
 * GET /api/admin/audit
 * Get audit logs with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/core/auth/guards';
import { prisma } from '@/core/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const days = parseInt(searchParams.get('days') || '30');

    const skip = (page - 1) * limit;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where: { createdAt: { gte: Date }; action?: string } = {
      createdAt: { gte: since },
    };

    if (action) {
      where.action = action;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { id: true, email: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        user: log.actor,
        targetId: log.targetId,
        createdAt: log.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/admin/audit error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
