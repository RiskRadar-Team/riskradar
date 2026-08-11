"use client";

import { useState } from "react";
import { scanMessage } from "@/lib/scanService";
import ScanResultCard from "@/components/dashboard/ScanResultCard";


const PLATFORMS = [
  "SMS",
  "WHATSAPP",
  "TELEGRAM",
  "MESSENGER",
  "SIGNAL",
  "DISCORD",
  "SLACK",
  "FACEBOOK",
  "INSTAGRAM",
  "TWITTER",
  "LINKEDIN",
  "SNAPCHAT",
  "TIKTOK",
  "OTHER",
];

const EMPTY_FORM = {
  platform: "WHATSAPP",
  sender: "",
  sender_id: "",
  language: "en",
  message: "",
};

export default function MessageAnalysisPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setResult(null);

    try {
      const payload = {
        platform: form.platform,
        message: form.message.trim(),
        sender: form.sender.trim() || undefined,
        sender_id: form.sender_id.trim() || undefined,
        language: form.language.trim() || undefined,
      };
      const res = await scanMessage(payload);
      setResult(res.data);
    } catch (err) {
      setErrorMessage(err.message || "Couldn't scan this message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setResult(null);
    setErrorMessage("");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        Scan
      </p>
      <h1 className="mt-1 text-2xl font-bold text-white">Message Analysis</h1>
      <p className="mt-1 text-sm text-slate-400">
        Check a suspicious DM or text for scam and phishing indicators.
      </p>

      {!result && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Platform *
              </label>
              <select
                required
                value={form.platform}
                onChange={(e) => update("platform", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Language
              </label>
              <input
                type="text"
                placeholder="en"
                value={form.language}
                onChange={(e) => update("language", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Sender name
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={form.sender}
                onChange={(e) => update("sender", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Sender ID / handle
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={form.sender_id}
                onChange={(e) => update("sender_id", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Message *
            </label>
            <textarea
              required
              rows={6}
              maxLength={10000}
              placeholder="Paste the suspicious message here…"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-medium text-[#0a0e1a] transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {submitting && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0a0e1a] border-t-transparent" />
            )}
            {submitting ? "Analyzing…" : "Analyze message"}
          </button>
        </form>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
          {errorMessage}
        </div>
      )}

      {result && (
        <>
          <p className="mt-6 text-sm text-slate-400">
            Result for message from{" "}
            <span className="text-white">
              {form.sender || form.platform.toLowerCase()}
            </span>
          </p>

          <ScanResultCard
            riskLevel={result.riskLevel}
            riskScore={result.riskScore}
            isPhishing={result.isPhishing}
            recommendation={result.recommendation}
            findings={result.findings}
            statistics={result.statistics}
            extra={
              result.messageScan?.ai_summary && (
                <div className="mt-5 rounded-lg border border-violet-400/20 bg-violet-400/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                    AI Summary
                  </p>
                  <p className="mt-1.5 text-sm text-slate-300">
                    {result.messageScan.ai_summary}
                  </p>
                </div>
              )
            }
          />

          <button
            type="button"
            onClick={resetForm}
            className="mt-4 text-sm text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
          >
            Analyze another message
          </button>
        </>
      )}
    </div>
  );
}