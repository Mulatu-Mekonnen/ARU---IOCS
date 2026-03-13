"use client";

import { useEffect, useState } from "react";

export default function HeadDashboardClient() {
  const [agendas, setAgendas] = useState([]);
  const [offices, setOffices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadAgendas();
  }, [statusFilter, page]);

  useEffect(() => {
    fetch("/api/admin/offices")
      .then((r) => r.json())
      .then(setOffices)
      .catch(console.error);

    // load staff in office for head
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((u) => setStaff(u))
      .catch(console.error);
  }, []);

  async function loadAgendas() {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page);
    params.set("pageSize", 20);
    const res = await fetch(`/api/admin/agendas?${params.toString()}`);
    const data = await res.json();
    setAgendas(data.agendas);
    setTotal(data.total);
  }

  async function performAction(id, action, extra = {}) {
    const body = { action, ...extra };
    await fetch(`/api/admin/agendas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    loadAgendas();
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
      <h1 className="text-2xl font-semibold mb-6">Head Dashboard</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="FORWARDED">Forwarded</option>
          <option value="ARCHIVED">Archived</option>
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
            <th className="p-3">Actions</th>
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
              <td className="p-3 flex flex-wrap gap-2">
                <button
                  onClick={() => alert(JSON.stringify(agenda, null, 2))}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  View
                </button>
                {agenda.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => performAction(agenda.id, "approve")}
                      className="px-3 py-1 bg-arsiBlue text-white rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => performAction(agenda.id, "reject")}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        const rid = prompt("Receiver office ID (pick from dropdown)?");
                        if (rid) performAction(agenda.id, "forward", { receiverOfficeId: rid });
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Forward
                    </button>
                  </>
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

      {/* office staff section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Staff in Your Office</h2>
        <table className="w-full border rounded-lg bg-arsiLight shadow">
          <thead className="bg-arsiLight text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}