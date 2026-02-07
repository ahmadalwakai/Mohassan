/**
 * AI CENTER API
 * GET /api/admin/ai-center - Get AI settings and stats
 * POST /api/admin/ai-center - Update AI settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/core/auth/guards';
import { prisma } from '@/core/db/prisma';
import { writeAuditLog } from '@/core/logging/audit';
import { z } from 'zod';

// Default AI settings
const DEFAULT_AI_SETTINGS = {
  ai: {
    enabled: true,
    rateLimit: {
      perMinute: 30,
    },
    maxTokens: {
      chat: 2048,
      summarize: 1024,
      moderation: 1024,
    },
    prompts: {
      chat: 'أنت مساعد ذكي يتحدث العربية والإنجليزية. اسمك "Typhoon AI". مهمتك مساعدة المستخدمين في الإجابة على الأسئلة العامة، كتابة وتحرير النصوص، تلخيص المحتوى، الترجمة، وتقديم النصائح والمعلومات. كن ودوداً ومفيداً. أجب باللغة التي يستخدمها المستخدم.',
      moderation: 'أنت مشرف محتوى ذكي. مهمتك فحص المحتوى العربي والإنجليزي للتحقق من مخالفته لسياسات المجتمع. قم بتحليل المحتوى وأعطِ تقييماً موضوعياً بشأن الموافقة عليه أم رفضه.',
      summarize: 'أنت مساعد ذكي متخصص في تحليل وتلخيص المحتوى. قم بتحليل المحتوى وأعطِ ملخصاً موجزاً وكلمات مفتاحية وتقييماً للمشاعر.',
    },
  },
};

interface AISettings {
  ai: {
    enabled: boolean;
    rateLimit: {
      perMinute: number;
    };
    maxTokens: {
      chat: number;
      summarize: number;
      moderation: number;
    };
    prompts: {
      chat: string;
      moderation: string;
      summarize: string;
    };
  };
}

// Validation schema for prompt updates
const updateSettingsSchema = z.object({
  ai: z.object({
    enabled: z.boolean(),
    rateLimit: z.object({
      perMinute: z.number().min(1).max(1000),
    }),
    maxTokens: z.object({
      chat: z.number().min(256).max(4096),
      summarize: z.number().min(256).max(4096),
      moderation: z.number().min(256).max(4096),
    }),
    prompts: z.object({
      chat: z.string().min(10).max(5000),
      moderation: z.string().min(10).max(5000),
      summarize: z.string().min(10).max(5000),
    }),
  }),
});

/**
 * Get AI settings and usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const session = await requireAdmin();

    // Get AI settings from SystemSetting
    let settingsRecord = await prisma.systemSetting.findUnique({
      where: { key: 'ai' },
    });

    let settings: AISettings = DEFAULT_AI_SETTINGS;
    if (settingsRecord?.value) {
      settings = { ...DEFAULT_AI_SETTINGS, ...JSON.parse(JSON.stringify(settingsRecord.value)) };
    }

    // Get usage stats for last 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const aiEventStats = await prisma.aIEventLog.groupBy({
      by: ['success'],
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      _count: true,
      _avg: {
        latencyMs: true,
      },
    });

    // Calculate total requests and stats
    const totalRequests = aiEventStats.reduce((sum, stat) => sum + stat._count, 0);
    const successCount =
      aiEventStats.find((stat) => stat.success === true)?._count || 0;
    const failureCount =
      aiEventStats.find((stat) => stat.success === false)?._count || 0;
    const avgLatency = Math.round(
      (aiEventStats.reduce((sum, stat) => sum + (stat._avg.latencyMs || 0), 0) /
        Math.max(aiEventStats.length, 1)) *
        100
    ) / 100;

    // Get event breakdown by type
    const eventTypeBreakdown = await prisma.aIEventLog.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      _count: true,
    });

    const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    return NextResponse.json({
      settings,
      model: {
        name: modelName,
      },
      usage: {
        last24h: {
          totalRequests,
          success: successCount,
          failure: failureCount,
          avgLatencyMs: avgLatency,
          byType: eventTypeBreakdown.reduce(
            (acc, item) => ({
              ...acc,
              [item.type]: item._count,
            }),
            {}
          ),
        },
      },
    });
  } catch (error) {
    console.error('GET /api/admin/ai-center error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Update AI settings
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const session = await requireAdmin();

    const body = await request.json();

    // Validate input
    const validation = updateSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'بيانات غير صالحة',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const newSettings = validation.data as AISettings;

    // Get current settings for diff
    let oldSettings: AISettings | null = null;
    const currentRecord = await prisma.systemSetting.findUnique({
      where: { key: 'ai' },
    });
    if (currentRecord?.value) {
      oldSettings = JSON.parse(JSON.stringify(currentRecord.value));
    }

    // Update SystemSetting
    const updatedRecord = await prisma.systemSetting.upsert({
      where: { key: 'ai' },
      create: {
        key: 'ai',
        value: JSON.parse(JSON.stringify(newSettings)),
      },
      update: {
        value: JSON.parse(JSON.stringify(newSettings)),
      },
    });

    // Log the change to AuditLog (without sensitive data)
    const diff = {
      enabled:
        oldSettings?.ai?.enabled !== newSettings.ai.enabled
          ? {
              before: oldSettings?.ai?.enabled,
              after: newSettings.ai.enabled,
            }
          : null,
      rateLimit:
        JSON.stringify(oldSettings?.ai?.rateLimit) !==
        JSON.stringify(newSettings.ai.rateLimit)
          ? {
              before: oldSettings?.ai?.rateLimit,
              after: newSettings.ai.rateLimit,
            }
          : null,
      maxTokens:
        JSON.stringify(oldSettings?.ai?.maxTokens) !==
        JSON.stringify(newSettings.ai.maxTokens)
          ? {
              before: oldSettings?.ai?.maxTokens,
              after: newSettings.ai.maxTokens,
            }
          : null,
      prompts:
        Object.keys(newSettings.ai.prompts).some(
          (key) =>
            oldSettings?.ai?.prompts[key as keyof typeof newSettings.ai.prompts] !==
            newSettings.ai.prompts[key as keyof typeof newSettings.ai.prompts]
        )
          ? {
              chat: oldSettings?.ai?.prompts?.chat !== newSettings.ai.prompts.chat,
              moderation:
                oldSettings?.ai?.prompts?.moderation !==
                newSettings.ai.prompts.moderation,
              summarize:
                oldSettings?.ai?.prompts?.summarize !==
                newSettings.ai.prompts.summarize,
            }
          : null,
    };

    const userId = session.id || '';
    const userRole = session.role as 'ADMIN' | 'MODERATOR' | 'USER';

    await writeAuditLog({
      action: 'AI_PROMPT_UPDATED',
      actorId: userId,
      actorRole: userRole,
      targetType: 'AI',
      targetId: 'ai-settings',
      metadata: {
        changes: Object.fromEntries(
          Object.entries(diff).filter(([, v]) => v !== null)
        ),
      },
    });

    // Return updated settings
    const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    return NextResponse.json({
      settings: newSettings,
      model: {
        name: modelName,
      },
      message: 'تم تحديث إعدادات الذكاء الاصطناعي بنجاح',
    });
  } catch (error) {
    console.error('POST /api/admin/ai-center error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
