// src/lib/scanService.js
import { apiRequest } from "./apiClient";

function toQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

// --- synchronous — analysis runs server-side, result comes
// back in the same response, no polling needed ---

export function scanUrl(url) {
  return apiRequest("/scan/url", { method: "POST", body: { url } });
}

export function scanEmail(payload) {
  return apiRequest("/scan/email", { method: "POST", body: payload });
}

export function scanMessage(payload) {
  return apiRequest("/scan/message", { method: "POST", body: payload });
}

// --- Scan history / lookups (used by the history page later) ---

export function getScan(id) {
  return apiRequest(`/scans/${id}`);
}

// params: { page, limit, search, scan_type, status, risk_level_id, sort_by, sort_order }
export function listScans(params = {}) {
  return apiRequest(`/scans${toQueryString(params)}`);
}

export function deleteScan(id) {
  return apiRequest(`/scans/${id}`, { method: "DELETE" });
}

export function listFindingsForScan(scanId) {
  return apiRequest(`/scan-findings/${scanId}/scan`);
}