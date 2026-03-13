import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function fetchStats() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/users', {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function StatCard({ title, value }) {
  return (
    <div className="bg-arsiLight rounded-lg shadow p-6 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-600">{title}</div>
    </div>
  );
}

export default async function Home() {
  const user = await getSessionUser();

  if (user) {
    if (user.role === 'ADMIN') {
      redirect('/dashboard/admin');
    } else if (user.role === 'HEAD') {
      redirect('/dashboard/head');
    } else if (user.role === 'VIEWER') {
      redirect('/dashboard/viewer');
    } else {
      redirect('/dashboard/staff');
    }
  }

  const stats = await fetchStats();

  return (
    <div className="min-h-screen bg-arsiBlue flex items-center justify-center p-8">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block bg-white/20 px-6 py-2 rounded-full text-arsiDark text-sm font-semibold border border-white/30">
            🏢 INTER-OFFICE AGENDA SYSTEM
          </div>
        </div>

        {/* Card */}
        <div className="bg-arsiLight rounded-3xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {/* Left */}
          <div className="bg-arsiBlue p-12 text-white space-y-6">
            <h1 className="text-4xl font-extrabold leading-tight text-white">
              Streamline Your <br />
              <span className="text-arsiGold">Office Communications</span>
            </h1>
            <p className="text-lg">
              The complete solution for managing inter-office agendas, meetings, and
              department coordination.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold">250+</div>
                <div>Active Offices</div>
              </div>
              <div>
                <div className="text-3xl font-bold">10k+</div>
                <div>Daily Users</div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="p-12 text-arsiDark">
            <h2 className="text-3xl font-bold mb-4 text-arsiDark">Welcome Back 👋</h2>
            <p className="text-arsiDark mb-8">
              Secure agenda management for modern offices
            </p>

            <Link
              href="/login"
              className="block w-full py-4 bg-arsiBlue text-white text-center rounded-xl font-semibold hover:bg-arsiDark transition"
            >
              Access Dashboard <span className="text-arsiGold">→</span>
            </Link>

            <div className="mt-6 bg-gray-100 rounded-lg p-4 text-center">
              <p className="font-medium mb-1">Contact your administrator</p>
              <p className="text-sm text-gray-600">
                to set up your account credentials
              </p>
            </div>
          </div>
        </div>

        {/* Stats (interactive) */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <StatCard title="Total Users" value={stats.totalUsers || 0} />
            <StatCard title="Total Agendas" value={stats.totalAgendas || 0} />
            <StatCard title="Pending Approvals" value={stats.pendingAgendas || 0} />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-arsiDark text-sm">
          © 2026 IO Agenda System. All rights reserved.
        </div>
      </div>
    </div>
  );
}