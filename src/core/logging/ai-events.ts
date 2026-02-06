/**
 * AI Event Log Utility
 * Logs AI interactions with token usage and latency
 */

import { prisma } from '@/core/db/prisma';

export type AIEventType = 'SEARCH' | 'SUMMARIZE' | 'TAG' | 'MOD_ASSIST';

export interface AIEventLogEntry {
  type: AIEventType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  actorId?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Write an AI event log entry
 * Fails silently to prevent logging from breaking requests
 */
export async function writeAIEventLog(entry: AIEventLogEntry): Promise<void> {
  try {
    // Redact any PII from metadata before logging
    const sanitizedEntry = {
      ...entry,
      metadata: entry.metadata ? redactPII(entry.metadata) : undefined,
    };
    
    await prisma.aIEventLog.create({
      data: {
        type: entry.type,
        model: entry.model,
        inputTokens: entry.inputTokens,
        outputTokens: entry.outputTokens,
        totalTokens: entry.totalTokens,
        latencyMs: entry.latencyMs,
        actorId: entry.actorId,
        success: entry.success,
        error: entry.error,
        metadata: sanitizedEntry.metadata ? JSON.parse(JSON.stringify(sanitizedEntry.metadata)) : null,
      },
    });
  } catch (error) {
    // Log to console but don't crash the request
    console.error('[AI EVENT LOG ERROR]', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Query AI event logs with filters
 * Fails gracefully with empty array if database error
 */
export async function queryAIEventLogs(filters: {
  type?: AIEventType;
  actorId?: string;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<AIEventLogEntry[]> {
  try {
    const logs = await prisma.aIEventLog.findMany({
      where: {
        ...(filters.type && { type: filters.type }),
        ...(filters.actorId && { actorId: filters.actorId }),
        ...(filters.success !== undefined && { success: filters.success }),
        ...(filters.startDate && { createdAt: { gte: filters.startDate } }),
        ...(filters.endDate && { createdAt: { lte: filters.endDate } }),
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });

    return logs as AIEventLogEntry[];
  } catch (error) {
    // Log to console but return empty array
    console.error('[AI EVENT QUERY ERROR]', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

/**
 * Redact PII from metadata
 */
function redactPII(data: Record<string, unknown>): Record<string, unknown> {
  const piiPatterns = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /(\+?966|0)?5\d{8}/g,
    // Add more patterns as needed
  };
  
  const redact = (value: unknown): unknown => {
    if (typeof value === 'string') {
      let redacted = value;
      for (const pattern of Object.values(piiPatterns)) {
        redacted = redacted.replace(pattern, '[REDACTED]');
      }
      return redacted;
    }
    if (Array.isArray(value)) {
      return value.map(redact);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, redact(v)])
      );
    }
    return value;
  };
  
  return redact(data) as Record<string, unknown>;
}
