"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw, Search } from "lucide-react";
import {
  listUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "@/lib/userService";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const PAGE_SIZE = 10;

function RoleBadge({ role }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        isAdmin
          ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
          : "border-white/10 bg-white/5 text-slate-400"
      }`}
    >
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

function StatusToggle({ active, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      disabled={disabled}
      onClick={() => onChange(!active)}
      className={`relative h-5 w-9 rounded-full transition disabled:opacity-40 ${
        active ? "bg-cyan-400" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#0a0e1a] transition ${
          active ? "left-4" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(
    async ({ silent = false, suppressError = false } = {}) => {
      // Silent refetches (polling, focus, manual refresh button) skip the
      // full-table loading state so it doesn't flash — only the very first
      // load, or a filter/page change, shows "Loading users…".
      if (!silent) setLoading(true);
      setErrorMessage("");
      try {
        const res = await listUsers({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          role: roleFilter || undefined,
          is_active: activeFilter || undefined,
        });
        setUsers(res.data.users || []);
        setPagination(
          res.data.pagination || {
            page: 1,
            limit: PAGE_SIZE,
            totalItems: 0,
            totalPages: 1,
          }
        );
      } catch (err) {
        // Background polls fail silently (a flaky poll shouldn't nag the
        // admin), but an explicit action — first load or the refresh
        // button — should still surface the error.
        if (!suppressError) setErrorMessage(err.message || "Couldn't load users.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [page, search, roleFilter, activeFilter]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Poll for changes (new registrations, role/status changes from
  // elsewhere) so the table stays live without a manual refresh.
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers({ silent: true, suppressError: true });
    }, 10000); // 10s — adjust if this ends up too chatty against the API
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Also refetch whenever the tab regains focus — catches the common case
  // of registering/logging in from another tab and switching back.
  useEffect(() => {
    function handleFocus() {
      fetchUsers({ silent: true, suppressError: true });
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchUsers]);

  // Debounce search input so we're not firing a request on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(handle);
  }, [search]);

  async function handleManualRefresh() {
    setRefreshing(true);
    try {
      await fetchUsers({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }

  async function handleStatusChange(targetUser, nextActive) {
    setStatusUpdatingId(targetUser.id);
    try {
      await updateUserStatus(targetUser.id, nextActive);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, isActive: nextActive } : u
        )
      );
    } catch (err) {
      setErrorMessage(err.message || "Couldn't update this user's status.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleRoleChange(targetUser, nextRole) {
    if (nextRole === targetUser.role) return;
    setRoleUpdatingId(targetUser.id);
    try {
      await updateUserRole(targetUser.id, nextRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, role: nextRole } : u
        )
      );
    } catch (err) {
      setErrorMessage(err.message || "Couldn't update this user's role.");
    } finally {
      setRoleUpdatingId(null);
    }
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteUser(pendingDelete.id);
      setPendingDelete(null);
      fetchUsers();
    } catch (err) {
      setErrorMessage(err.message || "Couldn't delete this user.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = search || roleFilter || activeFilter;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View accounts, promote or demote admins, and manage access.
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            strokeWidth={2}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full max-w-xs rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
        >
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setRoleFilter("");
              setActiveFilter("");
              setPage(1);
            }}
            className="text-sm text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
          {errorMessage}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-[#0d1526]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Last login</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Loading users…
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  {hasFilters
                    ? "No users match those filters."
                    : "No users found."}
                </td>
              </tr>
            )}

            {!loading &&
              users.map((u) => {
                const isSelf = currentUser && u.id === currentUser.id;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {u.fullName}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          (you)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <RoleBadge role={u.role} />
                        <select
                          value={u.role}
                          disabled={isSelf || roleUpdatingId === u.id}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className="rounded-md border border-white/10 bg-[#0a0e1a] px-2 py-1 text-xs text-slate-300 outline-none focus:border-cyan-400/50 disabled:opacity-40"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusToggle
                        active={u.isActive}
                        disabled={isSelf || statusUpdatingId === u.id}
                        onChange={(next) => handleStatusChange(u, next)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/scans?userId=${u.id}`}
                          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5"
                        >
                          <Search size={12} />
                          View scans
                        </Link>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => setPendingDelete(u)}
                          className="rounded-md border border-rose-400/20 px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {pagination.totalItems} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this user?"
        description={
          pendingDelete
            ? `"${pendingDelete.fullName}" (${pendingDelete.email}) will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}