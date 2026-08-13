"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await register({ full_name: name, email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col gap-4 items-center max-w-sm p-6 border border-white/20 rounded-lg bg-slate-950">
        <Image
          src="/risk-radar-logo.png"
          alt="RiskRadar logo"
          width={50}
          height={50}
          priority
        />
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-slate-400 text-center">
            Sign up for RiskRadar to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col w-full gap-2">
          <label htmlFor="name" className="sr-only">
            Full name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Full name"
            required
            autoComplete="name"
            disabled={loading}
            onChange={(event) => setName(event.target.value)}
            value={name}
            className="border border-white/20 py-2 px-2 rounded-lg bg-slate-900 disabled:opacity-60"
          />

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
            className="border border-white/20 py-2 px-2 rounded-lg bg-slate-900 disabled:opacity-60"
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
            minLength={8}
            autoComplete="new-password"
            disabled={loading}
            onChange={(event) => setPassword(event.target.value)}
            value={password}
            className="border border-white/20 py-2 px-2 rounded-lg bg-slate-900 disabled:opacity-60"
          />

          <label htmlFor="confirmPassword" className="sr-only">
            Confirm password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm password"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={loading}
            onChange={(event) => setConfirmPassword(event.target.value)}
            value={confirmPassword}
            className="border border-white/20 py-2 px-2 rounded-lg bg-slate-900 disabled:opacity-60"
          />

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
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="flex gap-1">
          <p className="text-sm text-white/80">Already have an account?</p>
          <Link
            href="/login"
            className="text-sm text-white/80 transition hover:text-cyan-400 underline"
          >
            Sign in.
          </Link>
        </div>
      </div>
    </main>
  );
}