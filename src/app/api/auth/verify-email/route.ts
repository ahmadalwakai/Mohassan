import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/verify-email?error=missing_token', request.url));
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid_token', request.url));
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { 
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          }
        },
      });
      return NextResponse.redirect(new URL('/verify-email?error=expired_token', request.url));
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { 
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        }
      },
    });

    // Redirect to success page
    return NextResponse.redirect(new URL('/email-verified', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/verify-email?error=server_error', request.url));
  }
}
