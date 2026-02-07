/**
 * Admin User Detail API
 * PATCH: Update user role/status
 */

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/core/auth/guards';
import type { Role, UserStatus } from '@prisma/client';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const admin = await requireAdmin();

    const { id } = params;
    const data = await request.json();
    const { role, status, banUntil, banReason } = data;

    // Fetch target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        bannedAt: true,
        banExpiry: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-demotion or being ban/suspended
    if (targetUser.id === admin.id && role && role !== admin.role) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Check if trying to demote last admin
    if (role && role !== 'ADMIN' && targetUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last admin user' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    const metadata: any = {
      before: {
        role: targetUser.role,
        status: targetUser.status,
        bannedAt: targetUser.bannedAt,
        banExpiry: targetUser.banExpiry,
      },
    };

    if (role && ['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      updateData.role = role as Role;
      metadata.roleChanged = true;
    }

    if (status && ['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
      updateData.status = status as UserStatus;
      metadata.statusChanged = true;

      // Handle ban/suspend
      if (status === 'BANNED') {
        updateData.bannedAt = new Date();
        updateData.banExpiry = banUntil ? new Date(banUntil) : null;
        updateData.banReason = banReason || 'No reason provided';
      } else if (status === 'ACTIVE') {
        updateData.bannedAt = null;
        updateData.banExpiry = null;
        updateData.banReason = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
    });

    // Log to AuditLog
    metadata.after = {
      role: updatedUser.role,
      status: updatedUser.status,
      bannedAt: updatedUser.bannedAt,
      banExpiry: updatedUser.banExpiry,
    };

    await prisma.auditLog.create({
      data: {
        action: 'USER_UPDATED',
        actorId: admin.id,
        actorRole: admin.role,
        targetType: 'USER',
        targetId: id,
        metadata,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('[Admin User PATCH]', error);

    if (error.code === 'UNAUTHORIZED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.code === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
