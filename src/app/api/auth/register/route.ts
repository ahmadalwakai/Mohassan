/**
 * User Registration API
 * Creates new user accounts with email/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '@/core/db/prisma';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '@/core/security/rate-limit';
import { sanitizeEmail, sanitizeInput } from '@/core/security/sanitization';
import { sendVerificationEmail } from '@/services/email';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(identifier, 'auth');
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const body: RegisterRequest = await request.json();
    const { name, email, password } = body;

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name).trim();
    const sanitizedEmail = sanitizeEmail(email);

    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      );
    }

    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return NextResponse.json(
        { error: 'الاسم يجب أن يكون بين 2 و 100 حرف' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate and store verification token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: sanitizedEmail,
        token,
        expires,
      },
    });

    // Send verification email
    console.log('[REGISTER] About to call sendVerificationEmail for:', sanitizedEmail);
    await sendVerificationEmail(sanitizedEmail, token, sanitizedName);
    console.log('[REGISTER] sendVerificationEmail completed');

    return NextResponse.json(
      {
        message: 'تم إنشاء الحساب بنجاح. يرجى تأكيد بريدك الإلكتروني.',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
