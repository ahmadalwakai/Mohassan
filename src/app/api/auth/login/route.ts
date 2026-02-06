import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { prisma } from '@/core/db/prisma';
import { signIn } from '@/core/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Check if user is banned
    if (user.status === 'BANNED') {
      if (user.banExpiry && user.banExpiry > new Date()) {
        return NextResponse.json(
          { error: 'حسابك موقوف مؤقتاً. يرجى المحاولة لاحقاً.', code: 'ACCOUNT_BANNED_TEMP' },
          { status: 403 }
        );
      }
      if (!user.banExpiry) {
        return NextResponse.json(
          { error: 'حسابك موقوف بشكل دائم.', code: 'ACCOUNT_BANNED_PERM' },
          { status: 403 }
        );
      }
      // Ban expired, unban user
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE', bannedAt: null, banExpiry: null, banReason: null },
      });
    }

    // Use server-side signIn
    try {
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
    } catch (error) {
      // Auth.js throws a NEXT_REDIRECT "error" on success
      // This is expected behavior
      const err = error as Error;
      if (err.message?.includes('NEXT_REDIRECT')) {
        // Success - return user info
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: user.emailVerified,
          },
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
