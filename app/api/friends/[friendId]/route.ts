export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: { friendId: string } }
) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { user1Id: user.id, user2Id: params?.friendId },
          { user1Id: params?.friendId, user2Id: user.id },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Remove friend error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
