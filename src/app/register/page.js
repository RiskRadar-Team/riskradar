"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();

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
      const response = await fetch(`${API_URL}/riskradar/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name, email, password }),
        credentials: "include", // remove if you use token-in-body auth instead
      });

      const data = await response.json();

      if (response.ok && data?.data) {
        router.push("/dashboard");
      } else {
        setError(data?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
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

        <p className="text-white/60 text-sm">OR</p>

        <div className="flex gap-x-5">
          
          <a
            href={`${API_URL}/riskradar/auth/google`}
            aria-label="Continue with Google"
            className="border p-2 rounded-lg border-violet-400/40 bg-slate-950 transition hover:bg-slate-900"
          >
            <GoogleIcon />
          </a>
          
          <a
            href={`${API_URL}/riskradar/auth/facebook`}
            aria-label="Continue with Facebook"
            className="border p-2 rounded-lg border-violet-400/40 bg-slate-950 transition hover:bg-slate-900"
          >
            <FacebookIcon />
          </a>
          
          <a
            href={`${API_URL}/riskradar/auth/apple`}
            aria-label="Continue with Apple"
            className="border p-2 rounded-lg border-violet-400/40 bg-slate-950 transition hover:bg-slate-900"
          >
            <AppleIcon />
          </a>
        </div>

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

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3a7.4 7.4 0 0 1-4.06 1.14c-3.12 0-5.76-2.11-6.7-4.94H1.3v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.3 6.6l4 3.1c.94-2.83 3.58-4.95 6.7-4.95Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M16.36 1.43c0 1.14-.47 2.24-1.19 3.04-.8.87-2.11 1.55-3.17 1.46-.13-1.09.44-2.24 1.15-3 .8-.88 2.19-1.55 3.21-1.5ZM20.85 17.32c-.5 1.16-.74 1.67-1.39 2.7-.9 1.43-2.18 3.2-3.75 3.22-1.4.02-1.76-.9-3.66-.89-1.9.01-2.3.9-3.7.88-1.57-.02-2.78-1.62-3.68-3.05-2.5-3.98-2.77-8.66-1.22-11.15.97-1.55 2.62-2.53 4.19-2.53 1.6 0 2.6.9 3.93.9 1.29 0 2.06-.9 3.93-.9 1.4 0 2.88.76 3.94 2.08-3.46 1.9-2.9 6.83.41 8.74Z" />
    </svg>
  );
}