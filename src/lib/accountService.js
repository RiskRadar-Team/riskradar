// src/lib/accountService.js
//
// Self-service account endpoints under /user — snake_case request/response,
// consistent with the rest of the backend (Users *admin* endpoint is the
// one outlier that uses camelCase).
import { apiRequest } from "./apiClient";

export function getProfile() {
  return apiRequest("/user/profile");
}

export function updateProfile({ full_name }) {
  return apiRequest("/user/profile", {
    method: "PUT",
    body: { full_name },
  });
}

export function changePassword({ current_password, new_password }) {
  return apiRequest("/user/change-password", {
    method: "PUT",
    body: { current_password, new_password },
  });
}

export function deleteAccount() {
  return apiRequest("/user/delete-account", { method: "DELETE" });
}