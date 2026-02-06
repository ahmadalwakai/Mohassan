/**
 * User Profile API
 * GET /api/user/profile - Get current user profile
 * PUT /api/user/profile - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get user profile
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        phone: true,
        location: true,
        role: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الملف الشخصي' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, bio, phone, location } = body;
    
    // Validate name
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: 'الاسم غير صالح' },
          { status: 400 }
        );
      }
      
      if (name.length > 100) {
        return NextResponse.json(
          { error: 'الاسم يجب أن يكون أقل من 100 حرف' },
          { status: 400 }
        );
      }
    }
    
    // Validate bio
    if (bio !== undefined && typeof bio !== 'string') {
      return NextResponse.json(
        { error: 'النبذة غير صالحة' },
        { status: 400 }
      );
    }
    
    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'النبذة يجب أن تكون أقل من 500 حرف' },
        { status: 400 }
      );
    }
    
    // Validate phone
    if (phone !== undefined && typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'رقم الهاتف غير صالح' },
        { status: 400 }
      );
    }
    
    // Validate location
    if (location !== undefined && typeof location !== 'string') {
      return NextResponse.json(
        { error: 'الموقع غير صالح' },
        { status: 400 }
      );
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        phone: true,
        location: true,
        role: true,
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الملف الشخصي' },
      { status: 500 }
    );
  }
}
