/**
 * Single Notification API Route
 * GET /api/user/notifications/[id] - Get single notification
 * PATCH /api/user/notifications/[id] - Update notification status
 * DELETE /api/user/notifications/[id] - Delete notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { prisma } from '@/core/db/prisma';

type RouteParams = Promise<{ id: string }>;

// GET - Get single notification
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'الإشعار غير موجود' },
        { status: 404 }
      );
    }

    // Check ownership
    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('[NOTIFICATION_GET]', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإشعار' },
      { status: 500 }
    );
  }
}

// PATCH - Update notification
export async function PATCH(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { read } = body;

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'الإشعار غير موجود' },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    // Update notification
    const updated = await prisma.notification.update({
      where: { id },
      data: {
        read: typeof read === 'boolean' ? read : undefined,
        readAt: read ? new Date() : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[NOTIFICATION_PATCH]', error);
    return NextResponse.json(
      { error: 'فشل في تحديث الإشعار' },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'الإشعار غير موجود' },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATION_DELETE]', error);
    return NextResponse.json(
      { error: 'فشل في حذف الإشعار' },
      { status: 500 }
    );
  }
}
