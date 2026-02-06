/**
 * POST /api/moderator/content/[id]
 * Moderate content (approve/reject/hide)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/core/auth/guards';
import { prisma } from '@/core/db/prisma';
import { writeAuditLog } from '@/core/logging/audit';
import { ContentStatusEnum } from '@/lib/validators/enums';

type Params = Promise<{ id: string }>;

const statusMap: Record<string, string> = {
  APPROVE: 'PUBLISHED',
  REJECT: 'REJECTED',
  HIDE: 'HIDDEN',
} as const;

export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const session = await getSession();

    if (!session?.user || !['MODERATOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action, reason } = await request.json();
    if (!['APPROVE', 'REJECT', 'HIDE'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = statusMap[action];
    
    // Validate that mapped status is a valid ContentStatus enum
    try {
      ContentStatusEnum.parse(newStatus);
    } catch {
      return NextResponse.json({ error: 'Invalid target status' }, { status: 400 });
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        status: newStatus as 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'HIDDEN' | 'DELETED',
        rejectionReason: action === 'REJECT' ? reason : null,
        moderatedBy: session.user.id,
        moderatedAt: new Date(),
      },
      select: { id: true, status: true },
    });

    // Log action
    await writeAuditLog({
      action: action === 'APPROVE' ? 'CONTENT_CREATED' : action === 'REJECT' ? 'CONTENT_DELETED' : 'CONTENT_HIDDEN',
      actorId: session.user.id,
      actorRole: session.user.role as 'USER' | 'MODERATOR' | 'ADMIN',
      targetType: 'CONTENT',
      targetId: id,
      metadata: { decision: action, reason },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('POST /api/moderator/content/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
