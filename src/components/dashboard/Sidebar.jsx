"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutGrid,
  Link2,
  Mail,
  MessageSquare,
  History,
  Settings,
  ChevronDown,
  Shield,
  Monitor,
  Users,
  Search,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Scan URL", href: "/dashboard/scan-url", icon: Link2 },
  { label: "Email Analysis", href: "/dashboard/email-analysis", icon: Mail },
  { label: "Message Analysis", href: "/dashboard/message-analysis", icon: MessageSquare },
  { label: "Detection History", href: "/dashboard/history", icon: History },
];

const adminNavItems = [
  { label: "Domain Management", href: "/admin/domains", icon: Shield },
  { label: "URL Management", href: "/admin/urls", icon: Link2 },
  { label: "Keyword Management", href: "/admin/keywords", icon: MessageSquare },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Scan Browser", href: "/admin/scans", icon: Search },
];

export default function Sidebar({ user, onNavigate }) {
  const pathname = usePathname();
  const { isAdmin, logoutAll } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const items = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-white/5 bg-[#0B1120] px-4 py-6">
      <div>
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2 px-2">
          <Image
            src="/risk-radar-logo.png"
            alt="RiskRadar logo"
            width={36}
            height={36}
            priority
          />
          <span className="text-lg font-semibold tracking-tight text-white">
            Risk<span className="text-cyan-400">Radar</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {items.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
        >
          <Settings size={18} strokeWidth={2} />
          Settings
        </Link>

        {/* Profile chip + dropdown */}
        <div className="relative">
          {profileMenuOpen && (
            <>
              {/* Click-outside catcher */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileMenuOpen(false)}
              />
              <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-lg border border-white/10 bg-[#0d1526] shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logoutAll();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-rose-400 transition-colors hover:bg-rose-400/10"
                >
                  <Monitor size={16} strokeWidth={2} />
                  Logout from all devices
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-semibold text-cyan-300">
              {(user?.full_name || user?.name || "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">
                {user?.full_name || user?.name}
              </p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-slate-500 transition-transform ${
                profileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}