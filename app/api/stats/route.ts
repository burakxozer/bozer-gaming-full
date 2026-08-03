export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const stats = await prisma.gameStat.findMany({
      where: { userId: user.id },
      orderBy: { lastPlayed: 'desc' },
    });

    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
