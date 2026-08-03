export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Change the current user's password.
export async function PUT(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const currentPassword: string = body?.currentPassword ?? '';
    const newPassword: string = body?.newPassword ?? '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Tüm alanlar gerekli' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalı' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });

    const ok = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Mevcut şifre yanlış' }, { status: 400 });

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}