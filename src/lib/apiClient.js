// src/lib/apiClient.js
//
// Central fetch wrapper for the RiskRadar API.
// - Keeps the access token in memory only (never localStorage/sessionStorage).
// - Sends credentials:"include" so the httpOnly refresh cookie travels with every request.
// - On a 401, silently calls /auth/refresh-token once, then retries the original request.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/riskradar";

let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken() {
  // Coalesce concurrent refresh attempts into a single in-flight request.
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })
    .then(async (res) => {
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.data?.accessToken) {
        throw new Error("Session could not be refreshed");
      }
      accessToken = json.data.accessToken;
      return accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * @param {string} path - e.g. "/domain" or "/domain/123"
 * @param {object} options
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [options.method]
 * @param {object} [options.body]
 * @param {boolean} [options.skipAuth] - don't attach Authorization header (login/register/refresh)
 */
export async function apiRequest(
  path,
  { method = "GET", body, skipAuth = false, _isRetry = false } = {}
) {
  const headers = { "Content-Type": "application/json" };
  if (!skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (res.status === 401 && !skipAuth && !_isRetry) {
    try {
      await refreshAccessToken();
      return apiRequest(path, { method, body, skipAuth, _isRetry: true });
    } catch (err) {
      accessToken = null;
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw err;
    }
  }

  if (!res.ok || json?.success === false) {
    const error = new Error(json?.message || `Request failed (${res.status})`);
    error.statusCode = json?.statusCode ?? res.status;
    error.details = json;
    throw error;
  }

  return json;
}