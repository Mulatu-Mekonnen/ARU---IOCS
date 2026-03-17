"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function AgendaManagementClient() {
  const router = useRouter();
  const [agendas, setAgendas] = useState([]);
  const [offices, setOffices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [officeFilter, setOfficeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [forwarding, setForwarding] = useState({ agendaId: null, officeId: "" });
  const [forwardError, setForwardError] = useState("");
  const [loadError, setLoadError] = useState("");

  const [viewAgenda, setViewAgenda] = useState(null);
  const [viewTimeline, setViewTimeline] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");

  useEffect(() => {
    loadAgendas();
  }, [officeFilter, statusFilter, page]);

  useEffect(() => {
    fetch("/api/admin/offices", { credentials: "include" })
      .then((r) => r.json())
      .then(setOffices)
      .catch((err) => {
        console.error(err);
        setOffices([]);
      });
  }, []);

  async function loadAgendas() {
    setLoadError("");
    const params = new URLSearchParams();
    if (officeFilter) params.set("officeId", officeFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (searchTerm) params.set("search", searchTerm);
    params.set("page", page);
    params.set("pageSize", 20);

    try {
      const res = await fetch(`/api/admin/agendas?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data?.error || "Failed to load agendas";
        setLoadError(errorMessage);
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
        }
        setAgendas([]);
        setTotal(0);
        return;
      }

      setAgendas(data.agendas || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load agendas", err);
      setLoadError("Failed to load agendas");
      setAgendas([]);
      setTotal(0);
    }
  }

  async function performAction(id, action, extra = {}) {
    const body = { action, ...extra };
    await fetch(`/api/admin/agendas/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    loadAgendas();
  }

  async function openViewModal(agenda) {
    setViewAgenda(agenda);
    setViewTimeline([]);
    setViewError("");
    setViewLoading(true);

    try {
      const res = await fetch(`/api/agendas/${agenda.id}/timeline`, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to load timeline");
      }
      const data = await res.json();
      setViewTimeline(data.timeline || []);
    } catch (err) {
      console.error(err);
      setViewError("Unable to load timeline.");
    } finally {
      setViewLoading(false);
    }
  }

  function closeViewModal() {
    setViewAgenda(null);
    setViewTimeline([]);
    setViewError("");
    setViewLoading(false);
  }

  function openForwardModal(id) {
    setForwardError("");
    setForwarding({ agendaId: id, officeId: "" });
  }

  function closeForwardModal() {
    setForwarding({ agendaId: null, officeId: "" });
    setForwardError("");
  }

  async function submitForward() {
    if (!forwarding.officeId) {
      setForwardError("Choose an office to forward to.");
      return;
    }

    await performAction(forwarding.agendaId, "forward", {
      receiverOfficeId: forwarding.officeId,
    });
    closeForwardModal();
  }

  function statusBadge(status) {
    const map = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      FORWARDED: "bg-blue-100 text-blue-800",
      ARCHIVED: "bg-gray-100 text-gray-800",
    };
    return map[status] || map.PENDING;
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agenda Management</h1>
        <p className="text-gray-600 mt-1">Review and manage agenda submissions</p>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {loadError}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search agendas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={officeFilter}
            onChange={(e) => {
              setOfficeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Offices</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="FORWARDED">Forwarded</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button
            onClick={loadAgendas}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Receiver
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(agendas || []).map((agenda) => (
                <tr key={agenda.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{agenda.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 max-w-xs truncate" title={agenda.title}>
                      {agenda.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {agenda.senderOffice?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {agenda.receiverOffice?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {agenda.createdBy?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge(
                        agenda.status
                      )}`}
                    >
                      {agenda.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(agenda.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openViewModal(agenda)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      {agenda.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => performAction(agenda.id, "approve")}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg shadow-sm text-sm font-medium text-green-700 hover:bg-green-100 hover:border-green-300 transition"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Approve</span>
                          </button>
                          <button
                            onClick={() => performAction(agenda.id, "reject")}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg shadow-sm text-sm font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Reject</span>
                          </button>
                          <button
                            onClick={() => openForwardModal(agenda.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg shadow-sm text-sm font-medium text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition"
                            title="Forward"
                          >
                            <ArrowRight className="w-4 h-4" />
                            <span className="hidden sm:inline">Forward</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {agendas.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No agendas found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forward Modal */}
      {viewAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
<div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Agenda Details</h2>
              <p className="text-sm text-gray-500">ID #{viewAgenda.id}</p>
            </div>
            <button
              onClick={closeViewModal}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Title</p>
                  <p className="mt-1 text-gray-900 font-semibold">{viewAgenda.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusBadge(
                      viewAgenda.status
                    )}`}
                  >
                    {viewAgenda.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created By</p>
                  <p className="mt-1 text-gray-900">{viewAgenda.createdBy?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created At</p>
                  <p className="mt-1 text-gray-900">
                    {new Date(viewAgenda.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sender Office</p>
                  <p className="mt-1 text-gray-900">{viewAgenda.senderOffice?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Receiver Office</p>
                  <p className="mt-1 text-gray-900">{viewAgenda.receiverOffice?.name || "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{viewAgenda.description || "—"}</p>
              </div>

              {viewAgenda.attachmentUrl && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">Attachment</p>
                  <a
                    href={viewAgenda.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    View File
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">Timeline</p>
                  {viewLoading && (
                    <span className="text-xs text-gray-500">Loading...</span>
                  )}
                </div>
                {viewError ? (
                  <p className="mt-2 text-sm text-red-600">{viewError}</p>
                ) : viewTimeline.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">No timeline events available.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {viewTimeline.map((event) => (
                      <li
                        key={event.id}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{event.action}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">By: {event.by}</p>
                        {event.comment && (
                          <p className="text-sm text-gray-600 mt-1">{event.comment}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
