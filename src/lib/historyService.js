// src/lib/historyService.js
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

// params: { page, limit, scanType, riskLevel, isPhishing, from, to }
export function listHistory(params = {}) {
  return apiRequest(`/history${toQueryString(params)}`);
}

export function getHistoryScanById(scanId) {
  return apiRequest(`/history/${scanId}`);
}