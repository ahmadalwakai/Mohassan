/**
 * Admin Settings API
 * GET: Retrieve all settings (merged with defaults)
 * PUT: Update settings
 */

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/core/auth/guards';

// Default settings
const DEFAULT_SETTINGS = {
  newsCategories: ['سياسة', 'اقتصاد', 'صحة', 'تقنية', 'رياضة', 'ترفيه'],
  directoryCategories: ['الشركات', 'المحترفون', 'الخدمات', 'التعليم'],
  marketTypes: ['sell', 'buy', 'jobs', 'realestate', 'lost'],
  forbiddenWords: [],
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

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await requireAdmin();

    // Fetch all settings
    const dbSettings = await prisma.systemSetting.findMany();

    // Build merged settings object
    const settings: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const setting of dbSettings) {
      settings[setting.key] = setting.value;
    }

    // Log to AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'SETTINGS_VIEWED',
        actorId: admin.id,
        actorRole: admin.role,
        targetType: 'SETTINGS',
        targetId: 'global',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('[Admin Settings GET]', error);

    if (error.code === 'UNAUTHORIZED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.code === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await requireAdmin();

    const updates = await request.json();

    // Validate that updates is an object
    if (typeof updates !== 'object' || Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Settings must be a JSON object' },
        { status: 400 }
      );
    }

    // Get current settings for audit log
    const oldSettings: Record<string, any> = { ...DEFAULT_SETTINGS };
    const dbSettings = await prisma.systemSetting.findMany();
    for (const setting of dbSettings) {
      oldSettings[setting.key] = setting.value;
    }

    // Update each setting
    const metadata: any = {
      before: {},
      after: {},
      timestamp: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(updates)) {
      metadata.before[key] = oldSettings[key];
      metadata.after[key] = value;

      await prisma.systemSetting.upsert({
        where: { key },
        create: { key, value: value as any },
        update: { value: value as any },
      });
    }

    // Log to AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'SETTINGS_UPDATED',
        actorId: admin.id,
        actorRole: admin.role,
        targetType: 'SETTINGS',
        targetId: 'global',
        metadata,
      },
    });

    // Return merged settings
    const newSettings: Record<string, any> = { ...DEFAULT_SETTINGS };
    const updatedDbSettings = await prisma.systemSetting.findMany();
    for (const setting of updatedDbSettings) {
      newSettings[setting.key] = setting.value;
    }

    return NextResponse.json(newSettings);
  } catch (error: any) {
    console.error('[Admin Settings PUT]', error);

    if (error.code === 'UNAUTHORIZED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.code === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
