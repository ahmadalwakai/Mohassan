/**
 * GET  /api/admin/settings — Retrieve all settings (merged with defaults)
 * PUT  /api/admin/settings — Update settings
 *
 * Canonical endpoint.  The duplicate at src/api/admin/settings/ is obsolete.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';

// ── Default settings ────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  newsCategories: ['سياسة', 'اقتصاد', 'صحة', 'تقنية', 'رياضة', 'ترفيه'],
  directoryCategories: ['الشركات', 'المحترفون', 'الخدمات', 'التعليم'],
  marketTypes: ['sell', 'buy', 'jobs', 'realestate', 'lost'],
  forbiddenWords: [] as string[],
  moderationPolicy: {
    warningThreshold: 3,
    autoHideFlagsCount: 5,
    autoHideThreshold: 0.7,
  },
  aiUsageLimits: {
    dailySearchLimit: 100,
    dailySummarizeLimit: 50,
    dailyTagLimit: 30,
  },
};

// ── Helpers ─────────────────────────────────────────────────────────
async function mergedSettings(): Promise<Record<string, unknown>> {
  const dbSettings = await prisma.systemSetting.findMany();
  const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const s of dbSettings) {
    settings[s.key] = s.value;
  }
  return settings;
}

// ── GET ─────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest) {
  try {
    const admin = await guardAdmin();
    const settings = await mergedSettings();

    await writeAuditLog({
      action: 'SETTINGS_UPDATED', // reuse closest action type
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'SETTINGS',
      targetId: 'global',
      metadata: { event: 'viewed' },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

// ── PUT ─────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const admin = await guardAdmin();
    const updates = await request.json();

    if (typeof updates !== 'object' || Array.isArray(updates)) {
      return NextResponse.json({ error: 'الإعدادات يجب أن تكون كائن JSON' }, { status: 400 });
    }

    // Snapshot before
    const oldSettings = await mergedSettings();

    const metaBefore: Record<string, unknown> = {};
    const metaAfter: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
      metaBefore[key] = oldSettings[key];
      metaAfter[key] = value;

      await prisma.systemSetting.upsert({
        where: { key },
        create: { key, value: value as any },
        update: { value: value as any },
      });
    }

    await writeAuditLog({
      action: 'SETTINGS_UPDATED',
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'SETTINGS',
      targetId: 'global',
      metadata: { before: metaBefore, after: metaAfter },
    });

    const newSettings = await mergedSettings();
    return NextResponse.json(newSettings);
  } catch (error) {
    return handleApiError(error);
  }
}
