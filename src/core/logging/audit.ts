/**
 * Audit Log Utility
 * Logs administrative and moderation actions
 */

import type { Role } from '@/core/config/rbac';
import { prisma } from '@/core/db/prisma';

export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'USER_ROLE_CHANGED'
  | 'CONTENT_CREATED'
  | 'CONTENT_UPDATED'
  | 'CONTENT_DELETED'
  | 'CONTENT_HIDDEN'
  | 'CONTENT_UNHIDDEN'
  | 'CONTENT_WARNED'
  | 'REPORT_CREATED'
  | 'REPORT_RESOLVED'
  | 'SETTINGS_UPDATED'
  | 'AI_PROMPT_UPDATED';

export interface AuditLogEntry {
  action: AuditAction;
  actorId: string;
  actorRole: Role;
  targetType: 'USER' | 'CONTENT' | 'REPORT' | 'SETTINGS' | 'AI';
  targetId: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/**
 * Write an audit log entry
 * Fails silently to prevent logging from breaking requests
 */
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : null,
        ip: entry.ip,
        userAgent: entry.userAgent,
      },
    });
  } catch (error) {
    // Log to console but don't crash the request
    console.error('[AUDIT LOG ERROR]', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Query audit logs with filters
 * Fails gracefully with empty array if database error
 */
export async function queryAuditLogs(filters: {
  actorId?: string;
  targetType?: AuditLogEntry['targetType'];
  targetId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<AuditLogEntry[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        ...(filters.actorId && { actorId: filters.actorId }),
        ...(filters.targetType && { targetType: filters.targetType }),
        ...(filters.targetId && { targetId: filters.targetId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.startDate && { createdAt: { gte: filters.startDate } }),
        ...(filters.endDate && { createdAt: { lte: filters.endDate } }),
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });

    return logs as AuditLogEntry[];
  } catch (error) {
    // Log to console but return empty array
    console.error('[AUDIT QUERY ERROR]', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}
