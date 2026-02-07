/**
 * POST /api/admin/safety/restore
 * Restore a safety policy version snapshot.
 * Overwrites current policy + keywords atomically (transaction).
 *
 * Body: { versionId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { Prisma } from '@prisma/client';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';
import { safetyService } from '@/core/services/safety.service';

export async function POST(request: NextRequest) {
  try {
    const admin = await guardAdmin();
    const { versionId } = (await request.json()) as { versionId?: string };

    if (!versionId) {
      return NextResponse.json({ error: 'معرف الإصدار مطلوب' }, { status: 400 });
    }

    const version = await prisma.safetyPolicyVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      return NextResponse.json({ error: 'الإصدار غير موجود' }, { status: 404 });
    }

    const snapshot = version.snapshot as {
      policy: Record<string, unknown>;
      keywords: Array<{ keyword: string; severity: string; reason?: string | null }>;
    };

    if (!snapshot?.policy || !Array.isArray(snapshot?.keywords)) {
      return NextResponse.json({ error: 'بيانات الإصدار غير صالحة' }, { status: 400 });
    }

    // Create a snapshot of the CURRENT state before restoring
    await safetyService.createVersionSnapshot(admin.id, `Pre-restore backup (restoring to ${versionId})`);

    // Atomic restore via transaction
    await prisma.$transaction(async (tx) => {
      // 1. Restore policy
      const currentPolicy = await tx.safetyPolicy.findFirst();
      if (currentPolicy) {
        const {
          maxWarningsBeforeBan,
          autoHideFlagsCount,
          autoHideConfidence,
          maxReportsPerUser,
          enableAutoModeration,
          enableAIModeration,
          enableUserReporting,
          requireEmailVerify,
          newUserCooldownHours,
          maxContentPerDay,
          autoHideRules,
        } = snapshot.policy;

        await tx.safetyPolicy.update({
          where: { id: currentPolicy.id },
          data: {
            ...(maxWarningsBeforeBan !== undefined && { maxWarningsBeforeBan: Number(maxWarningsBeforeBan) }),
            ...(autoHideFlagsCount !== undefined && { autoHideFlagsCount: Number(autoHideFlagsCount) }),
            ...(autoHideConfidence !== undefined && { autoHideConfidence: Number(autoHideConfidence) }),
            ...(maxReportsPerUser !== undefined && { maxReportsPerUser: Number(maxReportsPerUser) }),
            ...(enableAutoModeration !== undefined && { enableAutoModeration: Boolean(enableAutoModeration) }),
            ...(enableAIModeration !== undefined && { enableAIModeration: Boolean(enableAIModeration) }),
            ...(enableUserReporting !== undefined && { enableUserReporting: Boolean(enableUserReporting) }),
            ...(requireEmailVerify !== undefined && { requireEmailVerify: Boolean(requireEmailVerify) }),
            ...(newUserCooldownHours !== undefined && { newUserCooldownHours: Number(newUserCooldownHours) }),
            ...(maxContentPerDay !== undefined && { maxContentPerDay: Number(maxContentPerDay) }),
            autoHideRules: autoHideRules !== undefined
              ? (autoHideRules === null ? Prisma.JsonNull : (autoHideRules as Prisma.InputJsonValue))
              : undefined,
          },
        });
      }

      // 2. Restore keywords: deactivate all, then upsert from snapshot
      await tx.bannedKeyword.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      for (const kw of snapshot.keywords) {
        await tx.bannedKeyword.upsert({
          where: { keyword: kw.keyword },
          update: {
            isActive: true,
            severity: kw.severity || 'medium',
            reason: kw.reason || null,
          },
          create: {
            keyword: kw.keyword,
            severity: kw.severity || 'medium',
            reason: kw.reason || null,
            isActive: true,
            createdBy: admin.id,
          },
        });
      }
    });

    // Invalidate cache
    safetyService.invalidateCache();

    // Audit logs
    await writeAuditLog({
      action: 'SAFETY_POLICY_RESTORED',
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'SAFETY',
      targetId: versionId,
      metadata: { restoredVersionId: versionId, restoredAt: new Date().toISOString() },
    });

    return NextResponse.json({ success: true, restoredFrom: versionId });
  } catch (error) {
    return handleApiError(error);
  }
}
