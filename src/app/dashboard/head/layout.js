import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import HeadSidebar from './HeadSidebar';

export default async function Layout({ children }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'HEAD') {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <HeadSidebar user={user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}