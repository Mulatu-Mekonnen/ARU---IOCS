"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeadPendingClient({ user }) {
  const [agendas, setAgendas] = useState([]);
  const [offices, setOffices] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [reviewModal, setReviewModal] = useState({ type: null, agendaId: null, officeId: "", comment: "" });

  useEffect(() => {
    loadAgendas();
  }, [page]);

  useEffect(() => {
    fetch("/api/admin/offices", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch offices");
        return r.json();
      })
      .then(setOffices)
      .catch(console.error);
  }, []);

  async function loadAgendas() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("status", "PENDING");
      params.set("page", page);
      params.set("pageSize", 20);
      const res = await fetch(`/api/admin/agendas?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load agendas");
      setAgendas(data.agendas || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load pending agendas");
    } finally {
      setLoading(false);
    }
  }

  function openReviewModal(type, agendaId) {
    setReviewModal({ type, agendaId, officeId: "", comment: "" });
    setActionError("");
  }

  function closeReviewModal() {
    setReviewModal({ type: null, agendaId: null, comment: "" });
  }

  async function submitReview() {
    if (!reviewModal.agendaId || !reviewModal.type) return;

    setActionLoadingId(reviewModal.agendaId);
    setActionError("");

    try {
      if (reviewModal.type === "forward" && !reviewModal.officeId) {
        setActionError("Please select an office to forward to.");
        return;
      }

      const payload = { action: reviewModal.type, comment: reviewModal.comment };
      if (reviewModal.type === "forward") {
        payload.receiverOfficeId = reviewModal.officeId;
      }

      const res = await fetch(`/api/admin/agendas/${reviewModal.agendaId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");

      closeReviewModal();
      loadAgendas();
    } catch (err) {
      setActionError(err.message || "Failed to submit review");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Approval Workspace</h1>
        <p className="text-gray-600 mt-2">Review and process pending communications requiring your attention.</p>
        {error && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Pending Communications</h2>
          <p className="text-sm text-gray-600 mt-1">Approve, reject or forward incoming documents.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Office</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agendas.map((agenda) => {
                const attachmentUrl = agenda.attachmentUrl || agenda.attachment;
                return (
                  <tr key={agenda.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{agenda.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agenda.senderOffice?.name || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agenda.currentOffice?.name || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(agenda.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attachmentUrl ? (
                        <a
                          href={attachmentUrl}
                          className="text-blue-600 hover:text-blue-800 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/head/detail/${agenda.id}`}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => openReviewModal("approve", agenda.id)}
                          disabled={actionLoadingId === agenda.id}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openReviewModal("reject", agenda.id)}
                          disabled={actionLoadingId === agenda.id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => openReviewModal("forward", agenda.id)}
                          disabled={actionLoadingId === agenda.id}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          Forward
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {total > agendas.length && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <button
              disabled={page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {reviewModal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">
                {reviewModal.type === "approve" && "Approve Communication"}
                {reviewModal.type === "reject" && "Reject Communication"}
                {reviewModal.type === "forward" && "Forward Communication"}
              </h2>
              <button onClick={closeReviewModal} className="text-gray-500 hover:text-gray-800">
                Close
              </button>
            </div>
            <div className="p-4">
              {reviewModal.type === "forward" && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">Forward to Office</label>
                  <select
                    value={reviewModal.officeId || ""}
                    onChange={(e) => setReviewModal((r) => ({ ...r, officeId: e.target.value }))}
                    className="mt-2 w-full border rounded px-3 py-2"
                  >
                    <option value="">Select office</option>
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Comment (optional)</label>
                <textarea
                  value={reviewModal.comment}
                  onChange={(e) => setReviewModal((r) => ({ ...r, comment: e.target.value }))}
                  className="mt-2 w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Add a comment for the record"
                />
              </div>
              {actionError && <div className="text-sm text-red-600 mb-3">{actionError}</div>}
              <div className="flex justify-end gap-2">
                <button onClick={closeReviewModal} className="px-4 py-2 bg-gray-200 rounded">
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  className={`px-4 py-2 rounded text-white ${
                    reviewModal.type === "approve" ? "bg-arsiBlue hover:bg-blue-700" : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {reviewModal.type === "approve" ? "Approve" : reviewModal.type === "reject" ? "Reject" : "Forward"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
