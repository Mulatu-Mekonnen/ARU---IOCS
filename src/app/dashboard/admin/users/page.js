"use client";

import { useEffect, useState } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [offices, setOffices] = useState([]);
  const [filter, setFilter] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
    officeId: "",
    active: true,
  });

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then(setUsers);
    fetch("/api/admin/offices")
      .then((res) => res.json())
      .then(setOffices);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase())
  );

  const handleEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      officeId: user.office?.id || "",
      active: user.active,
    });
  };

  const handleDelete = (user) => {
    if (confirm(`Delete ${user.name}?`)) {
      fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
        .then((res) => {
          if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== user.id));
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editing ? `/api/admin/users/${editing.id}` : "/api/admin/users";
    const method = editing ? "PUT" : "POST";
    const body = { ...form };
    if (!editing) body.password = form.password || "password123";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const saved = await res.json();
    if (editing) {
      setUsers((prev) => prev.map((u) => (u.id === saved.id ? saved : u)));
    } else {
      setUsers((prev) => [...prev, saved]);
    }
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "STAFF", officeId: "", active: true });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <input
          type="text"
          placeholder="Search users..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">
          {editing ? "Edit User" : "New User"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="border px-3 py-2 rounded w-full"
            required
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            type="email"
            className="border px-3 py-2 rounded w-full"
            required
          />
          {!editing && (
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              type="password"
              className="border px-3 py-2 rounded w-full"
            />
          )}
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="ADMIN">Admin</option>
            <option value="HEAD">Head</option>
            <option value="STAFF">Staff</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <select
            value={form.officeId}
            onChange={(e) => setForm({ ...form, officeId: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">No Office</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span>Active</span>
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-arsiBlue text-white rounded col-span-full md:col-auto"
          >
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </div>

      <div className="bg-arsiLight rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-arsiLight text-gray-600 text-sm">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Office</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">{user.office?.name || "-"}</td>
                <td className="p-4">{user.active ? "Active" : "Inactive"}</td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="px-3 py-1 bg-arsiBlue text-white rounded hover:opacity-90 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}