export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

// Save a live snapshot + serialized state of the current user's active game (for spectating).
export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const snapshot: string | undefined = body?.snapshot;
    const state = body?.state;
    const gameName: string | undefined = body?.gameName;
    const gameLabel: string | undefined = body?.gameLabel;

    const data: any = { updatedAt: new Date() };
    if (typeof snapshot === 'string') data.snapshot = snapshot;
    if (state !== undefined) data.state = state == null ? null : JSON.stringify(state);

    await prisma.activeGame.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        gameName: gameName ?? 'oyun',
        gameLabel: gameLabel ?? gameName ?? 'Oyun',
        snapshot: typeof snapshot === 'string' ? snapshot : null,
        state: state !== undefined && state != null ? JSON.stringify(state) : null,
      },
      update: data,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Game sync error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}