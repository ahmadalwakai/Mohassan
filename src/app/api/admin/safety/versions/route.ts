/**
 * GET /api/admin/safety/versions
 * List safety policy version snapshots (newest first).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db/prisma';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';

export async function GET(request: NextRequest) {
  try {
    await guardAdmin();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200);
    const offset = Number(searchParams.get('offset') || 0);

    const [versions, total] = await Promise.all([
      prisma.safetyPolicyVersion.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.safetyPolicyVersion.count(),
    ]);

    return NextResponse.json({ versions, total });
  } catch (error) {
    return handleApiError(error);
  }
}
