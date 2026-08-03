export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      theme: user.theme,
      role: (user as any).role ?? 'user',
    },
  });
}
