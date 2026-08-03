export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'T\u00fcm alanlar zorunludur' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: '\u015eifre en az 6 karakter olmal\u0131' }, { status: 400 });
    }

    const emailToken = await prisma.emailToken.findUnique({ where: { token } });
    if (!emailToken || emailToken.type !== 'reset' || emailToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Ge\u00e7ersiz veya s\u00fcresi dolmu\u015f link' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: emailToken.userId },
      data: { passwordHash },
    });

    await prisma.emailToken.delete({ where: { id: emailToken.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Bir hata olu\u015ftu' }, { status: 500 });
  }
}
