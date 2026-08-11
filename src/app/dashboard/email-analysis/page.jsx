"use client";

import { useState } from "react";
import { scanEmail } from "@/lib/scanService";
import ScanResultCard from "@/components/dashboard/ScanResultCard";

const EMPTY_FORM = {
  sender_email: "",
  reply_to: "",
  return_path: "",
  subject: "",
  body: "",
  attachment_found: false,
};

export default function EmailAnalysisPage() {
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
        sender_email: form.sender_email.trim(),
        body: form.body.trim(),
        subject: form.subject.trim() || undefined,
        reply_to: form.reply_to.trim() || undefined,
        return_path: form.return_path.trim() || undefined,
        attachment_found: form.attachment_found,
      };
      const res = await scanEmail(payload);
      setResult(res.data);
    } catch (err) {
      setErrorMessage(err.message || "Couldn't scan this email. Please try again.");
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
      <h1 className="mt-1 text-2xl font-bold text-white">Email Analysis</h1>
      <p className="mt-1 text-sm text-slate-400">
        Paste in a suspicious email's details to check it for phishing
        indicators.
      </p>

      {!result && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Sender email *
            </label>
            <input
              required
              type="email"
              placeholder="security@example.com"
              value={form.sender_email}
              onChange={(e) => update("sender_email", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Reply-to
              </label>
              <input
                type="email"
                placeholder="Optional"
                value={form.reply_to}
                onChange={(e) => update("reply_to", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Return path
              </label>
              <input
                type="email"
                placeholder="Optional"
                value={form.return_path}
                onChange={(e) => update("return_path", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Subject
            </label>
            <input
              type="text"
              maxLength={1000}
              placeholder="Urgent: Verify your account"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Body *
            </label>
            <textarea
              required
              rows={6}
              placeholder="Paste the email's body content here…"
              value={form.body}
              onChange={(e) => update("body", e.target.value)}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.attachment_found}
              onChange={(e) => update("attachment_found", e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-[#0d1526] accent-cyan-400"
            />
            This email had an attachment
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-medium text-[#0a0e1a] transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {submitting && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0a0e1a] border-t-transparent" />
            )}
            {submitting ? "Analyzing…" : "Analyze email"}
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
          <p className="mt-6 truncate text-sm text-slate-400">
            Result for <span className="text-white">{form.subject || form.sender_email}</span>
          </p>

          <ScanResultCard
            riskLevel={result.riskLevel}
            riskScore={result.riskScore}
            isPhishing={result.isPhishing}
            recommendation={result.recommendation}
            findings={result.findings}
            statistics={result.statistics}
            extra={
              result.emailScan?.ai_summary && (
                <div className="mt-5 rounded-lg border border-violet-400/20 bg-violet-400/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                    AI Summary
                  </p>
                  <p className="mt-1.5 text-sm text-slate-300">
                    {result.emailScan.ai_summary}
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
            Analyze another email
          </button>
        </>
      )}
    </div>
  );
}