export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

// Admin-only: view a member's stats (game play counts + saved-game counts).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((user as any).role !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, username: true, email: true, role: true, createdAt: true, lastSeen: true },
    });
    if (!target) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });

    const stats = await prisma.gameStat.findMany({
      where: { userId: params.id },
      orderBy: { lastPlayed: 'desc' },
      select: { id: true, gameName: true, playCount: true, lastPlayed: true },
    });

    const savedCount = await prisma.gameSession.count({ where: { userId: params.id } });
    const totalPlays = stats.reduce((s, g) => s + (g.playCount ?? 0), 0);

    return NextResponse.json({ user: target, stats, savedCount, totalPlays });
  } catch (error: any) {
    console.error('Admin user stats error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
