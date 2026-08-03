import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import WatchClient from './watch-client';

export const dynamic = 'force-dynamic';

export default async function WatchPage({ params }: { params: { friendId: string } }) {
  const user = await getSession();
  if (!user) redirect('/auth/login');

  return <WatchClient friendId={params.friendId} theme={user.theme} />;
}