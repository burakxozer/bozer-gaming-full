export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: user.id, status: 'pending' },
      include: {
        sender: { select: { id: true, username: true, profilePic: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
