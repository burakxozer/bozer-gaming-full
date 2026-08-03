export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Ge\u00e7ersiz token' }, { status: 400 });
    }

    const emailToken = await prisma.emailToken.findUnique({ where: { token } });
    if (!emailToken || emailToken.type !== 'verify' || emailToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Ge\u00e7ersiz veya s\u00fcresi dolmu\u015f link' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: emailToken.userId },
      data: { emailVerified: true },
    });

    await prisma.emailToken.delete({ where: { id: emailToken.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Bir hata olu\u015ftu' }, { status: 500 });
  }
}
