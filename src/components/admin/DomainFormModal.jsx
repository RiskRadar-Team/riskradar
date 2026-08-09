"use client";

import { useEffect, useState } from "react";

const EMPTY_FORM = {
  domain_name: "",
  list_type: "BLACKLIST",
  threat_type: "",
  reason: "",
  confidence_score: "",
  source: "",
};

export default function DomainFormModal({
  open,
  mode = "create", // "create" | "edit"
  initialValue,
  threatTypes = [],
  submitting = false,
  errorMessage = "",
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialValue) {
      setForm({
        domain_name: initialValue.domain_name || "",
        list_type: initialValue.list_type || "BLACKLIST",
        threat_type: initialValue.threat_type_id || "",
        reason: initialValue.reason || "",
        confidence_score: initialValue.confidence_score ?? "",
        source: initialValue.source || "",
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
      domain_name: form.domain_name.trim(),
      list_type: form.list_type,
      threat_type: form.threat_type || undefined,
      reason: form.reason.trim(),
      confidence_score:
        form.confidence_score === "" ? undefined : Number(form.confidence_score),
      source: form.source.trim(),
    };
    onSubmit(payload);
  }

  const isBlacklist = form.list_type === "BLACKLIST";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-[#0d1526] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              {mode === "create" ? "Add domain" : "Edit domain"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "create"
                ? "Add a domain to the blacklist or whitelist."
                : "Update this domain's listing details."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md cursor-pointer p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
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
              Domain name
            </label>
            <input
              required
              type="text"
              placeholder="example.com"
              value={form.domain_name}
              onChange={(e) => update("domain_name", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              List type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["BLACKLIST", "WHITELIST"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => update("list_type", option)}
                  className={`rounded-lg border cursor-pointer px-3 py-2 text-sm font-medium transition ${
                    form.list_type === option
                      ? option === "BLACKLIST"
                        ? "border-rose-400/40 bg-rose-400/10 text-rose-400"
                        : "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                      : "border-white/10 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {option === "BLACKLIST" ? "Blacklist" : "Whitelist"}
                </button>
              ))}
            </div>
          </div>

          {isBlacklist && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Threat type
              </label>
              <select
                value={form.threat_type}
                onChange={(e) => update("threat_type", e.target.value)}
                className="w-full rounded-lg cursor-pointer border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              >
                <option value="">Select a threat type</option>
                {threatTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.threat_type || t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Reason
            </label>
            <textarea
              rows={3}
              placeholder="Why is this domain listed?"
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Confidence score
              </label>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="0–100"
                value={form.confidence_score}
                onChange={(e) => update("confidence_score", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Source
              </label>
              <input
                type="text"
                placeholder="e.g. google, manual"
                value={form.source}
                onChange={(e) => update("source", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
          </div>

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
                ? "Add domain"
                : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}