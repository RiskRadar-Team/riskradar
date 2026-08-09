"use client";

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
} from "lucide-react";
import RadarVisual from "@/components/dashboard/RadarVisual";
import {
  mockUser,
  mockThreatOverview,
  mockProtectionScore,
  mockRecentActivity,
} from "@/lib/mockDashboardData";

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

const activityIconMap = {
  safe: { icon: ShieldCheck, color: "text-emerald-400 bg-emerald-400/10" },
  warning: { icon: AlertTriangle, color: "text-amber-400 bg-amber-400/10" },
  danger: { icon: ShieldAlert, color: "text-red-400 bg-red-400/10" },
  info: { icon: Info, color: "text-blue-400 bg-blue-400/10" },
};

function Sparkline({ points, stroke }) {
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
              Welcome Back, <span className="text-cyan-400">{mockUser.name}</span> 👋
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
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-semibold tracking-wider text-slate-400">
              THREAT OVERVIEW (TODAY)
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {mockThreatOverview.map((stat) => {
              const c = statColorMap[stat.color];
              return (
                <div
                  key={stat.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <p className={`text-xl font-semibold ${c.text}`}>{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
                  <div className="mt-2">
                    <Sparkline points={stat.sparkline} stroke={c.stroke} />
                  </div>
                </div>
              );
            })}

            {/* Protection score */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div>
                <p className="text-xl font-semibold text-blue-400">{mockProtectionScore}%</p>
                <p className="mt-1 text-xs text-slate-400">Protection Score</p>
              </div>
              <ProtectionDonut score={mockProtectionScore} />
            </div>
          </div>
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

          <div className="flex flex-col gap-5">
            {mockRecentActivity.map((item) => {
              const a = activityIconMap[item.type];
              const Icon = a.icon;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-white">{item.title}</p>
                      <span className="shrink-0 text-xs text-slate-500">{item.time}</span>
                    </div>
                    <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}