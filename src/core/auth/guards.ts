/**
 * Auth Guards
 * Server-side authentication and authorization utilities
 */

import { auth } from './auth';
import { type Role, hasPermission, isAtLeastRole, type Permission } from '@/core/config/rbac';
import type { UserStatus } from '@prisma/client';

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: Role;
  status: UserStatus;
  emailVerified: Date | null;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'EMAIL_NOT_VERIFIED' | 'ACCOUNT_BANNED'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Get the current session (server component / server action)
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user or throw if not authenticated
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const session = await auth();
  
  if (!session?.user) {
    throw new AuthError('يجب تسجيل الدخول للوصول إلى هذه الصفحة', 'UNAUTHENTICATED');
  }

  // Check if user is banned or suspended
  const user = session.user as SessionUser;
  if (user.status === 'BANNED') {
    throw new AuthError('تم تعليق هذا الحساب', 'ACCOUNT_BANNED');
  }
  
  if (user.status === 'SUSPENDED') {
    throw new AuthError('تم تعليق هذا الحساب مؤقتاً', 'ACCOUNT_BANNED');
  }

  return user;
}

/**
 * Require user to be authenticated
 */
export function requireAuth(user: SessionUser | null | undefined): asserts user is SessionUser {
  if (!user) {
    throw new AuthError('يجب تسجيل الدخول للوصول إلى هذه الصفحة', 'UNAUTHENTICATED');
  }
}

/**
 * Require email to be verified
 */
export function requireEmailVerified(user: SessionUser): void {
  if (!user.emailVerified) {
    throw new AuthError('يجب تأكيد البريد الإلكتروني أولاً', 'EMAIL_NOT_VERIFIED');
  }
}

/**
 * Require minimum role level
 */
export function requireRole(user: SessionUser, role: Role): void {
  if (!isAtLeastRole(user.role, role)) {
    throw new AuthError('ليس لديك صلاحية الوصول إلى هذه الصفحة', 'UNAUTHORIZED');
  }
}

/**
 * Require specific permission
 */
export function requirePermission(user: SessionUser, permission: Permission): void {
  if (!hasPermission(user.role, permission)) {
    throw new AuthError('ليس لديك صلاحية تنفيذ هذا الإجراء', 'UNAUTHORIZED');
  }
}

/**
 * Require all specified permissions
 */
export function requirePermissions(user: SessionUser, permissions: Permission[]): void {
  for (const permission of permissions) {
    requirePermission(user, permission);
  }
}

/**
 * Check if user can create content (authenticated + email verified)
 */
export async function requireContentCreation(): Promise<SessionUser> {
  const user = await getCurrentUser();
  requireEmailVerified(user);
  return user;
}

/**
 * Check if user is a moderator or admin
 */
export async function requireModerator(): Promise<SessionUser> {
  const user = await getCurrentUser();
  requireRole(user, 'MODERATOR');
  return user;
}

/**
 * Check if user is an admin
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  return user;
}
