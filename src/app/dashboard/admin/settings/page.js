"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Mail, ToggleRight, FileText, Settings, Clock, Users, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    require2FA: true,
    allowGuestAccess: false,
    emailNotifications: true,
    autoApproveAgendas: false,
    requireApprovalForAll: true,
    enableAuditLogging: true,
    allowFileUploads: true,
    maxFileSize: 10,
    defaultApprovalDeadline: 7,
    enableEmailAlerts: true,
    maintenanceMode: false,
    allowUserRegistration: false,
    requireOfficeApproval: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const loadSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) {
        // Merge with defaults to ensure all values are defined
        const defaults = {
          require2FA: true,
          allowGuestAccess: false,
          emailNotifications: true,
          autoApproveAgendas: false,
          requireApprovalForAll: true,
          enableAuditLogging: true,
          allowFileUploads: true,
          maxFileSize: 10,
          defaultApprovalDeadline: 7,
          enableEmailAlerts: true,
          maintenanceMode: false,
          allowUserRegistration: false,
          requireOfficeApproval: true,
        };
        setSettings({ ...defaults, ...data });
      } else {
        setError(data?.error || "Failed to load settings");
      }
    } catch (err) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to save settings");
      } else {
        setSettings(data);
      }
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure system preferences and security options. Changes are applied immediately.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">
          Loading settings...
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Security Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-gray-600 mt-1">Manage authentication and access policies.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Require two-factor authentication</div>
                <div className="text-sm text-gray-600">Help protect accounts with an additional verification step.</div>
              </div>
              <button
                onClick={() => !loading && toggle("require2FA")}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  settings.require2FA
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ToggleRight className="w-5 h-5" />
                {settings.require2FA ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Allow guest access</div>
                <div className="text-sm text-gray-600">Permit read-only access for external reviewers.</div>
              </div>
              <button
                onClick={() => !loading && toggle("allowGuestAccess")}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  settings.allowGuestAccess
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ToggleRight className="w-5 h-5" />
                {settings.allowGuestAccess ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Allow user registration</div>
                <div className="text-sm text-gray-600">Enable self-registration for new users.</div>
              </div>
              <button
                onClick={() => !loading && toggle("allowUserRegistration")}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  settings.allowUserRegistration
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ToggleRight className="w-5 h-5" />
                {settings.allowUserRegistration ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <Settings className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Workflow</h2>
              <p className="text-gray-600 mt-1">Configure agenda approval and routing processes.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Auto-approve agendas</div>
                <div className="text-sm text-gray-600">Automatically approve agendas from trusted offices.</div>
              </div>
              <button
                onClick={() => !loading && toggle("autoApproveAgendas")}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  settings.autoApproveAgendas
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ToggleRight className="w-5 h-5" />
                {settings.autoApproveAgendas ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Require approval for all</div>
                <div className="text-sm text-gray-600">All agendas must go through approval process.</div>
              </div>
              <button
                onClick={() => !loading && toggle("requireApprovalForAll")}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  settings.requireApprovalForAll
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ToggleRight className="w-5 h-5" />
                {settings.requireApprovalForAll ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Require office approval</div>
                <div className="text-sm text-gray-600">Agendas need office-level approval before routing.</div>
              </div>
              <button
                onClick={() => !loading && toggle("requireOfficeApproval")}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  settings.requireOfficeApproval
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ToggleRight className="w-5 h-5" />
                {settings.requireOfficeApproval ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Default approval deadline</div>
                  <div className="text-sm text-gray-600">Days allowed for agenda approval.</div>
                </div>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.defaultApprovalDeadline}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultApprovalDeadline: parseInt(e.target.value) || 7 }))}
                  disabled={loading}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* File Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <FileText className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Files</h2>
              <p className="text-gray-600 mt-1">Manage file upload and storage settings.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Allow file uploads</div>
                <div className="text-sm text-gray-600">Enable attachment uploads for agendas.</div>
              </div>
              <button
                onClick={() => !loading && toggle("allowFileUploads")}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  settings.allowFileUploads
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ToggleRight className="w-5 h-5" />
                {settings.allowFileUploads ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Maximum file size</div>
                  <div className="text-sm text-gray-600">Maximum file size in MB for uploads.</div>
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) || 10 }))}
                  disabled={loading}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-gray-600 mt-1">Control how system notifications are delivered.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Email notifications</div>
                <div className="text-sm text-gray-600">Send email alerts for activity and updates.</div>
              </div>
              <button
                onClick={() => !loading && toggle("emailNotifications")}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  settings.emailNotifications
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ToggleRight className="w-5 h-5" />
                {settings.emailNotifications ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Email alerts</div>
                <div className="text-sm text-gray-600">Send urgent alerts for critical system events.</div>
              </div>
              <button
                onClick={() => !loading && toggle("enableEmailAlerts")}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  settings.enableEmailAlerts
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ToggleRight className="w-5 h-5" />
                {settings.enableEmailAlerts ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System</h2>
            <p className="text-gray-600 mt-1">System-wide settings and maintenance options.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Maintenance mode</div>
              <div className="text-sm text-gray-600">Put the system in maintenance mode for updates.</div>
            </div>
            <button
              onClick={() => !loading && toggle("maintenanceMode")}
              disabled={loading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                settings.maintenanceMode
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ToggleRight className="w-5 h-5" />
              {settings.maintenanceMode ? "Active" : "Inactive"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Enable audit logging</div>
              <div className="text-sm text-gray-600">Log all system activities for compliance.</div>
            </div>
            <button
              onClick={() => !loading && toggle("enableAuditLogging")}
              disabled={loading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                settings.enableAuditLogging
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ToggleRight className="w-5 h-5" />
              {settings.enableAuditLogging ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
        <div className="flex items-start gap-4">
          <Settings className="w-6 h-6 text-green-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            <p className="text-gray-600 mt-1">Current settings that are actively applied in the system.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-600">File Uploads</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {settings.allowFileUploads ? "Enabled" : "Disabled"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Max: {settings.maxFileSize}MB
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-600">Approval Workflow</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {settings.requireApprovalForAll ? "Required" : "Optional"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Deadline: {settings.defaultApprovalDeadline} days
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-600">Security</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {settings.require2FA ? "2FA Required" : "Standard"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Audit: {settings.enableAuditLogging ? "On" : "Off"}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-600">Notifications</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {settings.emailNotifications ? "Enabled" : "Disabled"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Alerts: {settings.enableEmailAlerts ? "On" : "Off"}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-600">Access Control</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {settings.allowGuestAccess ? "Open" : "Restricted"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Registration: {settings.allowUserRegistration ? "Self" : "Admin"}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-600">System Health</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {settings.maintenanceMode ? "Maintenance" : "Operational"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Auto-approve: {settings.autoApproveAgendas ? "On" : "Off"}
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Save Changes</h2>
          <p className="text-gray-600 mt-1">Apply your system configuration changes. Settings take effect immediately across the system.</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={loading || saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4" />
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
