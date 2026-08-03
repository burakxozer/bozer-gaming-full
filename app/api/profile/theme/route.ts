export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function PUT(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { theme } = await req.json();
    if (!theme) return NextResponse.json({ error: 'Theme required' }, { status: 400 });

    await prisma.user.update({
      where: { id: user.id },
      data: { theme },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
