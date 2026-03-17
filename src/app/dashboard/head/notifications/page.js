import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import HeadNotificationsClient from './HeadNotificationsClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'HEAD') {
    redirect('/login');
  }
  return <HeadNotificationsClient user={user} />;
}