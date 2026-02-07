/**
 * Initiative Join Endpoint
 * POST /api/initiatives/[id]/join - User joins an initiative
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { prisma } from '@/core/db/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the initiative
    const initiative = await prisma.content.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        authorId: true,
        metadata: true,
      },
    });

    if (!initiative) {
      return NextResponse.json(
        { error: 'المبادرة غير موجودة' },
        { status: 404 }
      );
    }

    if (initiative.type !== 'initiative') {
      return NextResponse.json(
        { error: 'هذا المحتوى ليس مبادرة' },
        { status: 400 }
      );
    }

    // Can't join your own initiative
    if (initiative.authorId === session.user.id) {
      return NextResponse.json(
        { error: 'لا يمكنك الانضمام إلى مبادرتك الخاصة' },
        { status: 400 }
      );
    }

    // Check if already joined (store joins in metadata)
    const members = ((initiative.metadata as any)?.members as string[]) || [];
    if (members.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'أنت بالفعل منضم إلى هذه المبادرة' },
        { status: 400 }
      );
    }

    // Add user as member to metadata
    const updatedMembers = [...members, session.user.id];
    await prisma.content.update({
      where: { id },
      data: {
        metadata: {
          ...(initiative.metadata as any),
          members: updatedMembers,
          memberCount: updatedMembers.length,
        },
      },
    });

    // Notify initiative owner
    await prisma.notification.create({
      data: {
        type: 'CONTENT',
        title: `شخص جديد انضم إلى مبادرتك`,
        message: `انضم ${session.user.name || 'مستخدم'} إلى مبادرتك "${initiative.title}"`,
        userId: initiative.authorId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم الانضمام إلى المبادرة بنجاح',
    }, { status: 201 });
  } catch (error) {
    console.error('[INITIATIVE_JOIN]', error);
    const message = error instanceof Error ? error.message : 'فشل في الانضمام';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
