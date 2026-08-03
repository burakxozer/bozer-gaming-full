import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ProfileClient from './profile-client';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect('/auth/login');

  let profilePicUrl = null;
  if (user.profilePic && !user.profilePic.startsWith('avatar_')) {
    try {
      profilePicUrl = await getFileUrl(user.profilePic, 'image/jpeg', user.profilePicPublic);
    } catch {}
  }

  return (
    <ProfileClient
      user={{
        id: user.id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        profilePicPublic: user.profilePicPublic,
        profilePicUrl,
        theme: user.theme,
        role: (user as any).role ?? 'user',
      }}
    />
  );
}
