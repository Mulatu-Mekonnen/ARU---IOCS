import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import HeadDetailClient from './HeadDetailClient';

export default async function Page({ params }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'HEAD') {
    redirect('/login');
  }
  return <HeadDetailClient user={user} agendaId={params.id} />;
}