export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, verifyEmailTemplate } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'T\u00fcm alanlar zorunludur' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: 'Kullan\u0131c\u0131 ad\u0131 sadece \u0130ngilizce harf, rakam ve _ i\u00e7erebilir (3-20 karakter)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '\u015eifre en az 6 karakter olmal\u0131' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() },
        ],
      },
    });

    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return NextResponse.json({ error: 'Bu e-posta zaten kullan\u0131l\u0131yor' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Bu kullan\u0131c\u0131 ad\u0131 zaten al\u0131nm\u0131\u015f' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.emailToken.create({
      data: {
        userId: user.id,
        token,
        type: 'verify',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;
    await sendEmail({
      to: email.toLowerCase(),
      subject: 'B\u00f6zer Gaming - Hesab\u0131n\u0131 Do\u011frula',
      html: verifyEmailTemplate(username, verifyUrl),
      notificationId: process.env.NOTIF_ID_EPOSTA_DORULAMA ?? '',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Bir hata olu\u015ftu' }, { status: 500 });
  }
}
