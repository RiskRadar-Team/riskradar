"use client";

import { LogOut, Menu } from "lucide-react";

export default function Topbar({ onLogout, onMenuClick }) {
  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-[#070B14] px-4 py-4 sm:px-8">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex items-center justify-center rounded-lg border border-white/10 p-2 text-slate-300 transition-colors hover:border-white/20 hover:text-white md:hidden"
      >
        <Menu size={18} strokeWidth={2} />
      </button>

      {/* Always-present spacer pushes Logout to the far right on every screen size */}
      <div className="flex-1" />

      <button
        onClick={onLogout}
        className="flex items-center cursor-pointer gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-red-400/40 hover:text-red-300"
      >
        <LogOut size={16} strokeWidth={2} />
        Logout
      </button>
    </header>
  );
}