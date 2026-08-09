// src/lib/urlService.js
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

// params: { page, limit, search, list_type, is_active, domain_id }
export function listUrls(params = {}) {
  return apiRequest(`/url${toQueryString(params)}`);
}

export function getUrl(id) {
  return apiRequest(`/url/${id}`);
}

export function createUrl(payload) {
  return apiRequest("/url/", { method: "POST", body: payload });
}

export function updateUrl(id, payload) {
  return apiRequest(`/url/${id}`, { method: "PUT", body: payload });
}

export function updateUrlStatus(id, is_active) {
  return apiRequest(`/url/${id}/status`, {
    method: "PATCH",
    body: { is_active },
  });
}

export function deleteUrl(id) {
  return apiRequest(`/url/${id}`, { method: "DELETE" });
}