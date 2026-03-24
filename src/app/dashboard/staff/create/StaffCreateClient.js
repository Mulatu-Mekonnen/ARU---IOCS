"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffCreateClient() {
  const [title, setTitle] = useState("");
  const [agendas, setAgendas] = useState([]);
  const [description, setDescription] = useState("");
  const [receiverOffice, setReceiverOffice] = useState("");
  const [offices, setOffices] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/offices", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch offices");
        return r.json();
      })
      .then(setOffices)
      .catch((err) => {
        console.error(err);
        setOffices([]);
      });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title.trim() || !receiverOffice) {
      setError("Title and receiver office are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/agendas", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, receiverOfficeId: receiverOffice }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create communication");
      }

      if (attachment) {
        const fd = new FormData();
        fd.append("agendaId", data.id);
        fd.append("file", attachment);
        const uploadRes = await fetch("/api/agendas/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Failed to upload attachment");
        }
      }

      setSuccess("Communication created successfully.");
      setTitle("");
      setDescription("");
      setReceiverOffice("");
      setAttachment(null);
      setTimeout(() => router.push("/dashboard/staff/sent"), 700);
    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setIsSubmitting(false);
    }
  };
    const createAgenda = async (e) => {
    e.preventDefault();
    setUploadError("");

    const res = await fetch("/api/admin/agendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, receiverOfficeId: receiverOffice }),
    });

    const agenda = await res.json();
    if (!res.ok) {
      setUploadError(agenda.error || "Failed to create agenda");
      return;
    }

    // If a file was selected, upload it and link to the agenda
    if (attachment) {
      const formData = new FormData();
      formData.append("agendaId", agenda.id);
      formData.append("file", attachment);

      const uploadRes = await fetch("/api/agendas/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        setUploadError(err.error || "Failed to upload attachment");
      }
    }

    setTitle("");
    setDescription("");
    setReceiverOffice("");
    setAttachment(null);
    loadAgendas();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Communication</h2>
        <form onSubmit={createAgenda} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter communication title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter detailed description"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Office</label>
            <select
              value={receiverOffice}
              onChange={(e) => setReceiverOffice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Choose office</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (Optional)</label>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {attachment && (
              <p className="mt-2 text-sm text-gray-600">Selected: {attachment.name}</p>
            )}
          </div>

          {uploadError && (
            <div className="md:col-span-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm">
              {uploadError}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
            >
              Send Communication
            </button>
          </div>
        </form>
      </div>
  );
}
