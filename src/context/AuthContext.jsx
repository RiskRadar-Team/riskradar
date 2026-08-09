"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiRequest, setAccessToken } from "@/lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while the silent refresh-on-load runs
  const router = useRouter();
  const bootstrapped = useRef(false); // guards against React Strict Mode's double-invoke in dev

  // On first mount: try to turn the httpOnly refresh cookie into a fresh access token,
  // then load the profile. If either step fails, the user is simply signed out.
  const bootstrap = useCallback(async () => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    try {
      const refreshRes = await apiRequest("/auth/refresh-token", {
        method: "POST",
        skipAuth: true,
      });
      setAccessToken(refreshRes.data.accessToken);

      const profileRes = await apiRequest("/user/profile");
      setUser(profileRes.data);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email, password) => {
    const res = await apiRequest("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: { email, password },
    });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async ({ full_name, email, password }) => {
    const res = await apiRequest("/auth/register", {
      method: "POST",
      skipAuth: true,
      body: { full_name, email, password },
    });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (err) {
      // Even if the call fails, we still clear local state below so the UI
      // doesn't get stuck signed in — but log it so a real failure (vs. an
      // already-expired session) isn't invisible.
      console.error("Logout request failed:", err);
    }
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const logoutAll = useCallback(async () => {
    try {
      await apiRequest("/auth/logout-all", { method: "POST" });
    } catch (err) {
      console.error("Logout-all request failed:", err);
    }
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    login,
    register,
    logout,
    logoutAll,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}