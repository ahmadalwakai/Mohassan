/**
 * GET /api/admin/users
 * List all users with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { prisma } from '@/core/db/prisma';

export async function GET(request: NextRequest) {
  try {
    await guardAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.max(1, Math.min(100, parseInt(
      searchParams.get('pageSize') || searchParams.get('limit') || '20'
    )));
    // Accept both `q` (from admin UI) and `search` (legacy)
    const search = searchParams.get('q') || searchParams.get('search') || '';
    const roleFilter = searchParams.get('role');
    const statusFilter = searchParams.get('status');

    const skip = (page - 1) * pageSize;

    // Build where clause
    const whereClause: Record<string, unknown> = {};
    
    // Search filter
    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (roleFilter === 'staff') {
      whereClause.role = { in: ['ADMIN', 'MODERATOR'] };
    } else if (roleFilter === 'ADMIN' || roleFilter === 'MODERATOR' || roleFilter === 'USER') {
      whereClause.role = roleFilter;
    }

    // Status filter
    if (statusFilter && ['ACTIVE', 'SUSPENDED', 'BANNED'].includes(statusFilter)) {
      whereClause.status = statusFilter;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          emailVerified: true,
          bannedAt: true,
          banExpiry: true,
          warningsCount: true,
          createdAt: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
