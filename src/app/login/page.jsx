"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-4 max-w-sm  p-6 border border-white/20 rounded-lg bg-slate-950">
        <Image
          src="/risk-radar-logo.png"
          alt="RiskRadar logo"
          width={50}
          height={50}
          priority
        />
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-slate-400 text-center">
            Sign in to your RiskRadar account to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col w-full gap-2">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            required
            autoComplete="email"
            disabled={loading}
            onChange={(event) => setEmail(event.target.value)}
            value={email}
            className="w-full border border-white/20 py-2 px-2 rounded-lg bg-slate-900 disabled:opacity-60"
          />

          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            disabled={loading}
            onChange={(event) => setPassword(event.target.value)}
            value={password}
            className="w-full border border-white/20 py-2 px-2 rounded-lg bg-slate-900 disabled:opacity-60"
          />

          <Link
            href="/forgot-password"
            className="text-sm text-end w-full text-white/80 transition hover:text-cyan-400"
          >
            Forgot Password?
          </Link>

          {error && (
            <p role="alert" className="text-sm text-red-400 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-400 mt-4 px-6 py-2 font-bold text-slate-950 rounded-lg cursor-pointer transition hover:bg-cyan-500 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span
                className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex gap-1">
          <p className="text-white/60 text-sm">Don&apos;t have an account?</p>
          <Link
            href="/register"
            className="text-sm text-white/80 transition hover:text-cyan-400 underline"
          >
            Create One.
          </Link>
        </div>
      </div>
    </main>
  );
}