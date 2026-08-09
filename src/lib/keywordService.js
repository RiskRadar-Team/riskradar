// src/lib/keywordService.js
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

// params: { page, limit, search, category, is_active, severity, match_type }
export function listKeywords(params = {}) {
  return apiRequest(`/keyword${toQueryString(params)}`);
}

export function getKeyword(id) {
  return apiRequest(`/keyword/${id}`);
}

export function createKeyword(payload) {
  return apiRequest("/keyword/", { method: "POST", body: payload });
}

export function updateKeyword(id, payload) {
  return apiRequest(`/keyword/${id}`, { method: "PUT", body: payload });
}

export function updateKeywordStatus(id, is_active) {
  return apiRequest(`/keyword/${id}/status`, {
    method: "PATCH",
    body: { is_active },
  });
}

export function deleteKeyword(id) {
  return apiRequest(`/keyword/${id}`, { method: "DELETE" });
}

export function listKeywordCategories() {
  return apiRequest("/keyword-category/all");
}