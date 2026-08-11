"use client";

const SEVERITY_TEXT = {
  1: "text-slate-400",
  2: "text-amber-400",
  3: "text-orange-400",
  4: "text-rose-400",
  5: "text-rose-300",
};

function RiskBadge({ riskLevel }) {
  if (!riskLevel) return null;
  const color = riskLevel.color; 
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold"
      style={{
        color,
        borderColor: color,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      {riskLevel.display_name}
    </span>
  );
}

function RecommendationBadge({ recommendation }) {
  if (!recommendation) return null;
  const styles = {
    ALLOW: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
    WARN: "border-amber-400/20 bg-amber-400/10 text-amber-400",
    BLOCK: "border-rose-400/20 bg-rose-400/10 text-rose-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${
        styles[recommendation] || "border-white/10 bg-white/5 text-slate-400"
      }`}
    >
      {recommendation}
    </span>
  );
}

const SOURCE_STYLES = {
  GEMINI_AI: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  VIRUSTOTAL: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  GOOGLE_SAFE_BROWSING: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  // Blacklist/whitelist database lookups (domain, url, keyword tables)
  DOMAIN_DATABASE: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  URL_DATABASE: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  PHISHING_KEYWORD_DATABASE: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  KEYWORD_DATABASE: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  PHISHING_KEYWORD: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

function SourceBadge({ source }) {
  if (!source) return null;
  const label = source.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        SOURCE_STYLES[source] || "border-white/10 bg-white/5 text-slate-500"
      }`}
    >
      {label}
    </span>
  );
}

function FindingRow({ finding }) {
  const confidence = finding.evidence?.confidence;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0e1a] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-400">
            {finding.finding_value?.replace(/_/g, " ") || finding.finding_type}
          </span>
          <SourceBadge source={finding.source} />
        </div>
        <span className={`text-xs font-medium ${SEVERITY_TEXT[finding.severity] || "text-slate-400"}`}>
          Severity {finding.severity} · +{finding.score}
          {confidence !== undefined && ` · ${confidence}% confidence`}
        </span>
      </div>
      {finding.description && (
        <p className="mt-2 text-sm text-slate-300">{finding.description}</p>
      )}
    </div>
  );
}

/**
 * Generic result display used by Scan URL, Email Analysis, and Message
 * Analysis. Each page normalizes its own response shape into these props
 * before rendering, since the backend's three scan endpoints don't share an
 * identical response envelope.
 */
export default function ScanResultCard({
  riskLevel,
  riskScore,
  isPhishing,
  recommendation,
  findings = [],
  statistics,
  extra, // optional extra content (e.g. URL-specific feature details)
}) {
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-[#0d1526] p-6">
      <div className="flex flex-wrap items-center gap-3">
        <RiskBadge riskLevel={riskLevel} />
        <RecommendationBadge recommendation={recommendation} />
        {isPhishing && (
          <span className="inline-flex items-center rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-sm font-medium text-rose-400">
            Flagged as phishing
          </span>
        )}
        <span className="ml-auto text-sm text-slate-400">
          Risk score: <span className="font-medium text-white">{riskScore}/100</span>
        </span>
      </div>

      {statistics && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span>{statistics.totalFindings} finding{statistics.totalFindings === 1 ? "" : "s"}</span>
          {statistics.criticalFindings > 0 && (
            <span className="text-rose-400">{statistics.criticalFindings} critical</span>
          )}
          {statistics.mediumFindings > 0 && (
            <span className="text-amber-400">{statistics.mediumFindings} medium</span>
          )}
          {statistics.lowFindings > 0 && (
            <span>{statistics.lowFindings} low</span>
          )}
        </div>
      )}

      {findings.length > 0 ? (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Findings
          </p>
          {findings.map((f) => (
            <FindingRow key={f.id} finding={f} />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-slate-500">No findings were recorded.</p>
      )}

      {extra}
    </div>
  );
}