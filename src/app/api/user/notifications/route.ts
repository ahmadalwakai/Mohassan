/**
 * User Notifications API Routes
 * GET /api/user/notifications - Get user notifications
 * PATCH /api/user/notifications/[id] - Mark notification as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { prisma } from '@/core/db/prisma';

// GET - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      whereClause.read = false;
    }

    // Get notifications and total count
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: whereClause }),
    ]);

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإشعارات' },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read
      const result = await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        updated: result.count,
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'notificationIds مطلوب' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error('[NOTIFICATIONS_PATCH]', error);
    return NextResponse.json(
      { error: 'فشل في تحديث الإشعارات' },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds, deleteAll } = body;

    if (deleteAll) {
      // Delete all notifications
      const result = await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        success: true,
        deleted: result.count,
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'notificationIds مطلوب' },
        { status: 400 }
      );
    }

    // Delete specific notifications
    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error('[NOTIFICATIONS_DELETE]', error);
    return NextResponse.json(
      { error: 'فشل في حذف الإشعارات' },
      { status: 500 }
    );
  }
}
