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
} from "lucide-react";
import RadarVisual from "@/components/dashboard/RadarVisual";
import { useAuth } from "@/context/AuthContext";
import { getDashboard } from "@/lib/dashboardService";

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

const PERIOD_OPTIONS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

// Maps a recentScans row (status + riskLevel.code) to the visual language
// the mock activity feed used (safe / warning / danger / info).
function getActivityVisual(scan) {
  if (scan.status === "FAILED") {
    return { kind: "info", icon: Info, color: "text-blue-400 bg-blue-400/10" };
  }
  const code = scan.riskLevel?.code;
  if (code === "HIGH" || code === "CRITICAL") {
    return { kind: "danger", icon: ShieldAlert, color: "text-red-400 bg-red-400/10" };
  }
  if (code === "MEDIUM") {
    return { kind: "warning", icon: AlertTriangle, color: "text-amber-400 bg-amber-400/10" };
  }
  // SAFE / LOW / unknown
  return { kind: "safe", icon: ShieldCheck, color: "text-emerald-400 bg-emerald-400/10" };
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

function Sparkline({ points, stroke }) {
  // Guard: Math.max/min on an empty array (no activity in the trend
  // window) returns ±Infinity, and a single point has no range to draw.
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

export default function DashboardPage() {
  const { user } = useAuth();
  // Response shape is inconsistent across this backend (Users admin
  // endpoints are camelCase, others snake_case) — fall back across both
  // rather than assuming which one /user/profile uses.
  const displayName = user?.fullName || user?.full_name || "there";

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

  const threatsSparkline = threatTrend.map((t) => t.threatsDetected);
  const safeSparkline = threatTrend.map((t) => t.safeScans);

  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.value === period)?.label || period;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      {/* Left column */}
      <div className="flex flex-col gap-8">
        {/* Welcome banner */}
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

        {/* Quick actions */}
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

        {/* Threat overview */}
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold tracking-wider text-slate-400">
                THREAT OVERVIEW ({periodLabel.toUpperCase()})
              </span>
            </div>
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

              {/* Protection score */}
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
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-6">
        {/* Recent activity */}
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
                      <p className="truncate text-xs text-slate-500">
                        {scan.input || "—"}
                      </p>
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