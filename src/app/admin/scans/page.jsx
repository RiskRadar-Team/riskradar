"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { listAdminScans } from "@/lib/adminScanService";
import { listUsers } from "@/lib/userService";

const PAGE_SIZE = 15;

const SCAN_TYPE_OPTIONS = ["URL", "EMAIL", "MESSAGE"];
const RISK_LEVEL_OPTIONS = ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUS_OPTIONS = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];

const RISK_COLOR_HEX = {
  green: "#34D399",
  blue: "#60A5FA",
  yellow: "#FBBF24",
  orange: "#FB923C",
  red: "#F87171",
};

function statusVisual(status, riskLevel) {
  if (status === "FAILED") {
    return { icon: Info, hex: "#60A5FA", label: "Failed" };
  }
  if (status === "PENDING" || status === "PROCESSING") {
    return { icon: Info, hex: "#94A3B8", label: status };
  }
  if (!riskLevel) return { icon: Info, hex: "#94A3B8", label: "—" };
  const hex = RISK_COLOR_HEX[riskLevel.color] || "#94A3B8";
  const icon =
    riskLevel.code === "HIGH" || riskLevel.code === "CRITICAL"
      ? ShieldAlert
      : riskLevel.code === "MEDIUM"
      ? AlertTriangle
      : ShieldCheck;
  return { icon, hex, label: riskLevel.displayName };
}

function RiskBadge({ status, riskLevel }) {
  const v = statusVisual(status, riskLevel);
  const Icon = v.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${v.hex}1a`, color: v.hex }}
    >
      <Icon size={12} />
      {v.label}
    </span>
  );
}

function formatDateTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString();
}

const EMPTY_FILTERS = {
  userId: "",
  scanType: "",
  riskLevel: "",
  isPhishing: "",
  status: "",
  from: "",
  to: "",
};

export default function AdminScanBrowserPage() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId") || "";

  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, userId: initialUserId });
  const [selectedUser, setSelectedUser] = useState(
    initialUserId ? { id: initialUserId, fullName: null, email: null } : null
  );
  const [userQuery, setUserQuery] = useState("");
  const [userMatches, setUserMatches] = useState([]);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [dropdownRect, setDropdownRect] = useState(null);
  const userInputRef = useRef(null);
  const [page, setPage] = useState(1);

  const [scans, setScans] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchScans = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setErrorMessage("");
      try {
        const res = await listAdminScans({
          page,
          limit: PAGE_SIZE,
          userId: filters.userId || undefined,
          scanType: filters.scanType || undefined,
          riskLevel: filters.riskLevel || undefined,
          isPhishing: filters.isPhishing || undefined,
          status: filters.status || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
        });
        setScans(res.data.scans || []);
        setPagination(
          res.data.pagination || {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (err) {
        setErrorMessage(err.message || "Couldn't load scans.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [page, filters]
  );

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  async function handleManualRefresh() {
    setRefreshing(true);
    try {
      await fetchScans({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }

  function updateFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  }

  // Debounced search-as-you-type against the same user search that powers
  // User Management, so admins can look up "by name" even though the scans
  // endpoint itself only accepts a userId.
  useEffect(() => {
    if (!userQuery.trim()) {
      setUserMatches([]);
      return;
    }
    const handle = setTimeout(async () => {
      setUserSearchLoading(true);
      try {
        const res = await listUsers({ search: userQuery.trim(), limit: 5 });
        setUserMatches(res.data.users || []);
      } catch {
        setUserMatches([]);
      } finally {
        setUserSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [userQuery]);

  function openDropdown() {
    setUserSearchOpen(true);
    if (userInputRef.current) {
      const rect = userInputRef.current.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }
  function selectUser(user) {
    setSelectedUser(user);
    setUserQuery("");
    setUserMatches([]);
    setUserSearchOpen(false);
    updateFilter("userId", user.id);
  }

  function clearSelectedUser() {
    setSelectedUser(null);
    updateFilter("userId", "");
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setSelectedUser(null);
    setUserQuery("");
    setPage(1);
  }

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">Scan Browser</h1>
          <p className="mt-1 text-sm text-slate-400">
            Every scan run on the platform, across all users.
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      
      <p className="mt-1.5 text-xs text-slate-600">
        Or click "View scans" next to a user in{" "}
        <Link href="/admin/users" className="text-cyan-400 hover:underline">
          User Management
        </Link>{" "}
        to jump straight here, already filtered.
      </p>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Type</label>
          <select
            value={filters.scanType}
            onChange={(e) => updateFilter("scanType", e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1526] px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400/50"
          >
            <option value="">All types</option>
            {SCAN_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">Risk level</label>
          <select
            value={filters.riskLevel}
            onChange={(e) => updateFilter("riskLevel", e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1526] px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400/50"
          >
            <option value="">All levels</option>
            {RISK_LEVEL_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">Phishing</label>
          <select
            value={filters.isPhishing}
            onChange={(e) => updateFilter("isPhishing", e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1526] px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400/50"
          >
            <option value="">All results</option>
            <option value="true">Flagged only</option>
            <option value="false">Safe only</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">Status</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1526] px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400/50"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter("from", e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1526] px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter("to", e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1526] px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400/50"
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
          <AlertCircle size={15} />
          {errorMessage}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#0d1526]">
        {loading ? (
          <div className="flex items-center justify-center py-14 text-slate-500">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : scans.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">
            {hasFilters ? "No scans match those filters." : "No scans yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Input</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Scanned</th>
                  <th className="px-4 py-3 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <p className="truncate text-slate-300">{scan.user?.fullName || "Unknown"}</p>
                      <p className="truncate text-xs text-slate-500">{scan.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{scan.scanType}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-400">
                      {scan.input || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge status={scan.status} riskLevel={scan.riskLevel} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">{scan.riskScore ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDateTime(scan.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/scans/${scan.id}`}
                        className="text-xs font-medium text-cyan-400 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}