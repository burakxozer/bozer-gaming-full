import { getSession } from '@/lib/session';
import HomeClient from './components/home-client';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getSession();
  let userData = null;

  if (user) {
    let profilePicUrl = null;
    if (user.profilePic && !user.profilePic.startsWith('avatar_')) {
      try {
        profilePicUrl = await getFileUrl(user.profilePic, 'image/jpeg', user.profilePicPublic);
      } catch {}
    }
    userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      profilePicPublic: user.profilePicPublic,
      profilePicUrl,
      theme: user.theme,
      role: (user as any).role ?? 'user',
    };
  }

  return <HomeClient user={userData} />;
}
