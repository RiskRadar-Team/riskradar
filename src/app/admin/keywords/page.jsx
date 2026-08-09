"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listKeywords,
  createKeyword,
  updateKeyword,
  updateKeywordStatus,
  deleteKeyword,
  listKeywordCategories,
} from "@/lib/keywordService";
import KeywordFormModal from "@/components/admin/KeywordFormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const PAGE_SIZE = 10;

function SeverityBadge({ severity }) {
  const styles = {
    1: "border-slate-400/20 bg-slate-400/10 text-slate-400",
    2: "border-amber-400/20 bg-amber-400/10 text-amber-400",
    3: "border-orange-400/20 bg-orange-400/10 text-orange-400",
    4: "border-rose-400/20 bg-rose-400/10 text-rose-400",
    5: "border-rose-500/30 bg-rose-500/15 text-rose-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[severity] || styles[1]
      }`}
    >
      Severity {severity}
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
      className={`relative h-5 w-9 rounded-full cursor-pointer transition disabled:opacity-40 ${
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

export default function KeywordManagementPage() {
  const [keywords, setKeywords] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [matchTypeFilter, setMatchTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingKeyword, setEditingKeyword] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchKeywords = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await listKeywords({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        category: categoryFilter || undefined,
        severity: severityFilter || undefined,
        match_type: matchTypeFilter || undefined,
      });
      setKeywords(res.data.keywords || res.data.domains || []);
      setPagination(
        res.data.pagination || {
          page: 1,
          limit: PAGE_SIZE,
          totalItems: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      setErrorMessage(err.message || "Couldn't load keywords.");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, severityFilter, matchTypeFilter]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  useEffect(() => {
    listKeywordCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(handle);
  }, [search]);

  function openCreateModal() {
    setModalMode("create");
    setEditingKeyword(null);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(keyword) {
    setModalMode("edit");
    setEditingKeyword(keyword);
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setFormError("");
    try {
      if (modalMode === "create") {
        await createKeyword(payload);
      } else {
        await updateKeyword(editingKeyword.id, payload);
      }
      setModalOpen(false);
      fetchKeywords();
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(keyword, nextActive) {
    setStatusUpdatingId(keyword.id);
    try {
      await updateKeywordStatus(keyword.id, nextActive);
      setKeywords((prev) =>
        prev.map((k) =>
          k.id === keyword.id ? { ...k, is_active: nextActive } : k
        )
      );
    } catch (err) {
      setErrorMessage(err.message || "Couldn't update the keyword's status.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteKeyword(pendingDelete.id);
      setPendingDelete(null);
      fetchKeywords();
    } catch (err) {
      setErrorMessage(err.message || "Couldn't delete this keyword.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = search || categoryFilter || severityFilter || matchTypeFilter;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Keyword Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Phishing keyword rules matched against email and message content.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-[#0a0e1a] transition cursor-pointer hover:bg-cyan-300"
        >
          + Add keyword
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search keywords…"
          className="w-full max-w-xs rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name || c.display_name || c.category}
            </option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
        >
          <option value="">All severities</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              Severity {n}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
              setSeverityFilter("");
              setMatchTypeFilter("");
              setPage(1);
            }}
            className="text-sm text-slate-500 underline-offset-2 cursor-pointer hover:text-slate-300 hover:underline"
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
              <th className="px-4 py-3 font-medium">Keyword</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Match type</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Loading keywords…
                </td>
              </tr>
            )}

            {!loading && keywords.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  {hasFilters
                    ? "No keywords match those filters."
                    : "No keywords yet. Add the first one to get started."}
                </td>
              </tr>
            )}

            {!loading &&
              keywords.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {item.keyword}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {item.category_name || item.category || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={item.severity} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {item.match_type || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {item.score ?? "—"}
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
                        className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition cursor-pointer hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(item)}
                        className="rounded-md border cursor-pointer border-rose-400/20 px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10"
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
              className="rounded-md cursor-pointer border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <KeywordFormModal
        open={modalOpen}
        mode={modalMode}
        initialValue={editingKeyword}
        submitting={submitting}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this keyword?"
        description={
          pendingDelete
            ? `"${pendingDelete.keyword}" will be permanently removed from keyword detection rules.`
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