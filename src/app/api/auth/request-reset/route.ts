/**
 * POST /api/auth/request-reset
 * Request password reset token
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Return success regardless (prevent email enumeration)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور',
      });
    }

    // Check if user is banned
    if (user.status === 'BANNED') {
      // Still return success to prevent enumeration
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور',
      });
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: user.email,
        token: { contains: 'reset-' },
      },
    });

    // Store reset token (using verification_tokens table with prefix)
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: `reset-${token}`,
        expires,
      },
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, token, user.name || 'عزيزي المستخدم');

    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    );
  }
}
