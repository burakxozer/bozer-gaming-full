export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.gameStat.deleteMany({ where: { userId: user.id } });
    await prisma.activeGame.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Clear history error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
