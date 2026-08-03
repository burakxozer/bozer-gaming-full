export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id },
        ],
      },
      include: {
        user1: { select: { id: true, username: true, profilePic: true, lastSeen: true, profilePicPublic: true, role: true } },
        user2: { select: { id: true, username: true, profilePic: true, lastSeen: true, profilePicPublic: true, role: true } },
      },
    });

    // Get active games for friends
    const friendIds = friendships.map((f: any) =>
      f?.user1Id === user.id ? f?.user2Id : f?.user1Id
    );

    const activeGames = await prisma.activeGame.findMany({
      where: { userId: { in: friendIds } },
    });

    const activeGameMap: Record<string, any> = {};
    (activeGames ?? []).forEach((ag: any) => {
      activeGameMap[ag?.userId] = { gameName: ag?.gameName, gameLabel: ag?.gameLabel };
    });

    const friends = friendships.map((f: any) => {
      const friend = f?.user1Id === user.id ? f?.user2 : f?.user1;
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      return {
        friendshipId: f?.id,
        id: friend?.id,
        username: friend?.username,
        profilePic: friend?.profilePic,
        profilePicPublic: friend?.profilePicPublic ?? false,
        role: friend?.role ?? 'user',
        online: friend?.lastSeen ? new Date(friend.lastSeen) > fiveMinAgo : false,
        activeGame: activeGameMap[friend?.id ?? ''] ?? null,
      };
    });

    return NextResponse.json({ friends });
  } catch (error: any) {
    console.error('Friends error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
