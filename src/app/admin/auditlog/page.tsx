"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  Shield, Search, RefreshCcw, ChevronDown, ChevronUp,
  Loader2, AlertCircle, Clock, User, Tag, FileText,
} from "lucide-react";
import Link from "next/link";

interface AuditLogEntry {
  _id: string;
  action: string;
  adminId: string;
  adminEmail: string;
  targetId: string;
  details: Record<string, any>;
  createdAt: string;
}

const ACTION_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  CREATE:  { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  UPDATE:  { bg: "bg-blue-50 border-blue-100",       text: "text-blue-700",    dot: "bg-blue-400" },
  DELETE:  { bg: "bg-red-50 border-red-100",         text: "text-red-700",     dot: "bg-red-400" },
  LOGIN:   { bg: "bg-violet-50 border-violet-100",   text: "text-violet-700",  dot: "bg-violet-400" },
  LOGOUT:  { bg: "bg-gray-50 border-gray-200",       text: "text-gray-600",    dot: "bg-gray-400" },
};

function actionStyle(action: string) {
  const key = Object.keys(ACTION_COLORS).find((k) => action?.toUpperCase().includes(k));
  return ACTION_COLORS[key ?? ""] ?? { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", dot: "bg-amber-400" };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AuditLogPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["ADMIN", "SUPER_ADMIN"] });
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    fetch("/api/admin/auditlog")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setLogs)
      .catch(() => setError("Failed to load audit logs. You may not have permission."))
      .finally(() => setLoading(false));
  }, [user, refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.action?.toLowerCase().includes(q) ||
        l.adminEmail?.toLowerCase().includes(q) ||
        l.targetId?.toLowerCase().includes(q)
    );
  }, [logs, search]);

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 pt-10 pb-20">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-indigo-300" />
                <span className="text-indigo-200 text-sm font-medium">System Security</span>
              </div>
              <h1 className="text-3xl font-bold">Audit Log</h1>
              <p className="text-slate-300 mt-1 text-sm">Complete record of all admin actions on the platform</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-2 bg-white text-slate-800 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container -mt-10 pb-16 space-y-5">
        {/* Search + count */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by action, admin email, or target ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
            />
          </div>
          <span className="text-sm font-semibold text-gray-500 flex-shrink-0">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm text-gray-400 font-medium">Loading audit logs…</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No audit logs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {filtered.map((log) => {
                const style = actionStyle(log.action);
                const isExpanded = expanded === log._id;
                const hasDetails = Object.keys(log.details || {}).length > 0;
                return (
                  <div key={log._id} className="hover:bg-gray-50/60 transition-colors">
                    <button
                      className="w-full text-left px-5 py-4 flex items-start gap-4"
                      onClick={() => hasDetails && setExpanded(isExpanded ? null : log._id)}
                    >
                      <div className="mt-2 flex-shrink-0">
                        <span className={`block w-2.5 h-2.5 rounded-full ${style.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${style.bg} ${style.text}`}>
                            <Tag className="w-2.5 h-2.5" />
                            {log.action}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(log.createdAt)} · {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-semibold">{log.adminEmail || log.adminId}</span>
                          </span>
                          {log.targetId && (
                            <span className="flex items-center gap-1.5 text-gray-500">
                              <span className="text-gray-300">→</span>
                              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{log.targetId}</code>
                            </span>
                          )}
                        </div>
                      </div>
                      {hasDetails && (
                        <div className="flex-shrink-0 mt-1">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      )}
                    </button>

                    {isExpanded && hasDetails && (
                      <div className="px-5 pb-4 ml-6">
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                          <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
