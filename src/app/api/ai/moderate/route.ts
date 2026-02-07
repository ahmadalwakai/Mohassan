import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/core/services';
import { auth } from '@/core/auth';

/**
 * POST /api/ai/moderate
 * Moderate content using AI with admin-controlled limits
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

    // Check if AI is enabled
    const aiEnabled = await aiService.isEnabled();
    if (!aiEnabled) {
      return NextResponse.json(
        { error: 'الذكاء الاصطناعي غير متاح حالياً' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    if (!body.title && !body.body) {
      return NextResponse.json(
        { error: 'يجب تقديم العنوان أو المحتوى' },
        { status: 400 }
      );
    }

    const result = await aiService.moderateContent(
      body.title || '',
      body.body || '',
      body.contentId,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI moderation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء فحص المحتوى' },
      { status: 500 }
    );
  }
}
