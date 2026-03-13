"use client";

import { useEffect, useState } from "react";

export default function ViewerDashboardClient() {
  const [agendas, setAgendas] = useState([]);
  const [officeFilter, setOfficeFilter] = useState("");
  const [offices, setOffices] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadAgendas();
  }, [officeFilter, page]);

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
    params.set("status", "APPROVED");
    if (officeFilter) params.set("officeId", officeFilter);
    params.set("page", page);
    params.set("pageSize", 20);
    const res = await fetch(`/api/admin/agendas?${params.toString()}`);
    const data = await res.json();
    setAgendas(data.agendas);
    setTotal(data.total);
  }

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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Viewer Dashboard</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <select
          onChange={(e) => {
            setOfficeFilter(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="">All Offices</option>
          {offices.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      <table className="w-full border rounded-lg bg-arsiLight shadow">
        <thead className="bg-arsiLight text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Title</th>
            <th className="p-3">Sender</th>
            <th className="p-3">Receiver</th>
            <th className="p-3">Created By</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created At</th>
            <th className="p-3">Attachment</th>
          </tr>
        </thead>
        <tbody>
          {agendas.map((agenda) => (
            <tr key={agenda.id} className="border-t">
              <td className="p-3 text-sm">{agenda.id}</td>
              <td className="p-3">{agenda.title}</td>
              <td className="p-3">{agenda.senderOffice?.name || "-"}</td>
              <td className="p-3">{agenda.receiverOffice?.name || "-"}</td>
              <td className="p-3">{agenda.createdBy?.name}</td>
              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${statusBadge(
                    agenda.status
                  )}`}
                >
                  {agenda.status}
                </span>
              </td>
              <td className="p-3">{new Date(agenda.createdAt).toLocaleDateString()}</td>
              <td className="p-3">
                {agenda.attachment ? (
                  <a href={agenda.attachment} className="text-arsiBlue underline" target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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