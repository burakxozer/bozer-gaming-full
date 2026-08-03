export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import {
  sendEmail,
  resetPasswordTemplate,
  usernameReminderTemplate,
} from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success (security)
    if (!user) {
      return NextResponse.json({ success: true });
    }

    if (type === 'username') {
      await sendEmail({
        to: user.email,
        subject: 'B\u00f6zer Gaming - Kullan\u0131c\u0131 Ad\u0131n',
        html: usernameReminderTemplate(user.username),
        notificationId: process.env.NOTIF_ID_KULLANC_AD_HATRLATMA ?? '',
      });
    } else {
      const token = crypto.randomBytes(32).toString('hex');
      await prisma.emailToken.create({
        data: {
          userId: user.id,
          token,
          type: 'reset',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
      await sendEmail({
        to: user.email,
        subject: 'B\u00f6zer Gaming - \u015eifre S\u0131f\u0131rlama',
        html: resetPasswordTemplate(resetUrl),
        notificationId: process.env.NOTIF_ID_IFRE_SFRLAMA ?? '',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Bir hata olu\u015ftu' }, { status: 500 });
  }
}
