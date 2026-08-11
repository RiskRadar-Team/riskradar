// src/lib/userService.js
//
// NOTE: unlike the other admin resources (domain/url/keyword, which are
// snake_case), the /users/admin endpoints return camelCase fields
// (fullName, isActive, lastLogin, etc.) — matched exactly below, don't
// normalize to snake_case here.
//
// Also, the route file's actual paths are a little inconsistent (see:
// GET /users/admin for list, but PATCH/DELETE nest ":id" before "/admin").
// Building against the literal route code, not the (disagreeing) comments.
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

// params: { page, limit, search, role, is_active }
export function listUsers(params = {}) {
  return apiRequest(`/users/admin${toQueryString(params)}`);
}

export function updateUserStatus(id, isActive) {
  return apiRequest(`/users/${id}/admin/status`, {
    method: "PATCH",
    body: { isActive },
  });
}

export function updateUserRole(id, role) {
  return apiRequest(`/users/${id}/admin/role`, {
    method: "PATCH",
    body: { role },
  });
}

export function deleteUser(id) {
  return apiRequest(`/users/${id}/admin`, { method: "DELETE" });
}