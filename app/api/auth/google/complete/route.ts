export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createSession } from '@/lib/session';
import { readPendingToken } from '@/lib/google-oauth';

// Finish Google signup: create the account with the chosen username.
export async function POST(req: Request) {
  try {
    const pendingCookie = cookies().get('g_pending')?.value;
    const pending = pendingCookie ? readPendingToken(pendingCookie) : null;
    if (!pending) {
      return NextResponse.json({ error: 'Oturum süresi doldu, lütfen tekrar deneyin' }, { status: 400 });
    }

    const body = await req.json();
    let username: string = (body?.username ?? '').toString().trim().toLowerCase();
    if (!username || username.length < 3) {
      return NextResponse.json({ error: 'Kullanıcı adı en az 3 karakter olmalı' }, { status: 400 });
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir' }, { status: 400 });
    }

    const taken = await prisma.user.findUnique({ where: { username } });
    if (taken) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış' }, { status: 400 });
    }

    // Random password hash (Google users log in via Google; can set a password later).
    const randomPass = crypto.randomBytes(24).toString('hex');
    const passwordHash = await bcrypt.hash(randomPass, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email: pending.email,
        passwordHash,
        emailVerified: true,
      },
    });

    await createSession(user.id, true);
    const res = NextResponse.json({ success: true });
    res.cookies.set('g_pending', '', { maxAge: 0, path: '/' });
    return res;
  } catch (e: any) {
    console.error('Google complete error:', e?.message || e);
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
  }
}

// Provide the pending email (for display on the username page).
export async function GET() {
  const pendingCookie = cookies().get('g_pending')?.value;
  const pending = pendingCookie ? readPendingToken(pendingCookie) : null;
  if (!pending) return NextResponse.json({ pending: false });
  return NextResponse.json({ pending: true, email: pending.email });
}
