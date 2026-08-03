export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

// List the current user's saved (named) games.
export async function GET(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const gameName = searchParams.get('gameName');

    const sessions = await prisma.gameSession.findMany({
      where: { userId: user.id, ...(gameName ? { gameName } : {}) },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, gameName: true, gameLabel: true, name: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Sessions list error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

// Create a new named saved game.
export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const gameName: string = body?.gameName;
    const gameLabel: string = body?.gameLabel ?? gameName;
    const name: string = (body?.name ?? '').toString().trim();
    const state = body?.state;

    if (!gameName || !name) return NextResponse.json({ error: 'gameName ve name gerekli' }, { status: 400 });

    const created = await prisma.gameSession.create({
      data: {
        userId: user.id,
        gameName,
        gameLabel,
        name,
        state: state != null ? JSON.stringify(state) : null,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: created.id });
  } catch (error: any) {
    console.error('Session create error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}