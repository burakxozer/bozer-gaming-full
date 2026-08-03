import { getSession } from '@/lib/session';
import StatsClient from './stats-client';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const user = await getSession();

  if (!user) {
    return <StatsClient user={null} />;
  }

  let profilePicUrl = null;
  if (user.profilePic && !user.profilePic.startsWith('avatar_')) {
    try {
      profilePicUrl = await getFileUrl(user.profilePic, 'image/jpeg', user.profilePicPublic);
    } catch {}
  }

  return (
    <StatsClient
      user={{
        id: user.id,
        username: user.username,
        profilePic: user.profilePic,
        profilePicPublic: user.profilePicPublic,
        profilePicUrl,
        theme: user.theme,
      }}
    />
  );
}
