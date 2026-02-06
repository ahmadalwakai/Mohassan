import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/core/services';
import { auth } from '@/core/auth';

/**
 * POST /api/ai/summarize
 * Generate content summary using AI
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

    const body = await request.json();
    
    if (!body.body) {
      return NextResponse.json(
        { error: 'يجب تقديم المحتوى' },
        { status: 400 }
      );
    }

    const result = await aiService.summarizeContent(
      body.title || '',
      body.body,
      body.contentId,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تلخيص المحتوى' },
      { status: 500 }
    );
  }
}
