"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listUrls,
  createUrl,
  updateUrl,
  updateUrlStatus,
  deleteUrl,
} from "@/lib/urlService";
import { listThreatTypes } from "@/lib/domainService";
import UrlFormModal from "@/components/admin/UrlFormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const PAGE_SIZE = 10;

function ListTypeBadge({ listType }) {
  const isBlacklist = listType === "BLACKLIST";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        isBlacklist
          ? "border-rose-400/20 bg-rose-400/10 text-rose-400"
          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
      }`}
    >
      {isBlacklist ? "Blacklist" : "Whitelist"}
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
      className={`relative h-5 w-9 cursor-pointer rounded-full transition disabled:opacity-40 ${
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

export default function UrlManagementPage() {
  const [urls, setUrls] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [threatTypes, setThreatTypes] = useState([]);

  const [search, setSearch] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingUrl, setEditingUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchUrls = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await listUrls({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        list_type: listTypeFilter || undefined,
        is_active: activeFilter || undefined,
      });
      
      setUrls(res.data.urls || res.data.domains || []);
      setPagination(
        res.data.pagination || {
          page: 1,
          limit: PAGE_SIZE,
          totalItems: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      setErrorMessage(err.message || "Couldn't load URLs.");
    } finally {
      setLoading(false);
    }
  }, [page, search, listTypeFilter, activeFilter]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  useEffect(() => {
    listThreatTypes()
      .then((res) => setThreatTypes(res.data || []))
      .catch(() => setThreatTypes([]));
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(handle);
  }, [search]);

  function openCreateModal() {
    setModalMode("create");
    setEditingUrl(null);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(url) {
    setModalMode("edit");
    setEditingUrl(url);
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setFormError("");
    try {
      if (modalMode === "create") {
        await createUrl(payload);
      } else {
        await updateUrl(editingUrl.id, payload);
      }
      setModalOpen(false);
      fetchUrls();
    } catch (err) {
      
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(url, nextActive) {
    setStatusUpdatingId(url.id);
    try {
      await updateUrlStatus(url.id, nextActive);
      setUrls((prev) =>
        prev.map((u) => (u.id === url.id ? { ...u, is_active: nextActive } : u))
      );
    } catch (err) {
      setErrorMessage(err.message || "Couldn't update the URL's status.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteUrl(pendingDelete.id);
      setPendingDelete(null);
      fetchUrls();
    } catch (err) {
      setErrorMessage(err.message || "Couldn't delete this URL.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = search || listTypeFilter || activeFilter;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">URL Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Blacklist or whitelist specific URLs. The parent domain must
            already exist in Domain Management.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-cyan-400 cursor-pointer px-4 py-2 text-sm font-medium text-[#0a0e1a] transition hover:bg-cyan-300"
        >
          + Add URL
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search URLs…"
          className="w-full max-w-xs rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
        />
        <select
          value={listTypeFilter}
          onChange={(e) => {
            setListTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
        >
          <option value="">All list types</option>
          <option value="BLACKLIST">Blacklist</option>
          <option value="WHITELIST">Whitelist</option>
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
              setListTypeFilter("");
              setActiveFilter("");
              setPage(1);
            }}
            className="text-sm cursor-pointer text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
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
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">URL</th>
              <th className="px-4 py-3 font-medium">List type</th>
              <th className="px-4 py-3 font-medium">Threat type</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Loading URLs…
                </td>
              </tr>
            )}

            {!loading && urls.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  {hasFilters
                    ? "No URLs match those filters."
                    : "No URLs listed yet. Add the first one to get started."}
                </td>
              </tr>
            )}

            {!loading &&
              urls.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-white">
                    {item.url}
                  </td>
                  <td className="px-4 py-3">
                    <ListTypeBadge listType={item.list_type} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {item.threat_type || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {item.confidence_score ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {item.updated_at
                      ? new Date(item.updated_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusToggle
                      active={item.is_active}
                      disabled={statusUpdatingId === item.id}
                      onChange={(next) => handleStatusChange(item, next)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="rounded-md cursor-pointer border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(item)}
                        className="rounded-md cursor-pointer border border-rose-400/20 px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
              className="rounded-md border cursor-pointer border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              className="rounded-md border cursor-pointer border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <UrlFormModal
        open={modalOpen}
        mode={modalMode}
        initialValue={editingUrl}
        threatTypes={threatTypes}
        submitting={submitting}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this URL?"
        description={
          pendingDelete
            ? `"${pendingDelete.url}" will be permanently removed from the ${
                pendingDelete.list_type === "BLACKLIST" ? "blacklist" : "whitelist"
              }.`
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