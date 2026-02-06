/**
 * AI Tag Endpoint - Placeholder
 * Will be implemented in Step 3
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'AI Tag not implemented yet. See Step 3.' },
    { status: 501 }
  );
}
