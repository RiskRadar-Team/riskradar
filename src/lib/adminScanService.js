// src/lib/adminScanService.js
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

// params: { page, limit, userId, scanType, riskLevel, isPhishing, status, from, to }
export function listAdminScans(params = {}) {
  return apiRequest(`/admin/scans${toQueryString(params)}`);
}

export function getAdminScanById(scanId) {
  return apiRequest(`/admin/scans/${scanId}`);
}