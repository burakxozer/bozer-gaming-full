export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

// Return unread incoming messages (for notification toaster + badge).
export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ unread: [], count: 0 });

    const unread = await prisma.message.findMany({
      where: { receiverId: user.id, read: false },
      orderBy: { createdAt: 'asc' },
      take: 50,
      select: { id: true, senderId: true, content: true, createdAt: true },
    });

    const senderIds = Array.from(new Set(unread.map((m) => m.senderId)));
    const senders = senderIds.length
      ? await prisma.user.findMany({
          where: { id: { in: senderIds } },
          select: { id: true, username: true },
        })
      : [];
    const nameMap: Record<string, string> = {};
    senders.forEach((s) => { nameMap[s.id] = s.username; });

    const items = unread.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderUsername: nameMap[m.senderId] ?? 'Arkadaş',
      content: m.content,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ unread: items, count: items.length });
  } catch (error: any) {
    console.error('Unread messages error:', error);
    return NextResponse.json({ unread: [], count: 0 });
  }
}