/**
 * Resend Webhook Endpoint - Placeholder
 * Handles email delivery status webhooks
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'Resend webhook not implemented yet.' },
    { status: 501 }
  );
}
