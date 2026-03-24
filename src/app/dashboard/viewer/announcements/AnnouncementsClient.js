"use client";

import { useEffect, useState } from "react";

export default function AnnouncementsClient() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/dashboard/viewer/announcements', { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load');
      const data = await r.json();
      setItems(data.announcements || []);
    } catch (err) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (items.length === 0) return <div className="text-gray-500">No announcements</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Announcements</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {items.map(a => (
          <div key={a.id} className={`p-4 rounded shadow ${a.title.toLowerCase().includes('important') ? 'border-l-4 border-red-500 bg-red-50' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{a.title}</h3>
              <div className="text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</div>
            </div>
            <p className="mt-2 text-sm text-gray-700">{a.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
