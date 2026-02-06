/**
 * Enum Validators
 * Zod-based validation for database enums
 */

import { z } from 'zod';

// ContentStatus enum from schema
export const ContentStatusEnum = z.enum([
  'DRAFT',
  'PENDING',
  'PUBLISHED',
  'REJECTED',
  'HIDDEN',
  'DELETED',
] as const);

export type ContentStatus = z.infer<typeof ContentStatusEnum>;

// ReportStatus enum from schema
export const ReportStatusEnum = z.enum([
  'PENDING',
  'REVIEWING',
  'RESOLVED',
  'DISMISSED',
] as const);

export type ReportStatus = z.infer<typeof ReportStatusEnum>;

// Role enum from schema
export const RoleEnum = z.enum([
  'USER',
  'MODERATOR',
  'ADMIN',
] as const);

export type Role = z.infer<typeof RoleEnum>;

/**
 * Parse and validate a ContentStatus from query param or string
 * Returns validated status or throws error
 */
export function parseContentStatus(value: unknown): ContentStatus {
  return ContentStatusEnum.parse(value);
}

/**
 * Parse and validate a ReportStatus from query param or string
 * Returns validated status or throws error
 */
export function parseReportStatus(value: unknown): ReportStatus {
  return ReportStatusEnum.parse(value);
}

/**
 * Parse and validate a Role from string
 * Returns validated role or throws error
 */
export function parseRole(value: unknown): Role {
  return RoleEnum.parse(value);
}

/**
 * Safely parse status, return default if invalid
 */
export function parseContentStatusOrDefault(
  value: unknown,
  defaultValue: ContentStatus = 'DRAFT'
): ContentStatus {
  try {
    return ContentStatusEnum.parse(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Safely parse report status, return default if invalid
 */
export function parseReportStatusOrDefault(
  value: unknown,
  defaultValue: ReportStatus = 'PENDING'
): ReportStatus {
  try {
    return ReportStatusEnum.parse(value);
  } catch {
    return defaultValue;
  }
}
