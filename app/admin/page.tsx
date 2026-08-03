import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminClient from './admin-client';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect('/auth/login');
  if ((user as any).role !== 'admin') redirect('/');

  let profilePicUrl = null;
  if (user.profilePic && !user.profilePic.startsWith('avatar_')) {
    try {
      profilePicUrl = await getFileUrl(user.profilePic, 'image/jpeg', user.profilePicPublic);
    } catch {}
  }

  return (
    <AdminClient
      user={{
        id: user.id,
        username: user.username,
        profilePic: user.profilePic,
        profilePicPublic: user.profilePicPublic,
        profilePicUrl,
        theme: user.theme,
        role: (user as any).role ?? 'user',
      }}
    />
  );
}
