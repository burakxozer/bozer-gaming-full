export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { gameName, gameLabel } = await req.json();
    if (!gameName) return NextResponse.json({ error: 'gameName required' }, { status: 400 });

    // Upsert active game
    await prisma.activeGame.upsert({
      where: { userId: user.id },
      create: { userId: user.id, gameName, gameLabel: gameLabel ?? gameName },
      update: { gameName, gameLabel: gameLabel ?? gameName, startedAt: new Date() },
    });

    // Update game stats
    await prisma.gameStat.upsert({
      where: { userId_gameName: { userId: user.id, gameName } },
      create: { userId: user.id, gameName, playCount: 1 },
      update: { playCount: { increment: 1 }, lastPlayed: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Game start error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
