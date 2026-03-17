"use client";

import { useEffect, useState } from "react";

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const res = await fetch("/api/announcements", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      } else {
        setError("Failed to load announcements");
      }
    } catch (err) {
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading announcements...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  if (announcements.length === 0) {
    return <div className="text-center py-4 text-gray-500">No announcements available.</div>;
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div key={announcement.id} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{announcement.title}</h3>
            <span className="text-sm text-gray-500">
              {new Date(announcement.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 mb-2">{announcement.content}</p>
          {announcement.createdBy && (
            <div className="text-sm text-gray-600">
              Posted by: {announcement.createdBy.name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}