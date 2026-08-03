export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { buildAuthUrl, makeState, googleConfigured } from '@/lib/google-oauth';

// Start the Google OAuth flow.
export async function GET(req: Request) {
  if (!googleConfigured()) {
    const url = new URL('/auth/login?error=google_unconfigured', req.url);
    return NextResponse.redirect(url);
  }
  const state = makeState();
  const authUrl = buildAuthUrl(req, state);
  const res = NextResponse.redirect(authUrl);
  res.cookies.set('g_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return res;
}
