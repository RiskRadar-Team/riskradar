"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "@/lib/accountService";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const EMPTY_PASSWORD_FORM = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

export default function AccountSettingsPage() {
  const router = useRouter();
  const { logout, updateUser } = useAuth();

  // Profile
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null); // { type: "success" | "error", text }

  // Password
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Delete account
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        setFullName(res.data.full_name || "");
      } catch (err) {
        setProfileMessage({ type: "error", text: err.message || "Couldn't load your profile." });
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileMessage(null);
    const trimmed = fullName.trim();
    if (!trimmed) {
      setProfileMessage({ type: "error", text: "Name can't be empty." });
      return;
    }
    setSavingProfile(true);
    try {
      const res = await updateProfile({ full_name: trimmed });
      setProfile(res.data);
      setFullName(res.data.full_name || "");
      updateUser({ full_name: res.data.full_name });
      setProfileMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      setProfileMessage({ type: "error", text: err.message || "Couldn't update your profile." });
    } finally {
      setSavingProfile(false);
    }
  }

  function updatePasswordField(field, value) {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage({ type: "error", text: "New passwords don't match." });
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setPasswordMessage({ type: "success", text: "Password changed successfully." });
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err.message || "Couldn't change your password. Check your current password and try again.",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteConfirmed() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount();
      // Account is deactivated server-side; clear local session and send
      // the user to login rather than leaving them on a dead dashboard.
      await logout();
    } catch (err) {
      setDeleteError(err.message || "Couldn't delete your account.");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        Account
      </p>
      <h1 className="mt-1 text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-sm text-slate-400">
        Manage your profile, password, and account.
      </p>

      {/* Profile */}
      <section className="mt-8 rounded-xl border border-white/10 bg-[#0d1526] p-6">
        <h2 className="text-sm font-semibold text-white">Profile</h2>

        {loadingProfile ? (
          <div className="mt-6 flex items-center justify-center py-6 text-slate-500">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-slate-500 outline-none disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-slate-600">Email can't be changed here.</p>
            </div>

            {profileMessage && (
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                  profileMessage.type === "success"
                    ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                    : "border border-rose-400/20 bg-rose-400/10 text-rose-400"
                }`}
              >
                {profileMessage.type === "success" ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <AlertCircle size={15} />
                )}
                {profileMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-medium text-[#0a0e1a] transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </section>

      {/* Password */}
      <section className="mt-6 rounded-xl border border-white/10 bg-[#0d1526] p-6">
        <h2 className="text-sm font-semibold text-white">Change password</h2>

        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Current password
            </label>
            <input
              required
              type="password"
              value={passwordForm.current_password}
              onChange={(e) => updatePasswordField("current_password", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              New password
            </label>
            <input
              required
              type="password"
              minLength={8}
              value={passwordForm.new_password}
              onChange={(e) => updatePasswordField("new_password", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Confirm new password
            </label>
            <input
              required
              type="password"
              minLength={8}
              value={passwordForm.confirm_password}
              onChange={(e) => updatePasswordField("confirm_password", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0e1a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          {passwordMessage && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                passwordMessage.type === "success"
                  ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                  : "border border-rose-400/20 bg-rose-400/10 text-rose-400"
              }`}
            >
              {passwordMessage.type === "success" ? (
                <CheckCircle2 size={15} />
              ) : (
                <AlertCircle size={15} />
              )}
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-medium text-[#0a0e1a] transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {changingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/5 p-6">
        <h2 className="text-sm font-semibold text-rose-300">Danger zone</h2>
        <p className="mt-1 text-sm text-slate-400">
          Deleting your account deactivates it. This can't be undone from the app.
        </p>

        {deleteError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
            <AlertCircle size={15} />
            {deleteError}
          </div>
        )}

        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          className="mt-4 rounded-lg border border-rose-400/30 px-5 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-400/10"
        >
          Delete account
        </button>
      </section>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete your account?"
        description="This deactivates your account and signs you out. You won't be able to log back in unless a team member reactivates it."
        confirmLabel="Delete account"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}