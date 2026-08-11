"use client";

import { useState } from "react";
import { scanUrl } from "@/lib/scanService";
import ScanResultCard from "@/components/dashboard/ScanResultCard";

export default function ScanUrlPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;

    setSubmitting(true);
    setErrorMessage("");
    setResult(null);

    try {
      const res = await scanUrl(url.trim());
      setResult(res.data);
    } catch (err) {
      setErrorMessage(err.message || "Couldn't scan this URL. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setUrl("");
    setResult(null);
    setErrorMessage("");
  }

  const urlScan = result?.result?.urlScan;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        Scan
      </p>
      <h1 className="mt-1 text-2xl font-bold text-white">Scan a URL</h1>
      <p className="mt-1 text-sm text-slate-400">
        Check a link against RiskRadar's blacklist, whitelist, and threat
        intelligence before you trust it.
      </p>

      {!result && (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/login"
            disabled={submitting}
            className="flex-1 rounded-lg border border-white/10 bg-[#0d1526] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-medium text-[#0a0e1a] transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {submitting && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0a0e1a] border-t-transparent" />
            )}
            {submitting ? "Scanning…" : "Scan"}
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
            Result for <span className="text-white">{url}</span>
          </p>

          <ScanResultCard
            riskLevel={result.result.riskLevel}
            riskScore={result.result.riskScore}
            isPhishing={result.result.isPhishing}
            recommendation={result.result.recommendation}
            findings={result.result.findings}
            statistics={result.result.statistics}
            extra={
              urlScan && (
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm sm:grid-cols-3">
                  <Detail label="Domain" value={urlScan.domain_name} />
                  <Detail label="HTTPS" value={urlScan.uses_https ? "Yes" : "No"} />
                  <Detail
                    label="Blacklisted"
                    value={
                      urlScan.domain_blacklisted || urlScan.url_blacklisted
                        ? "Yes"
                        : "No"
                    }
                  />
                  <Detail label="Suspicious TLD" value={urlScan.contains_suspicious_tld ? "Yes" : "No"} />
                  <Detail
                    label="Google Safe Browsing"
                    value={formatSafetyCheck(urlScan.google_safe)}
                  />
                  <Detail
                    label="VirusTotal"
                    value={formatSafetyCheck(urlScan.virustotal_safe)}
                  />
                  {urlScan.reputation_score !== null && (
                    <Detail label="Reputation score" value={`${urlScan.reputation_score}/100`} />
                  )}
                </div>
              )
            }
          />

          <button
            type="button"
            onClick={resetForm}
            className="mt-4 text-sm text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
          >
            Scan another URL
          </button>
        </>
      )}
    </div>
  );
}

function formatSafetyCheck(value) {
  if (value === null || value === undefined) return "Not configured";
  return value ? "Safe" : "Flagged";
}

function Detail({ label, value }) {
  const isConcerning = value === "Yes" || value === "Flagged";
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 ${isConcerning ? "text-rose-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}