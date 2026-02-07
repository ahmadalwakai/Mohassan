import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { getBaseUrl } from '@/core/config/env';

/**
 * Helper to create redirect URL using configured base URL
 * This ensures redirects go to the correct domain (not Vercel preview URLs)
 */
function createRedirectUrl(path: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(createRedirectUrl('/verify-email?error=missing_token'));
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(createRedirectUrl('/verify-email?error=invalid_token'));
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
      return NextResponse.redirect(createRedirectUrl('/verify-email?error=expired_token'));
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
    return NextResponse.redirect(createRedirectUrl('/email-verified'));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(createRedirectUrl('/verify-email?error=server_error'));
  }
}
