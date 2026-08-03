export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

// Return the list of friends with the last message + unread count for the inbox.
export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ conversations: [] });

    // All friendships involving me
    const friendships = await prisma.friendship.findMany({
      where: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
    });
    const friendIds = friendships.map((f) =>
      f.user1Id === user.id ? f.user2Id : f.user1Id
    );
    if (friendIds.length === 0) return NextResponse.json({ conversations: [] });

    const friends = await prisma.user.findMany({
      where: { id: { in: friendIds } },
      select: { id: true, username: true, profilePic: true, role: true },
    });

    // Last message per friend + unread counts
    const conversations = await Promise.all(
      friends.map(async (f) => {
        const last = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId: f.id },
              { senderId: f.id, receiverId: user.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: { content: true, createdAt: true, senderId: true },
        });
        const unreadCount = await prisma.message.count({
          where: { senderId: f.id, receiverId: user.id, read: false },
        });
        return {
          id: f.id,
          username: f.username,
          profilePic: f.profilePic,
          role: f.role,
          lastMessage: last?.content ?? null,
          lastMessageAt: last?.createdAt ?? null,
          lastFromMe: last ? last.senderId === user.id : false,
          unreadCount,
        };
      })
    );

    // Sort: unread first, then by most recent message
    conversations.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
      const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return tb - ta;
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Conversations error:', error);
    return NextResponse.json({ conversations: [] });
  }
}
