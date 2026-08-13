// src/lib/passwordResetService.js
import { apiRequest } from "./apiClient";

export function requestPasswordReset(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    skipAuth: true,
    body: { email },
  });
}

export function verifyResetOtp(email, otp) {
  return apiRequest("/auth/verify-reset-otp", {
    method: "POST",
    skipAuth: true,
    body: { email, otp },
  });
}

export function resetPassword(resetToken, password) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    skipAuth: true,
    body: { resetToken, password },
  });
}