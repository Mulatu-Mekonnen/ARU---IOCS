"use client";

import { useEffect, useState } from "react";

export default function StaffDashboardClient() {
  const [agendas, setAgendas] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [receiverOffice, setReceiverOffice] = useState("");
  const [offices, setOffices] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadAgendas();
  }, [page]);

  useEffect(() => {
    fetch("/api/admin/offices")
      .then((r) => {
        if (r.ok) return r.json();
        else throw new Error('Failed to fetch offices');
      })
      .then(setOffices)
      .catch(() => setOffices([]));
  }, []);

  async function loadAgendas() {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("pageSize", 20);
    const res = await fetch(`/api/admin/agendas?${params.toString()}`);
    const data = await res.json();
    setAgendas(data.agendas);
    setTotal(data.total);
  }

  const createAgenda = async (e) => {
    e.preventDefault();
    await fetch("/api/admin/agendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, receiverOfficeId: receiverOffice }),
    });
    setTitle("");
    setDescription("");
    setReceiverOffice("");
    loadAgendas();
  };

  function statusBadge(status) {
    const map = {
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      FORWARDED: "bg-blue-100 text-blue-700",
      ARCHIVED: "bg-gray-200 text-gray-700",
    };
    return map[status] || map.PENDING;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff Dashboard</h1>
      <div>
        <h2 className="text-xl font-semibold mb-3">New Agenda</h2>
        <form onSubmit={createAgenda} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="border px-3 py-2 rounded w-full"
            required
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="border px-3 py-2 rounded w-full"
          />
          <select
            value={receiverOffice}
            onChange={(e) => setReceiverOffice(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          >
            <option value="">Choose office</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-arsiBlue text-white rounded col-span-full md:col-auto"
          >
            Submit
          </button>
        </form>
      </div>

      <div className="bg-arsiLight rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-arsiLight text-gray-600 text-sm">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Receiver</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created At</th>
            </tr>
          </thead>
          <tbody>
            {agendas.map((agenda) => (
              <tr key={agenda.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{agenda.title}</td>
                <td className="p-4">{agenda.receiverOffice?.name || "-"}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${statusBadge(
                      agenda.status
                    )}`}
                  >
                    {agenda.status}
                  </span>
                </td>
                <td className="p-4">{new Date(agenda.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > agendas.length && (
        <div className="mt-4 flex justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            disabled={page * 20 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}