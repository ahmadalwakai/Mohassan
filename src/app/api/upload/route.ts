import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Rate limiting
const uploadRateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkUploadRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = uploadRateLimitStore.get(userId);
  const limit = 50; // 50 uploads per hour
  const windowMs = 60 * 60 * 1000;
  
  if (!record || now > record.resetTime) {
    uploadRateLimitStore.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * POST /api/upload
 * Upload files (images/documents)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check email verification
    if (!session.user.emailVerified) {
      return NextResponse.json(
        { error: 'يجب تأكيد البريد الإلكتروني' },
        { status: 403 }
      );
    }

    // Rate limiting
    if (!checkUploadRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد المسموح للرفع' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string || 'image';

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم تقديم ملف' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'حجم الملف يتجاوز 5 ميغابايت' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = type === 'document' 
      ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]
      : ALLOWED_IMAGE_TYPES;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const sanitizedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'].includes(ext) ? ext : 'jpg';
    const filename = `${randomUUID()}.${sanitizedExt}`;
    
    // Determine upload directory based on type
    const uploadDir = type === 'document' ? 'documents' : 'images';
    const dateFolder = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const relativePath = `uploads/${uploadDir}/${dateFolder}`;
    const absolutePath = join(process.cwd(), 'public', relativePath);
    
    // Ensure directory exists
    await mkdir(absolutePath, { recursive: true });
    
    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(join(absolutePath, filename), buffer);
    
    // Return public URL
    const url = `/${relativePath}/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع الملف' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Delete an uploaded file
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url || !url.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'رابط الملف غير صالح' },
        { status: 400 }
      );
    }

    // For now, we'll just return success
    // In production, verify ownership and actually delete the file
    // const filePath = join(process.cwd(), 'public', url);
    // await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete upload error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الملف' },
      { status: 500 }
    );
  }
}
