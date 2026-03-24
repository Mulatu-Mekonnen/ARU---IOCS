"use client";

import { useEffect, useState } from "react";

export default function ArchiveClient() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const r = await fetch(`/api/dashboard/viewer/archive${q}`, { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load');
      const data = await r.json();
      setItems(data.agendas || []);
    } catch (err) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [search]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Archive</h2>
      <div className="mb-4 flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="border px-3 py-2 rounded w-full" placeholder="Search title or description" />
        <button onClick={() => setSearch('')} className="px-4 py-2 bg-gray-100 rounded">Clear</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && items.length === 0 && <div className="text-gray-500">No archived items</div>}

      {!loading && items.length > 0 && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Sender</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2">Attachment</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(i => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{i.title}</td>
                  <td className="px-4 py-3">{i.createdBy?.name || 'Unknown'}</td>
                  <td className="px-4 py-3">{new Date(i.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{i.attachmentUrl ? <a href={i.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-600">Download</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
