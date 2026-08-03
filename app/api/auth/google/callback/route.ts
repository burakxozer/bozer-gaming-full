export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/session';
import { exchangeCode, getUserInfo, makePendingToken, getOrigin } from '@/lib/google-oauth';

// Handle the Google OAuth redirect: log in existing users, or send new users
// to the username-selection step.
export async function GET(req: Request) {
  const origin = getOrigin(req);
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const err = url.searchParams.get('error');
    if (err || !code) {
      return NextResponse.redirect(`${origin}/auth/login?error=google_failed`);
    }

    const stateCookie = cookies().get('g_state')?.value;
    if (!state || !stateCookie || state !== stateCookie) {
      return NextResponse.redirect(`${origin}/auth/login?error=google_state`);
    }

    const tokenData = await exchangeCode(req, code);
    const info = await getUserInfo(tokenData.access_token);
    const email = (info.email || '').toLowerCase();
    if (!email) {
      return NextResponse.redirect(`${origin}/auth/login?error=google_noemail`);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Existing account (email-password or previous Google) → just log in.
      await createSession(existing.id, true);
      const res = NextResponse.redirect(`${origin}/`);
      res.cookies.set('g_state', '', { maxAge: 0, path: '/' });
      return res;
    }

    // New user → store email in a signed cookie and ask them to pick a username.
    const pending = makePendingToken({ email, picture: info.picture });
    const res = NextResponse.redirect(`${origin}/auth/google-username`);
    res.cookies.set('g_state', '', { maxAge: 0, path: '/' });
    res.cookies.set('g_pending', pending, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 900,
    });
    return res;
  } catch (e: any) {
    console.error('Google callback error:', e?.message || e);
    return NextResponse.redirect(`${origin}/auth/login?error=google_failed`);
  }
}
