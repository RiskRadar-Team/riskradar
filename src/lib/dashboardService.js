// src/lib/dashboardService.js
import { apiRequest } from "./apiClient";

// period: "7d" | "30d" | "90d" | "all" — matches DashboardService.getStartDate
export function getDashboard(period = "30d") {
  return apiRequest(`/dashboard?period=${period}`);
}