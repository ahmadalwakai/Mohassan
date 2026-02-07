/**
 * Admin Users API
 * GET: List users with filters
 * POST: Create user (optional)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/core/auth/guards';
import type { Role, UserStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') || '20')));
    const q = searchParams.get('q') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};

    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (role && ['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      where.role = role as Role;
    }

    if (status && ['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
      where.status = status as UserStatus;
    }

    // Count total
    const total = await prisma.user.count({ where });

    // Fetch users
    const users = await prisma.user.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    // Log to AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'USERS_LISTED',
        actorId: admin.id,
        actorRole: admin.role,
        targetType: 'USER',
        targetId: 'multiple',
        metadata: {
          page,
          pageSize,
          total,
          query: q,
          role,
          status,
        },
      },
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error('[Admin Users GET]', error);

    if (error.code === 'UNAUTHORIZED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.code === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await requireAdmin();

    const data = await request.json();
    const { email, name, role } = data;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        role: role && ['USER', 'MODERATOR', 'ADMIN'].includes(role) ? role : 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Log to AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'USER_CREATED',
        actorId: admin.id,
        actorRole: admin.role,
        targetType: 'USER',
        targetId: newUser.id,
        metadata: {
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Users POST]', error);

    if (error.code === 'UNAUTHORIZED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.code === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
