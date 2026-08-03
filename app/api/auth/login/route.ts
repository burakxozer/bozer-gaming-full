export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { identifier, password, rememberMe = true } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'T\u00fcm alanlar zorunludur' }, { status: 400 });
    }

    const lowerIdentifier = identifier.toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: lowerIdentifier },
          { email: lowerIdentifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullan\u0131c\u0131 bulunamad\u0131' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Ge\u00e7ersiz \u015fifre' }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'E-postan\u0131 do\u011frula, ard\u0131ndan giri\u015f yapabilirsin' },
        { status: 403 }
      );
    }

    await createSession(user.id, rememberMe);

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Bir hata olu\u015ftu' }, { status: 500 });
  }
}
