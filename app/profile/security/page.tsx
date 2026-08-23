"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  LogOut,
  MonitorSmartphone,
} from "lucide-react";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import {
  changePassword,
  getActiveSessions,
  removeActiveSession,
  removeOtherActiveSessions,
  type ActiveSession,
} from "@/lib/api";

export default function ProfileSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionActionLoading, setSessionActionLoading] = useState("");

  async function loadSessions() {
    setSessionsLoading(true);
    try {
      const data = await getActiveSessions();
      setSessions(data);
    } catch (error) {
      console.error("Unable to load sessions:", error);
      setMessage(error instanceof Error ? error.message : "Unable to load active sessions.");
      setMessageType("error");
    } finally {
      setSessionsLoading(false);
    }
  }

  async function toggleSessions() {
    const nextOpen = !sessionsOpen;
    setSessionsOpen(nextOpen);
    if (nextOpen) await loadSessions();
  }

  async function handleRemoveSession(sessionId: string) {
    setSessionActionLoading(sessionId);
    try {
      await removeActiveSession(sessionId);
      await loadSessions();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign out this device.");
      setMessageType("error");
    } finally {
      setSessionActionLoading("");
    }
  }

  async function handleRemoveOtherSessions() {
    setSessionActionLoading("others");
    try {
      await removeOtherActiveSessions();
      await loadSessions();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign out other devices.");
      setMessageType("error");
    } finally {
      setSessionActionLoading("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all password fields.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Your new password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Your new passwords do not match.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      setMessage(result.message || "Password updated successfully.");
      setMessageType("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update password. Please try again."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page profile-security-page">
      <Header />

      <main className="settings-page">
        <div className="settings-shell">
          <Link href="/profile/settings" className="settings-back">
            <ArrowLeft size={17} />
            <span>Back to settings</span>
          </Link>

          <header className="settings-heading">
            <div>
              <span className="settings-eyebrow">ACCOUNT SECURITY</span>
              <h1>Security</h1>
              <p>Manage your password and keep your MetroVybe account protected.</p>
            </div>
          </header>

          <section className="profile-security-identity">
            <div className="profile-security-icon">
              <ShieldCheck size={25} strokeWidth={2.3} />
            </div>

            <div className="profile-security-identity-copy">
              <span>ACCOUNT PROTECTION</span>
              <strong>Your account is protected</strong>
              <small>Use a strong, unique password to help keep your account secure.</small>
            </div>
          </section>

          <section className="profile-security-form">
            <div className="profile-security-form-inner">
              <div className="profile-security-form-heading">
                <span>PASSWORD</span>
                <h2>Update your password.</h2>
                <p>
                  Choose a password you don't use anywhere else. Your password
                  must contain at least 6 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <label className="field profile-security-field">
                  <span>Current password</span>
                  <div className="profile-security-input-wrap">
                    <LockKeyhole size={18} />
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      autoComplete="current-password"
                      placeholder="Enter your current password"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      className="profile-security-password-toggle"
                      onClick={() => setShowCurrent((value) => !value)}
                      aria-label="Toggle current password visibility"
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <label className="field profile-security-field">
                  <span>New password</span>
                  <div className="profile-security-input-wrap">
                    <KeyRound size={18} />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      placeholder="Create a new password"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      className="profile-security-password-toggle"
                      onClick={() => setShowNew((value) => !value)}
                      aria-label="Toggle new password visibility"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <label className="field profile-security-field">
                  <span>Confirm new password</span>
                  <div className="profile-security-input-wrap">
                    <ShieldCheck size={18} />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      placeholder="Repeat your new password"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      className="profile-security-password-toggle"
                      onClick={() => setShowConfirm((value) => !value)}
                      aria-label="Toggle password visibility"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                {message && (
                  <div className={`profile-security-message ${messageType}`}>
                    {message}
                  </div>
                )}

                <div className="profile-security-action">
                  <button
                    type="submit"
                    disabled={saving}
                    className="profile-security-save"
                  >
                    {saving && <Loader2 size={17} className="animate-spin" />}
                    {saving ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>

              <section className="profile-security-account-protection">
                <div className="profile-security-account-heading">
                  <span>ACCOUNT PROTECTION</span>
                  <h3>Keep your account secure.</h3>
                  <p>Manage the security details that help protect your MetroVybe account.</p>
                </div>

                <div className="profile-security-protection-list">
                  <a href="/profile/edit" className="profile-security-protection-item">
                    <div>
                      <strong>Email & phone verification</strong>
                      <small>Review and manage your verified contact details.</small>
                    </div>
                    <span aria-hidden="true">›</span>
                  </a>

                  <div className="profile-security-active-sessions">
                    <button
                      type="button"
                      className="profile-security-protection-item profile-security-active-trigger"
                      onClick={toggleSessions}
                      aria-expanded={sessionsOpen}
                    >
                      <div>
                        <strong>Active sessions</strong>
                        <small>Manage devices signed in to your account.</small>
                      </div>
                      <span aria-hidden="true">{sessionsOpen ? "−" : "›"}</span>
                    </button>

                    {sessionsOpen && (
                      <div className="profile-security-sessions-panel">
                        {sessionsLoading ? (
                          <div className="profile-security-sessions-loading">
                            <Loader2 size={17} className="animate-spin" />
                            Loading active sessions...
                          </div>
                        ) : sessions.length === 0 ? (
                          <p className="profile-security-no-sessions">
                            No active sessions found.
                          </p>
                        ) : (
                          <>
                            <div className="profile-security-session-list">
                              {sessions.map((session) => (
                                <div
                                  className="profile-security-session"
                                  key={session.sessionId}
                                >
                                  <div className="profile-security-session-icon">
                                    <MonitorSmartphone size={18} />
                                  </div>
                                  <div className="profile-security-session-copy">
                                    <strong>{session.deviceName}</strong>
                                    <small>
                                      {session.current ? "This device" : "Active device"}
                                      {session.lastActiveAt
                                        ? ` · Last active ${new Date(session.lastActiveAt).toLocaleString()}`
                                        : ""}
                                    </small>
                                  </div>
                                  {!session.current && (
                                    <button
                                      type="button"
                                      className="profile-security-remove-session"
                                      onClick={() => handleRemoveSession(session.sessionId)}
                                      disabled={sessionActionLoading === session.sessionId}
                                    >
                                      {sessionActionLoading === session.sessionId ? (
                                        <Loader2 size={15} className="animate-spin" />
                                      ) : (
                                        <LogOut size={15} />
                                      )}
                                      Sign out
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {sessions.some((session) => !session.current) && (
                              <button
                                type="button"
                                className="profile-security-sign-out-others"
                                onClick={handleRemoveOtherSessions}
                                disabled={sessionActionLoading === "others"}
                              >
                                {sessionActionLoading === "others" && (
                                  <Loader2 size={16} className="animate-spin" />
                                )}
                                {sessionActionLoading === "others"
                                  ? "Signing out..."
                                  : "Sign out of all other devices"}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              

              <div className="profile-security-danger-zone">
                <div>
                  <span className="profile-security-danger-label">DANGER ZONE</span>
                  <strong>Delete your account</strong>
                  <p>
                    Permanently delete your MetroVybe account and associated data.
                    This action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  className="profile-security-delete"
                  onClick={() =>
                    alert("Account deletion will require confirmation before anything is permanently deleted.")
                  }
                >
                  Delete account
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
