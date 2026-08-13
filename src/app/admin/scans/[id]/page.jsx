"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { getAdminScanById } from "@/lib/adminScanService";
import ScanResultCard from "@/components/dashboard/ScanResultCard";

function deriveRecommendation(riskScore) {
  if (riskScore === null || riskScore === undefined) return null;
  if (riskScore >= 80) return "BLOCK";
  if (riskScore >= 40) return "WARN";
  return "ALLOW";
}

function normalizeFindings(findings = []) {
  return findings.map((f) => ({
    id: f.id,
    finding_type: f.findingType,
    finding_value: f.findingValue,
    severity: f.severity,
    score: f.score,
    description: f.description,
    source: f.source,
    evidence: f.evidence,
  }));
}

function formatSafetyCheck(value) {
  if (value === null || value === undefined) return "Not configured";
  return value ? "Safe" : "Flagged";
}

function Detail({ label, value, concerning = false }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 ${concerning ? "text-rose-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

export default function AdminScanDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const res = await getAdminScanById(id);
        setData(res.data);
      } catch (err) {
        setErrorMessage(err.message || "Couldn't load this scan.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <button
          type="button"
          onClick={() => router.push("/admin/scans")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300"
        >
          <ArrowLeft size={14} /> Back to scan browser
        </button>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
          <AlertCircle size={15} />
          {errorMessage || "Scan not found."}
        </div>
      </div>
    );
  }

  const { scan, findings, result } = data;
  const urlScan = result?.urlScan;
  const emailScan = result?.emailScan;
  const messageScan = result?.messageScan;

  const recommendation = urlScan?.recommendation || deriveRecommendation(scan.riskScore);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <button
        type="button"
        onClick={() => router.push("/admin/scans")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300"
      >
        <ArrowLeft size={14} /> Back to scan browser
      </button>

      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
        {scan.scanType} Scan
      </p>
      <h1 className="mt-1 text-2xl font-bold text-white">
        {urlScan?.input_url || emailScan?.subject || messageScan?.message || "Scan details"}
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Scanned by{" "}
        <span className="text-slate-300">
          {scan.user?.fullName} ({scan.user?.email})
        </span>{" "}
        · {new Date(scan.createdAt).toLocaleString()}
      </p>

      <ScanResultCard
        riskLevel={scan.riskLevel}
        riskScore={scan.riskScore}
        isPhishing={scan.isPhishing}
        recommendation={recommendation}
        findings={normalizeFindings(findings)}
        extra={
          urlScan ? (
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm sm:grid-cols-3">
              <Detail label="Domain" value={urlScan.domain_name} />
              <Detail
                label="HTTPS"
                value={urlScan.uses_https ? "Yes" : "No"}
                concerning={!urlScan.uses_https}
              />
              <Detail
                label="Blacklisted"
                value={urlScan.domain_blacklisted || urlScan.url_blacklisted ? "Yes" : "No"}
                concerning={urlScan.domain_blacklisted || urlScan.url_blacklisted}
              />
              <Detail
                label="Suspicious TLD"
                value={urlScan.contains_suspicious_tld ? "Yes" : "No"}
                concerning={urlScan.contains_suspicious_tld}
              />
              <Detail
                label="Google Safe Browsing"
                value={formatSafetyCheck(urlScan.google_safe)}
                concerning={urlScan.google_safe === false}
              />
              <Detail
                label="VirusTotal"
                value={formatSafetyCheck(urlScan.virustotal_safe)}
                concerning={urlScan.virustotal_safe === false}
              />
              {urlScan.reputation_score !== null && (
                <Detail label="Reputation score" value={`${urlScan.reputation_score}/100`} />
              )}
            </div>
          ) : (emailScan?.ai_summary || messageScan?.ai_summary) ? (
            <div className="mt-5 rounded-lg border border-violet-400/20 bg-violet-400/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                AI Summary
              </p>
              <p className="mt-1.5 text-sm text-slate-300">
                {emailScan?.ai_summary || messageScan?.ai_summary}
              </p>
            </div>
          ) : null
        }
      />
    </div>
  );
}