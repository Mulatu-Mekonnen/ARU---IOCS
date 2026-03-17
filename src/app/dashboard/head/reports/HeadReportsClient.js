"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, ArrowRight, FileText } from "lucide-react";

export default function HeadReportsClient({ user }) {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    forwarded: 0,
    total: 0,
    archived: 0
  });
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
    loadActivityLogs();
  }, []);

  async function loadStats() {
    setLoading(true);
    setError("");
    try {
      const statuses = ["PENDING", "APPROVED", "REJECTED", "FORWARDED", "ARCHIVED"];
      const results = await Promise.all(
        statuses.map((status) =>
          fetch(`/api/admin/agendas?status=${status}&page=1&pageSize=1`, { credentials: "include" }).then((r) => r.json())
        )
      );

      const newStats = {
        pending: results[0]?.total || 0,
        approved: results[1]?.total || 0,
        rejected: results[2]?.total || 0,
        forwarded: results[3]?.total || 0,
        archived: results[4]?.total || 0,
      };
      newStats.total = newStats.pending + newStats.approved + newStats.rejected + newStats.forwarded + newStats.archived;

      setStats(newStats);
    } catch (err) {
      setError(err.message || "Failed to load report stats");
    } finally {
      setLoading(false);
    }
  }

  async function loadActivityLogs() {
    try {
      // This would need a new API endpoint for activity logs
      // For now, we'll show recent approvals/rejections
      const res = await fetch(`/api/admin/agendas?page=1&pageSize=10&sortBy=updatedAt&sortOrder=desc`, { credentials: "include" });
      const data = await res.json();
      setActivityLogs(data.agendas || []);
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    }
  }

  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const rejectionRate = stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive overview of communication workflows and approval metrics.</p>
        {error && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Communications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-3xl font-bold text-green-600">{approvalRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejection Rate</p>
              <p className="text-3xl font-bold text-red-600">{rejectionRate}%</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Pending</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Approved</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Rejected</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.rejected}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Forwarded</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.forwarded}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Archived</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.archived}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Approval Rate</span>
                <span className="font-medium text-gray-900">{approvalRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${approvalRate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Rejection Rate</span>
                <span className="font-medium text-gray-900">{rejectionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${rejectionRate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Forwarding Rate</span>
                <span className="font-medium text-gray-900">{stats.total > 0 ? Math.round((stats.forwarded / stats.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.total > 0 ? (stats.forwarded / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activityLogs.length > 0 ? (
            activityLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  {log.status === 'APPROVED' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {log.status === 'REJECTED' && <XCircle className="w-5 h-5 text-red-600" />}
                  {log.status === 'FORWARDED' && <ArrowRight className="w-5 h-5 text-blue-600" />}
                  {log.status === 'PENDING' && <Clock className="w-5 h-5 text-yellow-600" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.title}</p>
                    <p className="text-xs text-gray-500">
                      {log.createdBy?.name} • {new Date(log.updatedAt || log.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  log.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  log.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  log.status === 'FORWARDED' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {log.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}
