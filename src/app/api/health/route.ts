/**
 * Health Check Endpoint
 * Used for monitoring and deployment verification
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '0.1.0',
  };

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
