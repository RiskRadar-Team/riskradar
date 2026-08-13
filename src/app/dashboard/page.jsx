"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  Link2,
  Mail,
  MessageSquare,
  History,
  ArrowRight,
  AlertTriangle,
  ShieldAlert,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  Activity,
  BrainCircuit,
} from "lucide-react";
import RadarVisual from "@/components/dashboard/RadarVisual";
import { useAuth } from "@/context/AuthContext";
import { getDashboard } from "@/lib/dashboardService";
import { getAdminDashboard } from "@/lib/adminDashboardService";

const quickActions = [
  {
    number: "01",
    title: "Scan URL",
    description: "Detect phishing and malicious websites.",
    href: "/dashboard/scan-url",
    icon: Link2,
    accent: "cyan",
  },
  {
    number: "02",
    title: "Email Analysis",
    description: "Analyze suspicious emails for threats.",
    href: "/dashboard/email-analysis",
    icon: Mail,
    accent: "purple",
  },
  {
    number: "03",
    title: "Message Analysis",
    description: "Detect scams and malicious messages.",
    href: "/dashboard/message-analysis",
    icon: MessageSquare,
    accent: "amber",
  },
  {
    number: "04",
    title: "Detection History",
    description: "View and manage your previous investigations.",
    href: "/dashboard/history",
    icon: History,
    accent: "blue",
  },
];

const accentMap = {
  cyan: {
    border: "border-cyan-400/20 hover:border-cyan-400/50",
    iconBg: "bg-cyan-400/10 text-cyan-300",
    number: "text-cyan-400",
    arrow: "bg-cyan-400/10 text-cyan-300",
  },
  purple: {
    border: "border-purple-400/20 hover:border-purple-400/50",
    iconBg: "bg-purple-400/10 text-purple-300",
    number: "text-purple-400",
    arrow: "bg-purple-400/10 text-purple-300",
  },
  amber: {
    border: "border-amber-400/20 hover:border-amber-400/50",
    iconBg: "bg-amber-400/10 text-amber-300",
    number: "text-amber-400",
    arrow: "bg-amber-400/10 text-amber-300",
  },
  blue: {
    border: "border-blue-400/20 hover:border-blue-400/50",
    iconBg: "bg-blue-400/10 text-blue-300",
    number: "text-blue-400",
    arrow: "bg-blue-400/10 text-blue-300",
  },
};

const statColorMap = {
  red: { text: "text-red-400", stroke: "#F87171" },
  green: { text: "text-emerald-400", stroke: "#34D399" },
  amber: { text: "text-amber-400", stroke: "#FBBF24" },
};

const RISK_COLOR_HEX = {
  green: "#34D399",
  blue: "#60A5FA",
  yellow: "#FBBF24",
  orange: "#FB923C",
  red: "#F87171",
};

const PERIOD_OPTIONS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDateTime(isoString) {
  if (!isoString) return "Never";
  return new Date(isoString).toLocaleString();
}

