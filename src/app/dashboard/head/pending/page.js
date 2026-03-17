import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import HeadPendingClient from './HeadPendingClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'HEAD') {
    redirect('/login');
  }

  return <HeadPendingClient user={user} />;
}
