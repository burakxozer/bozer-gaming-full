export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

async function areFriends(a: string, b: string) {
  const f = await prisma.friendship.findFirst({
    where: {
      OR: [
        { user1Id: a, user2Id: b },
        { user1Id: b, user2Id: a },
      ],
    },
  });
  return !!f;
}

// Get conversation with a friend and mark their messages as read.
export async function GET(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const friendId = searchParams.get('friendId');
    if (!friendId) return NextResponse.json({ error: 'friendId required' }, { status: 400 });

    if (!(await areFriends(user.id, friendId))) {
      return NextResponse.json({ error: 'Arkadaş değilsiniz' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: friendId },
          { senderId: friendId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
      select: { id: true, senderId: true, receiverId: true, content: true, read: true, createdAt: true },
    });

    // Mark friend's messages to me as read
    await prisma.message.updateMany({
      where: { senderId: friendId, receiverId: user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Messages get error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

// Clear the whole conversation with a friend (deletes messages both ways).
export async function DELETE(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const friendId = searchParams.get('friendId');
    if (!friendId) return NextResponse.json({ error: 'friendId required' }, { status: 400 });

    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: friendId },
          { senderId: friendId, receiverId: user.id },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Messages delete error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

// Send a message to a friend.
export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const receiverId: string = body?.receiverId;
    const content: string = (body?.content ?? '').toString().trim();
    if (!receiverId || !content) return NextResponse.json({ error: 'receiverId ve content gerekli' }, { status: 400 });
    if (content.length > 2000) return NextResponse.json({ error: 'Mesaj çok uzun' }, { status: 400 });

    if (!(await areFriends(user.id, receiverId))) {
      return NextResponse.json({ error: 'Arkadaş değilsiniz' }, { status: 403 });
    }

    const msg = await prisma.message.create({
      data: { senderId: user.id, receiverId, content },
      select: { id: true, senderId: true, receiverId: true, content: true, read: true, createdAt: true },
    });

    return NextResponse.json({ success: true, message: msg });
  } catch (error: any) {
    console.error('Messages post error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}