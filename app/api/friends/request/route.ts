export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: 'Kullan\u0131c\u0131 ad\u0131 gerekli' }, { status: 400 });

    const target = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!target) return NextResponse.json({ error: 'Kullan\u0131c\u0131 bulunamad\u0131' }, { status: 404 });
    if (target.id === user.id) return NextResponse.json({ error: 'Kendinize istek g\u00f6nderemezsiniz' }, { status: 400 });

    // Check existing friendship
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: target.id },
          { user1Id: target.id, user2Id: user.id },
        ],
      },
    });
    if (existingFriendship) return NextResponse.json({ error: 'Zaten arkada\u015fs\u0131n\u0131z' }, { status: 400 });

    // Check existing request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: target.id, status: 'pending' },
          { senderId: target.id, receiverId: user.id, status: 'pending' },
        ],
      },
    });
    if (existingRequest) return NextResponse.json({ error: 'Bekleyen istek zaten var' }, { status: 400 });

    await prisma.friendRequest.create({
      data: { senderId: user.id, receiverId: target.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Friend request error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
