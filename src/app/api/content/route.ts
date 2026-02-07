import { NextRequest, NextResponse } from 'next/server';
import { contentService, ContentType } from '@/core/services';
import { auth } from '@/core/auth';
import { ContentStatus } from '@prisma/client';

// Rate limiting - simple in-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * GET /api/content
 * List content with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const type = searchParams.get('type') as ContentType | null;
    const status = searchParams.get('status') as ContentStatus | null;
    const authorId = searchParams.get('authorId');
    const tagSlug = searchParams.get('tag');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'updatedAt' | 'viewCount';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // For public requests, only show published content
    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
    
    const filters = {
      ...(type && { type }),
      ...(status && isAdmin ? { status } : { status: ContentStatus.PUBLISHED }),
      ...(authorId && { authorId }),
      ...(tagSlug && { tagSlug }),
      ...(search && { search }),
    };

    const result = await contentService.list(filters, { page, limit, sortBy, sortOrder });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Content list error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المحتوى' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content
 * Create new content
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check if user is banned or suspended
    const userStatus = (session.user as { status?: string }).status;
    if (userStatus === 'BANNED') {
      return NextResponse.json(
        { error: 'تم تعليق هذا الحساب' },
        { status: 403 }
      );
    }
    
    if (userStatus === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'تم تعليق هذا الحساب مؤقتاً' },
        { status: 403 }
      );
    }

    // Check email verification
    if (!session.user.emailVerified) {
      return NextResponse.json(
        { error: 'يجب تأكيد البريد الإلكتروني قبل نشر المحتوى' },
        { status: 403 }
      );
    }

    // Rate limiting: 10 posts per hour
    if (!checkRateLimit(`content:${session.user.id}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.title || !body.body) {
      return NextResponse.json(
        { error: 'النوع والعنوان والمحتوى مطلوبة' },
        { status: 400 }
      );
    }

    // Validate content type
    const validTypes: ContentType[] = ['news', 'directory', 'market', 'community', 'initiative'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'نوع المحتوى غير صالح' },
        { status: 400 }
      );
    }

    // Sanitize input
    const input = {
      type: body.type as ContentType,
      title: body.title.trim().substring(0, 200),
      body: body.body.trim(),
      excerpt: body.excerpt?.trim().substring(0, 500),
      featuredImage: body.featuredImage,
      images: body.images,
      metadata: body.metadata,
      tags: body.tags?.slice(0, 10), // Max 10 tags
      authorId: session.user.id,
    };

    const content = await contentService.create(input);

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Content creation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المحتوى' },
      { status: 500 }
    );
  }
}
