/**
 * GET /api/moderator/queue
 * Get flagged content pending moderation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/core/auth/guards';
import { prisma } from '@/core/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || !['MODERATOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.content.count({ where: { status: 'PENDING' } }),
    ]);

    return NextResponse.json({
      queue: content,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/moderator/queue error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
