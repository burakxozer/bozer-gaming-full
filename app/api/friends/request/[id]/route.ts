export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action } = await req.json();
    const requestId = params?.id;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest || friendRequest.receiverId !== user.id) {
      return NextResponse.json({ error: 'Istek bulunamad\u0131' }, { status: 404 });
    }

    if (action === 'accept') {
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'accepted' },
      });

      // Create friendship
      const [id1, id2] = [friendRequest.senderId, friendRequest.receiverId].sort();
      await prisma.friendship.upsert({
        where: { user1Id_user2Id: { user1Id: id1, user2Id: id2 } },
        create: { user1Id: id1, user2Id: id2 },
        update: {},
      });
    } else {
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Friend request action error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
