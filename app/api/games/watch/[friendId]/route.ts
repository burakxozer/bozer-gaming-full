export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

// Return the latest live snapshot of a friend's active game (read-only spectating).
export async function GET(_req: Request, { params }: { params: { friendId: string } }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const friendId = params?.friendId;
    if (!friendId) return NextResponse.json({ error: 'friendId required' }, { status: 400 });

    // Verify friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: friendId },
          { user1Id: friendId, user2Id: user.id },
        ],
      },
    });
    if (!friendship) return NextResponse.json({ error: 'Arkadaş değilsiniz' }, { status: 403 });

    const friend = await prisma.user.findUnique({
      where: { id: friendId },
      select: { username: true, lastSeen: true },
    });

    const active = await prisma.activeGame.findUnique({ where: { userId: friendId } });

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    return NextResponse.json({
      username: friend?.username ?? '',
      online: friend?.lastSeen ? new Date(friend.lastSeen) > fiveMinAgo : false,
      active: !!active,
      gameLabel: active?.gameLabel ?? null,
      snapshot: active?.snapshot ?? null,
      updatedAt: active?.updatedAt ?? null,
    });
  } catch (error: any) {
    console.error('Game watch error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}