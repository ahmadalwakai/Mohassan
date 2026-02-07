/**
 * POST /api/admin/safety/simulate
 * Safety Policy Simulator — dry-run safety checks with NO DB writes.
 *
 * Body: { title: string, body: string }
 * Returns: { verdict, matches, actions }
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin, handleApiError } from '@/core/auth/api-guard';
import { safetyService } from '@/core/services/safety.service';

export async function POST(request: NextRequest) {
  try {
    await guardAdmin();

    const { title, body } = (await request.json()) as {
      title?: string;
      body?: string;
    };

    if (!title?.trim() && !body?.trim()) {
      return NextResponse.json(
        { error: 'يجب تقديم عنوان أو محتوى للمحاكاة' },
        { status: 400 }
      );
    }

    const result = await safetyService.simulate(title || '', body || '');

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
