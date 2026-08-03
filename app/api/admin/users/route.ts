export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { getFileUrl } from '@/lib/s3';

// Admin-only: list all members (never expose password hashes).
export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((user as any).role !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, username: true, email: true, profilePic: true, profilePicPublic: true,
        role: true, emailVerified: true, createdAt: true, lastSeen: true,
        activeGame: { select: { gameName: true, gameLabel: true, startedAt: true } },
      },
    });

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = await Promise.all(users.map(async (u) => {
      let profilePicUrl: string | null = null;
      if (u.profilePic && !u.profilePic.startsWith('avatar_')) {
        try { profilePicUrl = await getFileUrl(u.profilePic, 'image/jpeg', u.profilePicPublic); } catch {}
      }
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        profilePic: u.profilePic,
        profilePicUrl,
        role: u.role,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        lastSeen: u.lastSeen,
        activeGame: u.activeGame ?? null,
        online: u.lastSeen ? new Date(u.lastSeen) > fiveMinAgo : false,
      };
    }));

    return NextResponse.json({ users: result });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}