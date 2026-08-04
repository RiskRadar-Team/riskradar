"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Link2,
  Mail,
  MessageSquare,
  History,
  Users,
  Settings,
  ChevronDown,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    title: "Scan URL",
    href: "/dashboard/scan-url",
    icon: Link2,
  },
  {
    title: "Email Analysis",
    href: "/dashboard/email",
    icon: Mail,
  },
  {
    title: "Message Analysis",
    href: "/dashboard/message",
    icon: MessageSquare,
  },
  {
    title: "Detection History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "User Management",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="relative flex h-screen flex-col overflow-hidden bg-[#020817]">

      {/* Background Glow */}

      <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Logo */}

      <div className="relative flex items-center gap-3 border-b border-cyan-500/10 px-6 py-4">

        <Image
          src="/risk-radar-logo.png"
          alt="RiskRadar"
          width={38}
          height={38}
        />

        <h1 className="text-2xl font-bold">
          Risk<span className="text-cyan-400">Radar</span>
        </h1>

      </div>

      {/* Navigation */}

      <nav className="relative mt-4 flex flex-col gap-2 px-4">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-4 transition-all duration-300

              ${
                item.active
                  ? "bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10"
                  : "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
              }`}
            >
              <Icon size={25} />

              <span className="font-small">
                {item.title}
              </span>

              {item.active && (
                <div className="ml-auto h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Card */}

      <div className="px-4 py-7">

        <div className="flex items-center justify-between rounded-xl border border-cyan-600 bg-slate-950 p-3">

          <div className="flex items-center gap-8">

            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-cyan-400/10 text-lg font-semibold text-cyan-400">

              SA

            </div>

            <div>

              <p className="font-semibold">
                Sahitya
              </p>

              <p className="text-sm text-slate-400">
                Admin
              </p>

            </div>

          </div>

          <ChevronDown className="text-slate-400" />

        </div>

      </div>

    </aside>
  );
}