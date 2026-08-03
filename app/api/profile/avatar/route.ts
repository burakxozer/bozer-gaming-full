export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { generatePresignedUploadUrl } from '@/lib/s3';

export async function PUT(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, value, fileName, contentType } = await req.json();

    if (type === 'preset') {
      await prisma.user.update({
        where: { id: user.id },
        data: { profilePic: value, profilePicPublic: false },
      });
      return NextResponse.json({ success: true });
    }

    if (type === 'upload') {
      const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
        fileName ?? 'avatar.jpg',
        contentType ?? 'image/jpeg',
        true
      );

      return NextResponse.json({ uploadUrl, cloud_storage_path });
    }

    if (type === 'confirm-upload') {
      await prisma.user.update({
        where: { id: user.id },
        data: { profilePic: value, profilePicPublic: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Avatar error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
