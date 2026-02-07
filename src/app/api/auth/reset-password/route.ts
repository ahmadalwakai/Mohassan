/**
 * POST /api/auth/reset-password
 * Reset password using token
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'توكن غير صالح' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'كلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'كلمات المرور غير متطابقة' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // Find the reset token
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        token: `reset-${token}`,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: resetToken.identifier,
            token: resetToken.token,
          },
        },
      });
      return NextResponse.json(
        { error: 'رابط إعادة التعيين منتهي الصلاحية' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email: resetToken.identifier },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: resetToken.identifier,
          token: resetToken.token,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' },
      { status: 500 }
    );
  }
}
