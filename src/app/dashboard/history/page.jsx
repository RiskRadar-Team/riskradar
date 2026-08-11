"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getDashboard } from "@/lib/dashboardService";

// NOTE: interim version. The backend only exposes recentScans via
// GET /riskradar/dashboard, hardcoded to the last 10 rows with no
// pagination and no filters besides `period` (7d/30d/90d/all). Once a
// real GET /riskradar/history endpoint exists (paginated, filterable by
// type/status/search), swap the fetch below for that and this page can
// drop the "last 10 only" notice and add real pagination/search.

const PERIOD_OPTIONS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

function getStatusVisual(scan) {
  if (scan.status === "FAILED") {
    return { icon: Info, color: "text-blue-400 bg-blue-400/10", label: "Failed" };
  }
  const code = scan.riskLevel?.code;
  if (code === "HIGH" || code === "CRITICAL") {
    return { icon: ShieldAlert, color: "text-red-400 bg-red-400/10", label: scan.riskLevel.displayName };
  }
  if (code === "MEDIUM") {
    return { icon: AlertTriangle, color: "text-amber-400 bg-amber-400/10", label: scan.riskLevel.displayName };
  }
  return { icon: ShieldCheck, color: "text-emerald-400 bg-emerald-400/10", label: scan.riskLevel?.displayName || "Safe" };
}

function formatDateTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString();
}

export default function DetectionHistoryPage() {
  const [period, setPeriod] = useState("30d");
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchHistory = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setErrorMessage("");
      try {
        const res = await getDashboard(period);
        setScans(res.data.recentScans || []);
      } catch (err) {
        setErrorMessage(err.message || "Couldn't load scan history.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [period]
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function handleManualRefresh() {
    setRefreshing(true);
    try {
      await fetchHistory({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label || period;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">Detection History</h1>
          <p className="mt-1 text-sm text-slate-400">
            Your most recent scans across URL, email, and message analysis.
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={15} strokeWidth={2} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Interim-scope notice — remove once a real paginated /history endpoint exists */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs text-amber-300">
        <Info size={14} className="mt-0.5 shrink-0" />
        Showing your last 10 scans only. Full searchable history is coming soon.
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="text-xs font-medium text-slate-500">Period</span>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#0d1526] px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400/50"
        >
          {PERIOD_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
          <AlertCircle size={15} />
          {errorMessage}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#0d1526]">
        {loading ? (
          <div className="flex items-center justify-center py-14 text-slate-500">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : scans.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">
            No scans in the last {periodLabel.toLowerCase()}.
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Input</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Risk score</th>
                <th className="px-4 py-3 font-medium">Scanned</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => {
                const visual = getStatusVisual(scan);
                const Icon = visual.icon;
                return (
                  <tr
                    key={scan.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-slate-300">{scan.type}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-400">
                      {scan.input || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${visual.color}`}
                      >
                        <Icon size={12} />
                        {visual.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {scan.riskScore ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDateTime(scan.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-600">
        Want to run a new scan?{" "}
        <Link href="/dashboard/scan-url" className="text-cyan-400 hover:underline">
          Start here
        </Link>
        .
      </p>
    </div>
  );
}