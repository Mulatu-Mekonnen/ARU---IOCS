import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import ViewerDashboardClient from './ViewerDashboardClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'VIEWER') {
    redirect('/login');
  }
  return <ViewerDashboardClient />;
}