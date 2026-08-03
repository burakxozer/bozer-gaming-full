export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

// Admin-only: delete a member (cascades sessions, stats, messages, etc.).
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((user as any).role !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

    const target = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, role: true } });
    if (!target) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    if (target.id === user.id) return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 });
    if (target.role === 'admin') return NextResponse.json({ error: 'Yönetici silinemez' }, { status: 400 });

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
