"use client";

import { useEffect, useState } from "react";
import { listKeywordCategories } from "@/lib/keywordService";


const MATCH_TYPES = ["EXACT", "CONTAINS", "REGEX"];

const EMPTY_FORM = {
  keyword: "",
  category: "",
  severity: "3",
  match_type: "CONTAINS",
  score: "",
  description: "",
  example: "",
  is_case_sensitive: false,
};

export default function KeywordFormModal({
  open,
  mode = "create", // "create" | "edit"
  initialValue,
  submitting = false,
  errorMessage = "",
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  function fetchCategories() {
    setCategoriesLoading(true);
    setCategoriesError("");
    listKeywordCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => {
        setCategories([]);
        setCategoriesError(err.message || "Couldn't load categories.");
      })
      .finally(() => setCategoriesLoading(false));
  }

  useEffect(() => {
    if (open) fetchCategories();
  }, [open]);


  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialValue) {
      setForm({
        keyword: initialValue.keyword || "",
        category: initialValue.category_id || initialValue.category || "",
        severity: String(initialValue.severity ?? "3"),
        match_type: initialValue.match_type || "CONTAINS",
        score: initialValue.score ?? "",
        description: initialValue.description || "",
        example: initialValue.example || "",
        is_case_sensitive: !!initialValue.is_case_sensitive,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, initialValue]);

  if (!open) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      keyword: form.keyword.trim(),
      category: form.category || undefined,
      severity: Number(form.severity),
      match_type: form.match_type,
      score: form.score === "" ? undefined : Number(form.score),
      description: form.description.trim(),
      example: form.example.trim(),
      is_case_sensitive: form.is_case_sensitive,
    };
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-[#0d1526] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              {mode === "create" ? "Add keyword" : "Edit keyword"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Phishing keyword rules are matched against email and message
              content during a scan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 cursor-pointer text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Keyword
            </label>
            <input
              required
              type="text"
              placeholder="e.g. tax refund"
              value={form.keyword}
              onChange={(e) => update("keyword", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Category
              </label>
              <select
                required
                disabled={categoriesLoading}
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full cursor-pointer rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 disabled:opacity-50"
              >
                <option value="">
                  {categoriesLoading ? "Loading categories…" : "Select a category"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.display_name || c.category}
                  </option>
                ))}
              </select>
              {categoriesError && (
                <p className="mt-1.5 text-xs text-rose-400">
                  {categoriesError}{" "}
                  <button
                    type="button"
                    onClick={fetchCategories}
                    className="underline cursor-pointer underline-offset-2 hover:text-rose-300"
                  >
                    Retry
                  </button>
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Severity
              </label>
              <select
                value={form.severity}
                onChange={(e) => update("severity", e.target.value)}
                className="w-full rounded-lg cursor-pointer border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Match type
              </label>
              <select
                value={form.match_type}
                onChange={(e) => update("match_type", e.target.value)}
                className="w-full rounded-lg cursor-pointer border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              >
                {MATCH_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Score
              </label>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="0–100"
                value={form.score}
                onChange={(e) => update("score", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Why does this keyword indicate phishing?"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Example
            </label>
            <textarea
              rows={2}
              placeholder="An example phrase or message using this keyword"
              value={form.example}
              onChange={(e) => update("example", e.target.value)}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.is_case_sensitive}
              onChange={(e) => update("is_case_sensitive", e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-white/20 bg-[#0a0e1a] accent-cyan-400"
            />
            Case-sensitive match
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg cursor-pointer border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg cursor-pointer bg-cyan-400 px-4 py-2 text-sm font-medium text-[#0a0e1a] transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {submitting
                ? "Saving…"
                : mode === "create"
                ? "Add keyword"
                : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}