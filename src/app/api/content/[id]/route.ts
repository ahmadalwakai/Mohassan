import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/core/services';
import { auth } from '@/core/auth';
import { ContentStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/content/[id]
 * Get single content by ID or slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    
    const content = await contentService.getOne(id, true); // Increment view count

    if (!content) {
      return NextResponse.json(
        { error: 'المحتوى غير موجود' },
        { status: 404 }
      );
    }

    // Check if user can view non-published content
    const isAuthor = session?.user?.id === content.authorId;
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
    
    if (content.status !== ContentStatus.PUBLISHED && !isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'المحتوى غير متاح' },
        { status: 403 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المحتوى' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/content/[id]
 * Update content
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';

    // Sanitize input
    const input = {
      ...(body.title && { title: body.title.trim().substring(0, 200) }),
      ...(body.body && { body: body.body.trim() }),
      ...(body.excerpt && { excerpt: body.excerpt.trim().substring(0, 500) }),
      ...(body.featuredImage !== undefined && { featuredImage: body.featuredImage }),
      ...(body.images !== undefined && { images: body.images }),
      ...(body.metadata !== undefined && { metadata: body.metadata }),
      ...(body.tags !== undefined && { tags: body.tags?.slice(0, 10) }),
      // Only admins can change status directly
      ...(isAdmin && body.status && { status: body.status }),
    };

    const content = await contentService.update(id, input, session.user.id, isAdmin);

    return NextResponse.json(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث المحتوى';
    console.error('Content update error:', error);
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/content/[id]
 * Delete content
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    
    await contentService.delete(id, session.user.id, isAdmin);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ أثناء حذف المحتوى';
    console.error('Content delete error:', error);
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
