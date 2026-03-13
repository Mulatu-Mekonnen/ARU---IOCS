"use client";

import { useEffect, useState } from "react";

export default function OfficeManagement() {
  const [offices, setOffices] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    fetch("/api/admin/offices")
      .then((res) => res.json())
      .then(setOffices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    if (editId) {
      await fetch(`/api/admin/offices/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } else {
      await fetch("/api/admin/offices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    }
    setName("");
    setEditId(null);
    refresh();
  };

  const startEdit = (office) => {
    setEditId(office.id);
    setName(office.name);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this office?")) {
      await fetch(`/api/admin/offices/${id}`, { method: "DELETE" });
      refresh();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Office Management</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Office name"
          className="border px-3 py-2 rounded flex-1"
        />
        <button type="submit" className="px-4 py-2 bg-arsiBlue text-white rounded">
          {editId ? "Update" : "Create"}
        </button>
      </form>
      <div className="bg-arsiLight rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-arsiLight text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Users</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offices.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{o.name}</td>
                <td className="p-3">{o.users.length}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => startEdit(o)} className="px-2 py-1 bg-blue-500 text-white rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(o.id)} className="px-2 py-1 bg-red-500 text-white rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {offices.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-center text-gray-500">
                  No offices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}