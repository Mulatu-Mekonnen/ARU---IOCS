import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import HeadArchiveClient from './HeadArchiveClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'HEAD') {
    redirect('/login');
  }
  return <HeadArchiveClient user={user} />;
}
