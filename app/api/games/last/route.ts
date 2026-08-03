export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ gameName: null });

    const lastStat = await prisma.gameStat.findFirst({
      where: { userId: user.id },
      orderBy: { lastPlayed: 'desc' },
    });

    if (!lastStat) return NextResponse.json({ gameName: null });

    return NextResponse.json({
      gameName: lastStat.gameName,
      gameLabel: lastStat.gameName,
    });
  } catch {
    return NextResponse.json({ gameName: null });
  }
}
