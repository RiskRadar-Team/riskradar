// src/lib/adminDashboardService.js
import { apiRequest } from "./apiClient";

// period: "7d" | "30d" | "90d" | "all"
export function getAdminDashboard(period = "30d") {
  return apiRequest(`/admin/dashboard?period=${period}`);
}