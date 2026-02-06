/**
 * POST /api/admin/users/[id]/role
 * Change user role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/core/auth/guards';
import { prisma } from '@/core/db/prisma';
import { writeAuditLog } from '@/core/logging/audit';
import { RoleEnum } from '@/lib/validators/enums';
import { sendRoleChangeEmail } from '@/services/email';

type Params = Promise<{ id: string }>;

export async function POST(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = await props.params;
    const session = await getSession();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { role } = await request.json();
    
    // Validate role
    try {
      RoleEnum.parse(role);
    } catch {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get user before update to check if role actually changed
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, email: true, name: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    // Log action
    await writeAuditLog({
      action: 'USER_ROLE_CHANGED',
      actorId: session.user.id,
      actorRole: session.user.role as 'USER' | 'MODERATOR' | 'ADMIN',
      targetType: 'USER',
      targetId: id,
      metadata: { oldRole: existingUser.role, newRole: role },
    });

    // Send email notification if role changed
    if (existingUser.role !== role) {
      await sendRoleChangeEmail(
        updatedUser.email,
        updatedUser.name || 'عزيزي المستخدم',
        role as 'USER' | 'MODERATOR' | 'ADMIN'
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('POST /api/admin/users/[id]/role error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
