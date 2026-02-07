/**
 * Centralized API Route Guard
 * 
 * Single-source RBAC enforcement for ALL admin/moderation API routes.
 * Every API handler should use one of these instead of manual session checks.
 * 
 * Usage:
 *   const admin = await guardAdmin();         // throws → auto 401/403
 *   const mod   = await guardModerator();     // throws → auto 401/403
 *   const user  = await guardAuthenticated(); // throws → auto 401
 */

import { NextResponse } from 'next/server';
import { auth } from './auth';
import { isAtLeastRole, hasPermission, type Role, type Permission } from '@/core/config/rbac';
import type { UserStatus } from '@prisma/client';

export interface ApiUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: Role;
  status: UserStatus;
  emailVerified: Date | null;
}

export class ApiAuthError extends Error {
  public readonly httpStatus: number;
  public readonly code: 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'ACCOUNT_BANNED';

  constructor(
    message: string,
    code: 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'ACCOUNT_BANNED',
    httpStatus: number
  ) {
    super(message);
    this.name = 'ApiAuthError';
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

/**
 * Core guard — resolves session, checks status, asserts minimum role
 */
async function guardRole(minimumRole: Role): Promise<ApiUser> {
  const session = await auth();

  if (!session?.user) {
    throw new ApiAuthError('يجب تسجيل الدخول', 'UNAUTHENTICATED', 401);
  }

  const user = session.user as ApiUser;

  if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
    throw new ApiAuthError('هذا الحساب معطل', 'ACCOUNT_BANNED', 403);
  }

  if (!isAtLeastRole(user.role, minimumRole)) {
    throw new ApiAuthError('ليس لديك صلاحية', 'UNAUTHORIZED', 403);
  }

  return user;
}

/** Require ADMIN role */
export async function guardAdmin(): Promise<ApiUser> {
  return guardRole('ADMIN');
}

/** Require at least MODERATOR role */
export async function guardModerator(): Promise<ApiUser> {
  return guardRole('MODERATOR');
}

/** Require any authenticated, non-banned user */
export async function guardAuthenticated(): Promise<ApiUser> {
  return guardRole('USER');
}

/** Require a specific RBAC permission */
export async function guardPermission(permission: Permission): Promise<ApiUser> {
  const user = await guardAuthenticated();
  if (!hasPermission(user.role, permission)) {
    throw new ApiAuthError('ليس لديك صلاحية تنفيذ هذا الإجراء', 'UNAUTHORIZED', 403);
  }
  return user;
}

/**
 * Catch-all error handler for API routes.
 * Converts ApiAuthError (and legacy AuthError) into proper JSON responses.
 *
 * Usage:
 *   catch (error) { return handleApiError(error); }
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.httpStatus });
  }

  // Support legacy AuthError from guards.ts
  if (error instanceof Error && 'code' in error) {
    const legacyError = error as Error & { code: string };
    if (legacyError.code === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: legacyError.message }, { status: 401 });
    }
    if (legacyError.code === 'UNAUTHORIZED' || legacyError.code === 'ACCOUNT_BANNED') {
      return NextResponse.json({ error: legacyError.message }, { status: 403 });
    }
  }

  console.error('[API ERROR]', error);
  return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 });
}
