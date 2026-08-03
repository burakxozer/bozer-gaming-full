export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

// Get one saved game (with state) for resuming.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const s = await prisma.gameSession.findUnique({ where: { id: params.id } });
    if (!s || s.userId !== user.id) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

    let state: any = null;
    try { state = s.state ? JSON.parse(s.state) : null; } catch {}

    return NextResponse.json({
      id: s.id, gameName: s.gameName, gameLabel: s.gameLabel, name: s.name, state,
    });
  } catch (error: any) {
    console.error('Session get error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

// Update name and/or state of a saved game.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.gameSession.findUnique({ where: { id: params.id } });
    if (!existing || existing.userId !== user.id) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

    const body = await req.json();
    const data: any = {};
    if (typeof body?.name === 'string' && body.name.trim()) data.name = body.name.trim();
    if (body?.state !== undefined) data.state = body.state == null ? null : JSON.stringify(body.state);

    await prisma.gameSession.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Session patch error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

// Delete a saved game.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.gameSession.findUnique({ where: { id: params.id } });
    if (!existing || existing.userId !== user.id) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

    await prisma.gameSession.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Session delete error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}