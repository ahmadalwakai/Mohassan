/**
 * GET /api/admin/audit
 * Get audit logs with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { prisma } from '@/core/db/prisma';

export async function GET(request: NextRequest) {
  try {
    await guardAdmin();

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
    return handleApiError(error);
  }
}
