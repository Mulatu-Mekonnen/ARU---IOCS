"use client";

import { useEffect, useState } from "react";

export default function InboxClient() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/dashboard/viewer/inbox', { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load');
      const data = await r.json();
      setMessages(data.agendas || []);
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function isRead(id) {
    const read = JSON.parse(localStorage.getItem('viewer_read_messages') || '[]');
    return read.includes(id);
  }

  function markRead(id) {
    const read = JSON.parse(localStorage.getItem('viewer_read_messages') || '[]');
    if (!read.includes(id)) {
      localStorage.setItem('viewer_read_messages', JSON.stringify([...read, id]));
      setMessages((m) => m.map(msg => msg.id === id ? { ...msg } : msg));
    }
  }

  function openMessage(msg) {
    setSelected(msg);
    markRead(msg.id);
  }

  function closeModal() { setSelected(null); }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Inbox</h2>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && messages.length === 0 && <div className="text-gray-500">No data available</div>}

      {!loading && messages.length > 0 && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Sender</th>
                <th className="px-4 py-2 text-left">Office</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{m.title}</td>
                  <td className="px-4 py-3">{m.createdBy?.name || 'Unknown'}</td>
                  <td className="px-4 py-3">{m.senderOffice?.name || m.receiverOffice?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${isRead(m.id) ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'}`}>
                      {isRead(m.id) ? 'READ' : 'UNREAD'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openMessage(m)} className="text-blue-600 hover:underline mr-3">View</button>
                    {m.attachmentUrl && (
                      <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="text-gray-700 hover:underline">Download</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={closeModal}>
          <div className="bg-white rounded w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{selected.title}</h3>
              <button onClick={closeModal} className="text-gray-500">Close</button>
            </div>
            <div className="mt-4 text-sm text-gray-700">
              <div className="mb-2">From: {selected.createdBy?.name || 'Unknown'}</div>
              <div className="mb-2">Office: {selected.senderOffice?.name || selected.receiverOffice?.name || '—'}</div>
              <div className="mb-4">Date: {new Date(selected.createdAt).toLocaleString()}</div>
              <div className="prose max-w-none mb-4">{selected.description || 'No description'}</div>
              {selected.attachmentUrl && (
                <div>
                  <a href={selected.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Open attachment</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
