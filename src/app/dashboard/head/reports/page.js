import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import HeadReportsClient from './HeadReportsClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'HEAD') {
    redirect('/login');
  }
  return <HeadReportsClient user={user} />;
}
