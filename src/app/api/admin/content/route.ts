/**
 * GET /api/admin/content
 * List all content with filters for admin management.
 *
 * Query params: page, pageSize, type, status, authorId, q, dateFrom, dateTo, flagged
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';

export async function GET(request: NextRequest) {
  try {
    await guardAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') || '20')));
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const authorId = searchParams.get('authorId');
    const q = searchParams.get('q');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const flagged = searchParams.get('flagged');

    const skip = (page - 1) * pageSize;

    // Build where
    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { body: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    // flagged = has at least one open report
    if (flagged === 'true') {
      where.reports = { some: { status: { in: ['PENDING', 'REVIEWING'] } } };
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        select: {
          id: true,
          type: true,
          title: true,
          slug: true,
          excerpt: true,
          image: true,
          status: true,
          viewCount: true,
          createdAt: true,
          publishedAt: true,
          author: { select: { id: true, name: true, email: true } },
          _count: { select: { reports: true } },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({
      contents,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
