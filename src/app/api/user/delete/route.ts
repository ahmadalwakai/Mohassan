/**
 * Delete User Account API
 * DELETE /api/user/delete - Delete current user account
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Delete user and all related data (cascade delete)
    // The order matters due to foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete user's content
      await tx.content.deleteMany({
        where: { authorId: userId },
      });
      
      // Delete user's reports (as reporter)
      await tx.report.deleteMany({
        where: { reporterId: userId },
      });
      
      // Delete user's moderation actions (as moderator)
      await tx.moderationAction.deleteMany({
        where: { moderatorId: userId },
      });
      
      // Delete moderation actions targeting the user
      await tx.moderationAction.deleteMany({
        where: { targetUserId: userId },
      });
      
      // Delete user's sessions
      await tx.session.deleteMany({
        where: { userId },
      });
      
      // Delete user's accounts (OAuth)
      await tx.account.deleteMany({
        where: { userId },
      });
      
      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الحساب' },
      { status: 500 }
    );
  }
}