function Sparkline({ points, stroke }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProtectionDonut({ score }) {
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0 -rotate-90">
      <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke="#60A5FA"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function getActivityVisual(scan) {
  if (scan.status === "FAILED") {
    return { icon: Info, color: "text-blue-400 bg-blue-400/10" };
  }
  const code = scan.riskLevel?.code;
  if (code === "HIGH" || code === "CRITICAL") {
    return { icon: ShieldAlert, color: "text-red-400 bg-red-400/10" };
  }
  if (code === "MEDIUM") {
    return { icon: AlertTriangle, color: "text-amber-400 bg-amber-400/10" };
  }
  return { icon: ShieldCheck, color: "text-emerald-400 bg-emerald-400/10" };
}

function getActivityTitle(scan) {
  const typeLabel =
    scan.type === "URL" ? "URL" : scan.type === "EMAIL" ? "Email" : "Message";
  if (scan.status === "FAILED") return `${typeLabel} scan failed`;
  const code = scan.riskLevel?.code;
  if (code === "HIGH" || code === "CRITICAL") return `Dangerous ${typeLabel.toLowerCase()} detected`;
  if (code === "MEDIUM") return `Suspicious ${typeLabel.toLowerCase()} detected`;
  return `${typeLabel} scan completed`;
}

function WelcomeBanner({ displayName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-8 md:grid-cols-[1fr_auto]"
    >
      <div>
        <h1 className="text-3xl font-semibold text-white">
          Welcome Back, <span className="text-cyan-400">{displayName}</span> 👋
        </h1>
        <p className="mt-2 max-w-md text-slate-400">
          Check a link or message before you trust it. Your security workspace is ready.
        </p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
          <ShieldCheck size={14} />
          AI-POWERED PROTECTION
        </span>
      </div>
      <RadarVisual />
    </motion.div>
  );
}

function QuickActions() {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs font-semibold tracking-wider text-slate-400">
          START A NEW INVESTIGATION
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action, i) => {
          const a = accentMap[action.accent];
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                href={action.href}
                className={`flex h-full flex-col justify-between rounded-xl border bg-white/[0.02] p-3 transition-colors ${a.border}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${a.number}`}>{action.number}</span>
                  </div>
                  <div className={`mt-2 flex h-8 w-8 items-center justify-center rounded-lg ${a.iconBg}`}>
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{action.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{action.description}</p>
                </div>
                <div className={`mt-3 flex h-6 w-6 items-center justify-center rounded-full ${a.arrow}`}>
                  <ArrowRight size={13} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function DistributionBar({ items, getKey, getLabel, getCount, getColor }) {
  const total = items.reduce((sum, item) => sum + getCount(item), 0) || 1;
  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const count = getCount(item);
        const pct = Math.round((count / total) * 100);
        const color = getColor(item);
        return (
          <div key={getKey(item)}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">{getLabel(item)}</span>
              <span className="text-slate-500">{count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RiskBadge({ riskLevel, status }) {
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400">
        Failed
      </span>
    );
  }
  if (!riskLevel) return <span className="text-xs text-slate-600">—</span>;
  const hex = RISK_COLOR_HEX[riskLevel.color] || "#94A3B8";
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${hex}1a`, color: hex }}
    >
      {riskLevel.displayName}
    </span>
  );
}

function PersonalOverview() {
  const [period, setPeriod] = useState("30d");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await getDashboard(period);
      setDashboard(res.data);
    } catch (err) {
      setErrorMessage(err.message || "Couldn't load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const summary = dashboard?.summary;
  const threatTrend = dashboard?.threatTrend || [];
  const recentScans = dashboard?.recentScans || [];
  const riskDistribution = dashboard?.riskDistribution || [];
  const scanTypes = dashboard?.scanTypes || [];
  const recentThreats = dashboard?.recentThreats || [];
  const threatsSparkline = threatTrend.map((t) => t.threatsDetected);
  const safeSparkline = threatTrend.map((t) => t.safeScans);
  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label || period;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold tracking-wider text-slate-400">
              THREAT OVERVIEW ({periodLabel.toUpperCase()})
            </span>
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
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
              <AlertCircle size={15} />
              {errorMessage}
            </div>
          )}

          {loading && !summary ? (
            <div className="flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-10 text-slate-500">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <p className={`text-xl font-semibold ${statColorMap.red.text}`}>
                  {summary?.threatsDetected ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-400">Threats Detected</p>
                <div className="mt-2">
                  <Sparkline points={threatsSparkline} stroke={statColorMap.red.stroke} />
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <p className={`text-xl font-semibold ${statColorMap.green.text}`}>
                  {summary?.safeScans ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-400">Safe Scans</p>
                <div className="mt-2">
                  <Sparkline points={safeSparkline} stroke={statColorMap.green.stroke} />
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <p className={`text-xl font-semibold ${statColorMap.amber.text}`}>
                  {summary?.highCriticalThreats ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-400">High/Critical Threats</p>
                <p className="mt-2 text-xs text-slate-600">
                  of {summary?.totalScans ?? 0} total scans
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div>
                  <p className="text-xl font-semibold text-blue-400">
                    {summary?.securityScore ?? 100}%
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Protection Score</p>
                </div>
                <ProtectionDonut score={summary?.securityScore ?? 100} />
              </div>
            </div>
          )}
        </div>

        {/* Risk distribution + scan types — mirrors the admin view's charts,
            scoped to this user, so the left column isn't left mostly empty. */}
        {!loading && (riskDistribution.length > 0 || scanTypes.length > 0) && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {riskDistribution.length > 0 && (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <p className="mb-4 text-xs font-semibold tracking-wider text-slate-400">
                  RISK DISTRIBUTION
                </p>
                <DistributionBar
                  items={riskDistribution}
                  getKey={(r) => r.code}
                  getLabel={(r) => r.displayName}
                  getCount={(r) => r.count}
                  getColor={(r) => RISK_COLOR_HEX[r.color] || "#94A3B8"}
                />
              </div>
            )}
            {scanTypes.length > 0 && (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <p className="mb-4 text-xs font-semibold tracking-wider text-slate-400">
                  SCAN TYPES
                </p>
                <DistributionBar
                  items={scanTypes}
                  getKey={(s) => s.type}
                  getLabel={(s) => s.type}
                  getCount={(s) => s.count}
                  getColor={() => "#22D3EE"}
                />
              </div>
            )}
          </div>
        )}

        {/* Recent threats table — same data your teammate already exposes
            via recentThreats on the personal dashboard endpoint. */}
        {!loading && recentThreats.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <p className="mb-4 text-xs font-semibold tracking-wider text-slate-400">
              YOUR RECENT THREATS
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Input</th>
                    <th className="px-3 py-2 font-medium">Risk</th>
                    <th className="px-3 py-2 font-medium">Score</th>
                    <th className="px-3 py-2 font-medium">Detected</th>
                  </tr>
                </thead>
                <tbody>
                  {recentThreats.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-3 text-slate-400">{t.type}</td>
                      <td className="max-w-[220px] truncate px-3 py-3 text-slate-400">
                        {t.input || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <RiskBadge riskLevel={t.riskLevel} status={t.status} />
                      </td>
                      <td className="px-3 py-3 text-slate-400">{t.riskScore ?? "—"}</td>
                      <td className="px-3 py-3 text-slate-500">{formatDateTime(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex-1 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-slate-400">RECENT ACTIVITY</p>
            <Link href="/dashboard/history" className="text-xs font-medium text-cyan-400 hover:underline">
              View All
            </Link>
          </div>

          {loading && recentScans.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-500">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : recentScans.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No scans yet — run your first investigation above.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {recentScans.map((scan) => {
                const visual = getActivityVisual(scan);
                const Icon = visual.icon;
                return (
                  <div key={scan.id} className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${visual.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-white">
                          {getActivityTitle(scan)}
                        </p>
                        <span className="shrink-0 text-xs text-slate-500">
                          {formatRelativeTime(scan.createdAt)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-500">{scan.input || "—"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, accent }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        <Icon size={16} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-slate-600">{sublabel}</p>}
    </div>
  );
}

function PlatformOverview() {
  const [period, setPeriod] = useState("30d");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setErrorMessage("");
      try {
        const res = await getAdminDashboard(period);
        setDashboard(res.data);
      } catch (err) {
        setErrorMessage(err.message || "Couldn't load the admin dashboard.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [period]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  async function handleManualRefresh() {
    setRefreshing(true);
    try {
      await fetchDashboard({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }

  const summary = dashboard?.summary;
  const threatTrend = dashboard?.threatTrend || [];
  const riskDistribution = dashboard?.riskDistribution || [];
  const scanTypes = dashboard?.scanTypes || [];
  const topUsers = dashboard?.topUsers || [];
  const recentUsers = dashboard?.recentUsers || [];
  const recentThreats = dashboard?.recentThreats || [];
  const aiAnalysis = dashboard?.aiAnalysis;
  const threatsSparkline = threatTrend.map((t) => t.threatsDetected);

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold tracking-wider text-slate-400">
          PLATFORM OVERVIEW
        </span>
        <div className="flex items-center gap-2">
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
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
          <AlertCircle size={15} />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={summary?.totalUsers ?? 0}
          sublabel={`${summary?.activeUsers ?? 0} active · ${summary?.inactiveUsers ?? 0} inactive`}
          accent="#60A5FA"
        />
        <StatCard
          icon={Activity}
          label="Total Scans"
          value={summary?.totalScans ?? 0}
          sublabel={`${summary?.scansToday ?? 0} today`}
          accent="#22D3EE"
        />
        <StatCard
          icon={ShieldAlert}
          label="Threats Detected"
          value={summary?.threatsDetected ?? 0}
          sublabel={`${summary?.threatRate ?? 0}% threat rate`}
          accent="#F87171"
        />
        <StatCard
          icon={ShieldCheck}
          label="Avg. Risk Score"
          value={summary?.averageRiskScore ?? 0}
          sublabel={`${summary?.safeScans ?? 0} safe scans`}
          accent="#34D399"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:col-span-2">
          <p className="text-xs font-semibold tracking-wider text-slate-400">
            THREATS OVER TIME
          </p>
          {threatsSparkline.length < 2 ? (
            <p className="mt-6 py-6 text-center text-sm text-slate-500">
              Not enough activity yet to plot a trend.
            </p>
          ) : (
            <div className="mt-6">
              <Sparkline points={threatsSparkline} stroke="#F87171" />
            </div>
          )}

          {aiAnalysis && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-400/10 text-purple-300">
                <BrainCircuit size={16} />
              </div>
              <div className="text-xs text-slate-400">
                AI analyzed{" "}
                <span className="font-medium text-white">{aiAnalysis.analyzedScans}</span>{" "}
                scans, flagging{" "}
                <span className="font-medium text-white">{aiAnalysis.findings}</span> findings
                (<span className="font-medium text-red-400">{aiAnalysis.highRiskFindings}</span>{" "}
                high-risk), avg. score {aiAnalysis.averageScore}.
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <p className="mb-4 text-xs font-semibold tracking-wider text-slate-400">
            RISK DISTRIBUTION
          </p>
          <DistributionBar
            items={riskDistribution}
            getKey={(r) => r.code}
            getLabel={(r) => r.displayName}
            getCount={(r) => r.count}
            getColor={(r) => RISK_COLOR_HEX[r.color] || "#94A3B8"}
          />
          <p className="mb-3 mt-6 text-xs font-semibold tracking-wider text-slate-400">
            SCAN TYPES
          </p>
          <DistributionBar
            items={scanTypes}
            getKey={(s) => s.type}
            getLabel={(s) => s.type}
            getCount={(s) => s.count}
            getColor={() => "#22D3EE"}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-slate-400">
              MOST ACTIVE USERS
            </p>
            <Link href="/admin/users" className="text-xs font-medium text-cyan-400 hover:underline">
              Manage users
            </Link>
          </div>
          {topUsers.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No activity yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {topUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{u.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm text-slate-300">{u.totalScans} scans</p>
                    <p className="text-xs text-red-400">{u.threatsDetected} threats</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-slate-400">
              RECENTLY REGISTERED
            </p>
            <Link href="/admin/users" className="text-xs font-medium text-cyan-400 hover:underline">
              View all
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No users yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{u.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-violet-400/10 text-violet-300"
                          : "bg-white/5 text-slate-400"
                      }`}
                    >
                      {u.role}
                    </span>
                    <p className="mt-1 text-xs text-slate-600">{formatDateTime(u.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <p className="mb-4 text-xs font-semibold tracking-wider text-slate-400">
          RECENT THREATS (ALL USERS)
        </p>
        {recentThreats.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No threats detected in this period.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-medium">User</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Input</th>
                  <th className="px-3 py-2 font-medium">Risk</th>
                  <th className="px-3 py-2 font-medium">Score</th>
                  <th className="px-3 py-2 font-medium">Detected</th>
                </tr>
              </thead>
              <tbody>
                {recentThreats.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-3 py-3 text-slate-300">{t.user?.fullName || "Unknown"}</td>
                    <td className="px-3 py-3 text-slate-400">{t.scanType}</td>
                    <td className="max-w-[220px] truncate px-3 py-3 text-slate-400">
                      {t.input || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <RiskBadge riskLevel={t.riskLevel} status={t.status} />
                    </td>
                    <td className="px-3 py-3 text-slate-400">{t.riskScore ?? "—"}</td>
                    <td className="px-3 py-3 text-slate-500">{formatDateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const displayName = user?.full_name || user?.fullName || "there";

  return (
    <div className="flex flex-col gap-8">
      <WelcomeBanner displayName={displayName} />
      <QuickActions />
      {isAdmin ? <PlatformOverview /> : <PersonalOverview />}
    </div>
  );
}