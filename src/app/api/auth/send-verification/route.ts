import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/core/auth';
import { prisma } from '@/core/db/prisma';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // Check if already verified
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مؤكد مسبقاً' },
        { status: 400 }
      );
    }

    // Check for rate limiting - prevent spam
    const recentToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: user.email,
        expires: { gt: new Date(Date.now() - 60000) }, // Last minute
      },
    });

    if (recentToken) {
      return NextResponse.json(
        { error: 'يرجى الانتظار قبل طلب رسالة تحقق جديدة' },
        { status: 429 }
      );
    }

    // Delete any existing tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    // Generate new token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, token, user.name || 'عزيزي المستخدم');

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رسالة التحقق',
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال رسالة التحقق' },
      { status: 500 }
    );
  }
}
