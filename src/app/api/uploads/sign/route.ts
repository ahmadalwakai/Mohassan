/**
 * Upload Sign Endpoint - Placeholder
 * Will generate signed URLs for Vercel Blob uploads
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'Upload signing not implemented yet.' },
    { status: 501 }
  );
}
