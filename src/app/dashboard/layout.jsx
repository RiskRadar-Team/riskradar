"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // bounce to /login once we know for sure there's no session.
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);


  function closeSidebar() {
    setSidebarOpen(false);
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070B14]">
        <p className="text-sm tracking-wide text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#070B14]">
      
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar user={user} onNavigate={closeSidebar} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onLogout={logout} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}