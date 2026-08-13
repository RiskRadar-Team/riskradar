"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  requestPasswordReset,
  verifyResetOtp,
  resetPassword,
} from "@/lib/passwordResetService";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState("email"); // "email" | "otp" | "password" | "done"

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleRequestOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      // Backend always returns the same generic message regardless of
      // whether the email exists, to prevent email enumeration.
      setInfo(res.message);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verifyResetOtp(email.trim(), otp.trim());
      setResetToken(res.data.resetToken);
      setInfo("");
      setStep("password");
    } catch (err) {
      setError(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      setStep("done");
    } catch (err) {
      setError(err.message || "Couldn't reset your password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-4 max-w-sm p-6 border border-white/20 rounded-lg bg-slate-950">
        <Image
          src="/risk-radar-logo.png"
          alt="RiskRadar logo"
          width={50}
          height={50}
          priority
        />

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-slate-400 text-center">
            {step === "email" &&
              "Enter your email and we'll send you a one-time code."}
            {step === "otp" && "Enter the code we sent to your email."}
            {step === "password" && "Choose a new password."}
            {step === "done" && "Your password has been reset."}
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400 text-center w-full">
            {error}
          </p>
        )}
        {info && !error && (
          <p className="text-sm text-cyan-400 text-center w-full">{info}</p>
        )}

        {/* Step 1: request OTP */}
        {step === "email" && (
          <form
            onSubmit={handleRequestOtp}
            noValidate
            className="flex flex-col w-full gap-2"
          >
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
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full border border-white/20 py-2 px-2 rounded-lg bg-slate-900 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-400 mt-4 px-6 py-2 font-bold text-slate-950 rounded-lg cursor-pointer transition hover:bg-cyan-500 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Sending…" : "Send reset code"}
            </button>
          </form>
        )}

        {/* Step 2: verify OTP */}
        {step === "otp" && (
          <form
            onSubmit={handleVerifyOtp}
            noValidate
            className="flex flex-col w-full gap-2"
          >
            <label htmlFor="otp" className="sr-only">
              6-digit code
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              placeholder="6-digit code"
              required
              inputMode="numeric"
              maxLength={6}
              disabled={loading}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              value={otp}
              className="w-full border border-white/20 py-2 px-2 rounded-lg bg-slate-900 text-center tracking-[0.5em] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-400 mt-4 px-6 py-2 font-bold text-slate-950 rounded-lg cursor-pointer transition hover:bg-cyan-500 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Verifying…" : "Verify code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError("");
                setInfo("");
              }}
              className="text-sm text-white/60 hover:text-cyan-400 transition"
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Step 3: set new password */}
        {step === "password" && (
          <form
            onSubmit={handleResetPassword}
            noValidate
            className="flex flex-col w-full gap-2"
          >
            <label htmlFor="password" className="sr-only">
              New password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="New password"
              required
              autoComplete="new-password"
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full border border-white/20 py-2 px-2 rounded-lg bg-slate-900 disabled:opacity-60"
            />
            <label htmlFor="confirmPassword" className="sr-only">
              Confirm new password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              required
              autoComplete="new-password"
              disabled={loading}
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              className="w-full border border-white/20 py-2 px-2 rounded-lg bg-slate-900 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-400 mt-4 px-6 py-2 font-bold text-slate-950 rounded-lg cursor-pointer transition hover:bg-cyan-500 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}

        {/* Step 4: done */}
        {step === "done" && (
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="bg-cyan-400 w-full px-6 py-2 font-bold text-slate-950 rounded-lg cursor-pointer transition hover:bg-cyan-500 hover:text-white"
          >
            Back to login
          </button>
        )}

        {step !== "done" && (
          <div className="flex gap-1">
            <p className="text-sm text-white/80">Remembered your password?</p>
            <Link
              href="/login"
              className="text-sm text-white/80 transition hover:text-cyan-400 underline"
            >
              Log in.
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}