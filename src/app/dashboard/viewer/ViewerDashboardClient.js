"use client";

import { useEffect, useState } from "react";
import AnnouncementsList from "../../../components/AnnouncementsList";

export default function ViewerDashboardClient() {
  const [agendas, setAgendas] = useState([]);
  const [officeFilter, setOfficeFilter] = useState("");
  const [offices, setOffices] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState({ type: null, data: null });
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  useEffect(() => {
    loadAgendas();
  }, [officeFilter, page, pageSize, search, readFilter]);

  useEffect(() => {
    fetch("/api/admin/offices", { credentials: "include" })
      .then((r) => {
        if (r.ok) return r.json();
        else throw new Error("Failed to fetch offices");
      })
      .then(setOffices)
      .catch(() => setOffices([]));
  }, []);

  async function loadAgendas() {
    const params = new URLSearchParams();
    params.set("status", "APPROVED");
    if (officeFilter) params.set("officeId", officeFilter);
    if (search) params.set("search", search);
    params.set("page", page);
    params.set("pageSize", pageSize);

    const res = await fetch(`/api/admin/agendas?${params.toString()}`, {
      credentials: "include",
    });
    const data = await res.json();
    const retrieved = data.agendas || [];

    const readList = JSON.parse(localStorage.getItem("viewer_read_messages") || "[]");
    const unreadCount = retrieved.filter((item) => !readList.includes(item.id)).length;

    let filtered = retrieved;
    if (readFilter !== "all") {
      filtered = retrieved.filter((item) => {
        const isReadMsg = readList.includes(item.id);
        return readFilter === "read" ? isReadMsg : !isReadMsg;
      });
    }

    setAgendas(filtered);
    setTotal(data.total || 0);
    setStats({ total: data.total || 0, unread: unreadCount });
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

  async function openModal(type, agendaId) {
    try {
      const res = await fetch(`/api/agendas/${agendaId}/${type}`, { credentials: "include" });
      const data = await res.json();
      setModal({ type, data });
    } catch (err) {
      console.error(err);
    }
  }
  function openPdfPreview(url) {
    setModal({ type: "viewPdf", data: { url } });
  }
  function closeModal() {
    setModal({ type: null, data: null });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border-l-4 border-blue-500">
          <p className="text-xs sm:text-sm font-semibold uppercase text-gray-500">Total Approved</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Communications you can view</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border-l-4 border-indigo-500">
          <p className="text-xs sm:text-sm font-semibold uppercase text-gray-500">Current Filter</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{officeFilter ? offices.find((o) => o.id === officeFilter)?.name || "Office" : "All Offices"}</p>
          <p className="text-xs text-gray-500 mt-1">Filtering approved items only</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border-l-4 border-green-500">
          <p className="text-xs sm:text-sm font-semibold uppercase text-gray-500">Unread</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.unread}</p>
          <p className="text-xs text-gray-500 mt-1">Unread approved items</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border-l-4 border-yellow-500">
          <p className="text-xs sm:text-sm font-semibold uppercase text-gray-500">Page Count</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{Math.max(1, Math.ceil(total / pageSize))}</p>
          <p className="text-xs text-gray-500 mt-1">Page size: {pageSize}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search title or description"
            className="border border-gray-300 rounded-lg px-3 py-2 w-60"
          />

          <select
            value={officeFilter}
            onChange={(e) => {
              setOfficeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Offices</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>

          <select
            value={readFilter}
            onChange={(e) => {
              setReadFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {agendas.length} item{agendas.length === 1 ? "" : "s"} (total {total})
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-arsiLight shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-arsiLight text-left">
            <tr>
              <th className="p-3 text-xs sm:text-sm">ID</th>
              <th className="p-3 text-xs sm:text-sm">Title</th>
              <th className="p-3 text-xs sm:text-sm">Sender</th>
              <th className="p-3 text-xs sm:text-sm">Receiver</th>
              <th className="p-3 text-xs sm:text-sm">Office</th>
              <th className="p-3 text-xs sm:text-sm">Status</th>
              <th className="p-3 text-xs sm:text-sm">Date</th>
              <th className="p-3 text-xs sm:text-sm">Attachment</th>
              <th className="p-3 text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agendas.map((agenda) => {
              const attachmentUrl = agenda.attachmentUrl || agenda.attachment;
              return (
                <tr key={agenda.id} className="border-t bg-white hover:bg-gray-50">
                  <td className="p-2 sm:p-3 text-xs sm:text-sm truncate max-w-[120px]">{agenda.id}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm font-medium truncate max-w-[180px]">{agenda.title}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{agenda.senderOffice?.name || "-"}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{agenda.receiverOffice?.name || "-"}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{agenda.currentOffice?.name || "-"}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">
                    <span className={`px-2 py-1 rounded-full ${statusBadge(agenda.status)}`}>{agenda.status}</span>
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{new Date(agenda.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">
                    {attachmentUrl ? (
                      <div className="flex flex-wrap gap-1">
                        <a href={attachmentUrl} className="text-arsiBlue underline" target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                        {attachmentUrl.toLowerCase().endsWith('.pdf') && (
                          <button onClick={() => openPdfPreview(attachmentUrl)} className="text-arsiBlue underline">
                            Preview
                          </button>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm flex flex-wrap gap-1">
                    <button onClick={() => openModal("timeline", agenda.id)} className="px-2 py-1 text-xs rounded bg-gray-200">
                      Timeline
                    </button>
                    <button onClick={() => openModal("routing", agenda.id)} className="px-2 py-1 text-xs rounded bg-gray-200">
                      Routing
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total > agendas.length && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
          </span>
        </div>
      )}

      {/* System Announcements */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">System Announcements</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <AnnouncementsList />
        </div>
      </div>

      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">
                {modal.type === "timeline"
                  ? "Agenda Timeline"
                  : modal.type === "routing"
                  ? "Routing History"
                  : "PDF Preview"}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                Close
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {modal.type === "timeline" && (
                <ul className="space-y-3">
                  {modal.data?.timeline?.length ? (
                    modal.data.timeline.map((item) => (
                      <li key={item.id} className="border rounded p-3">
                        <div className="text-sm text-gray-600">
                          {new Date(item.at).toLocaleString()}
                        </div>
                        <div className="font-semibold">{item.action}</div>
                        <div className="text-sm text-gray-700">By: {item.by}</div>
                        {item.comment && <div className="text-sm text-gray-600">{item.comment}</div>}
                      </li>
                    ))
                  ) : (
                    <div className="text-gray-600">No timeline entries found.</div>
                  )}
                </ul>
              )}

              {modal.type === "routing" && (
                <ul className="space-y-3">
                  {modal.data?.routing?.length ? (
                    modal.data.routing.map((item) => (
                      <li key={item.id} className="border rounded p-3">
                        <div className="text-sm text-gray-600">
                          {new Date(item.at).toLocaleString()}
                        </div>
                        <div className="font-semibold">
                          {item.from} → {item.to}
                        </div>
                        <div className="text-sm text-gray-700">Routed by: {item.by}</div>
                      </li>
                    ))
                  ) : (
                    <div className="text-gray-600">No routing data found.</div>
                  )}
                </ul>
              )}

              {modal.type === "viewPdf" && (
                <div className="h-[60vh]">
                  <iframe
                    src={modal.data?.url}
                    className="w-full h-full border"
                    title="PDF preview"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}