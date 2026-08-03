export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// Redirect to actual register endpoint
export async function POST(req: Request) {
  const body = await req.json();
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
