// src/lib/domainService.js
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

// params: { page, limit, search, list_type, is_active }
export function listDomains(params = {}) {
  return apiRequest(`/domain${toQueryString(params)}`);
}

export function getDomain(id) {
  return apiRequest(`/domain/${id}`);
}

export function createDomain(payload) {
  return apiRequest("/domain/", { method: "POST", body: payload });
}

export function updateDomain(id, payload) {
  return apiRequest(`/domain/${id}`, { method: "PUT", body: payload });
}

export function updateDomainStatus(id, is_active) {
  return apiRequest(`/domain/${id}/status`, {
    method: "PATCH",
    body: { is_active },
  });
}

export function deleteDomain(id) {
  return apiRequest(`/domain/${id}`, { method: "DELETE" });
}

export function listThreatTypes() {
  return apiRequest("/threat/all");
}