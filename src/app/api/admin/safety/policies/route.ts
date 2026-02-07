/**
 * GET /api/admin/safety/policies  — get current safety policy
 * PUT /api/admin/safety/policies  — update safety policy
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { writeAuditLog } from '@/core/logging/audit';
import { safetyService } from '@/core/services/safety.service';

/** Ensure exactly one policy row exists and return it */
async function getOrCreatePolicy() {
  let policy = await prisma.safetyPolicy.findFirst();
  if (!policy) {
    policy = await prisma.safetyPolicy.create({ data: {} });
  }
  return policy;
}

export async function GET() {
  try {
    await guardAdmin();
    const policy = await getOrCreatePolicy();
    return NextResponse.json(policy);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await guardAdmin();
    const body = await request.json();

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
    } = body;

    const existing = await getOrCreatePolicy();

    const updateData: Record<string, unknown> = {};
    if (maxWarningsBeforeBan !== undefined) updateData.maxWarningsBeforeBan = Number(maxWarningsBeforeBan);
    if (autoHideFlagsCount !== undefined) updateData.autoHideFlagsCount = Number(autoHideFlagsCount);
    if (autoHideConfidence !== undefined) updateData.autoHideConfidence = Number(autoHideConfidence);
    if (maxReportsPerUser !== undefined) updateData.maxReportsPerUser = Number(maxReportsPerUser);
    if (enableAutoModeration !== undefined) updateData.enableAutoModeration = Boolean(enableAutoModeration);
    if (enableAIModeration !== undefined) updateData.enableAIModeration = Boolean(enableAIModeration);
    if (enableUserReporting !== undefined) updateData.enableUserReporting = Boolean(enableUserReporting);
    if (requireEmailVerify !== undefined) updateData.requireEmailVerify = Boolean(requireEmailVerify);
    if (newUserCooldownHours !== undefined) updateData.newUserCooldownHours = Number(newUserCooldownHours);
    if (maxContentPerDay !== undefined) updateData.maxContentPerDay = Number(maxContentPerDay);
    if (body.autoHideRules !== undefined) updateData.autoHideRules = body.autoHideRules;

    // Create version snapshot BEFORE applying changes (transactional)
    await safetyService.createVersionSnapshot(admin.id, 'Policy update');

    const updated = await prisma.safetyPolicy.update({
      where: { id: existing.id },
      data: updateData,
    });

    await writeAuditLog({
      action: 'SAFETY_POLICY_UPDATED',
      actorId: admin.id,
      actorRole: admin.role,
      targetType: 'SAFETY',
      targetId: existing.id,
      metadata: { before: existing, after: updated },
    });

    // Bust in-memory safety cache so new settings take effect immediately
    safetyService.invalidateCache();

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
