"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  UserRound,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import {
  authenticatedFetch,
  getToken,
  getUser,
  type AuthUser,
} from "@/lib/auth";

export default function ProfileEdit() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const syncUser = (nextUser: AuthUser) => {
    setUser(nextUser);
    setName(nextUser.name || "");
    setPhone(nextUser.phone || "");
    setEmail(nextUser.email || "");

    localStorage.setItem(
      "metrovybe_user",
      JSON.stringify(nextUser)
    );

    window.dispatchEvent(new Event("metrovybe-auth-changed"));
  };

  const loadProfile = async () => {
    const response = await authenticatedFetch("/api/auth/me");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load profile.");
    }

    syncUser(data.user);
  };

  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();

    if (!token || !currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.role !== "customer") {
      router.replace(
        currentUser.role === "business"
          ? "/business/dashboard"
          : "/login"
      );
      return;
    }

    syncUser(currentUser);

    loadProfile()
      .catch((err) => {
        setError(err.message || "Unable to load profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const handleSaveName = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();

    const cleanName = name.trim();

    if (!cleanName) {
      setError("Name is required.");
      return;
    }

    setSavingName(true);

    try {
      const response = await authenticatedFetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update your name.");
      }

      syncUser(data.user);
      setMessage(data.message || "Name updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your name."
      );
    } finally {
      setSavingName(false);
    }
  };

  const handleRequestPhoneChange = async () => {
    clearFeedback();

    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setError("Please enter your new phone number.");
      return;
    }

    if (cleanPhone === user?.phone) {
      setError("Please enter a different phone number.");
      return;
    }

    setSendingPhoneOtp(true);

    try {
      const response = await authenticatedFetch(
        "/api/auth/request-phone-change",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: cleanPhone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send verification OTP."
        );
      }

      setPhoneOtp("");
      setPhoneOtpSent(true);
      setMessage(
        data.message ||
          "Verification OTP sent to your new phone number."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send verification OTP."
      );
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneChange = async () => {
    clearFeedback();

    if (!phoneOtp.trim()) {
      setError("Please enter the verification OTP.");
      return;
    }

    setVerifyingPhone(true);

    try {
      const response = await authenticatedFetch(
        "/api/auth/verify-phone-change",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otp: phoneOtp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to verify your phone number."
        );
      }

      setPhoneOtp("");
      setPhoneOtpSent(false);

      if (data.user) {
        syncUser(data.user);
      } else {
        await loadProfile();
      }

      setMessage(
        data.message || "Phone number updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify your phone number."
      );
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleRequestEmailChange = async () => {
    clearFeedback();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your new email address.");
      return;
    }

    if (cleanEmail === user?.email?.toLowerCase()) {
      setError("Please enter a different email address.");
      return;
    }

    setSendingEmail(true);

    try {
      const response = await authenticatedFetch(
        "/api/auth/request-email-change",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send email verification."
        );
      }

      setMessage(
        data.message ||
          "Verification link sent to your new email address."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send email verification."
      );
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="page">
        <Header />
        <main className="settings-page">
          <div className="settings-shell">
            <div className="settings-loading">
              Loading your profile...
            </div>
          </div>
        </main>
        <BottomNav active="profile" />
      </div>
    );
  }

  return (
    <div className="page">
      <Header />

      <main className="settings-page">
        <div className="settings-shell">
          <Link href="/profile/settings" className="settings-back">
            <ArrowLeft size={17} />
            <span>Back to settings</span>
          </Link>

          <header className="settings-heading">
            <div>
              <span className="settings-eyebrow">ACCOUNT</span>
              <h1>Personal information</h1>
              <p>Keep your account details secure and up to date.</p>
            </div>
          </header>

          <section className="profile-edit-identity">
            <div className="profile-edit-avatar">
              <UserRound size={25} strokeWidth={2.3} />
            </div>

            <div className="profile-edit-identity-copy">
              <span>YOUR METROVYBE ACCOUNT</span>
              <strong>{user.name || "Customer"}</strong>
              <small>{user.email}</small>
            </div>
          </section>

          <div className="profile-edit-form">
            <div className="profile-edit-form-inner">
              <div className="profile-edit-form-heading">
                <span>PERSONAL DETAILS</span>
                <h2>Make it yours.</h2>
                <p>
                  Your contact details are protected with verification before
                  any change is applied.
                </p>
              </div>

              <form onSubmit={handleSaveName}>
                <label className="field profile-edit-field">
                  <span>Name</span>
                  <div className="profile-edit-input-wrap">
                    <UserRound size={18} />
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      maxLength={100}
                      disabled={savingName}
                    />
                  </div>
                </label>

                <div className="profile-edit-inline-action">
                  <button
                    type="submit"
                    disabled={savingName || name.trim() === user.name}
                    className="profile-edit-save"
                  >
                    {savingName && (
                      <Loader2 size={17} className="animate-spin" />
                    )}
                    {savingName ? "Saving..." : "Save name"}
                  </button>
                </div>
              </form>

              <div className="profile-edit-security-section">
                <div className="profile-edit-security-heading">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>Secure contact details</strong>
                    <small>
                      Changes are applied only after verification.
                    </small>
                  </div>
                </div>

                <label className="field profile-edit-field">
                  <span>Phone</span>
                  <div className="profile-edit-input-wrap">
                    <Phone size={18} />
                    <input
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        if (phoneOtpSent) {
                          setPhoneOtpSent(false);
                          setPhoneOtp("");
                        }
                      }}
                      autoComplete="tel"
                      inputMode="tel"
                      disabled={
                        sendingPhoneOtp || verifyingPhone
                      }
                    />
                  </div>
                  <small>
                    Enter your new international phone number to receive a
                    verification OTP.
                  </small>
                </label>

                {!phoneOtpSent ? (
                  <button
                    type="button"
                    onClick={handleRequestPhoneChange}
                    disabled={
                      sendingPhoneOtp ||
                      verifyingPhone ||
                      phone.trim() === user.phone
                    }
                    className="profile-edit-secondary-action"
                  >
                    {sendingPhoneOtp && (
                      <Loader2 size={17} className="animate-spin" />
                    )}
                    {sendingPhoneOtp
                      ? "Sending OTP..."
                      : "Verify new phone number"}
                  </button>
                ) : (
                  <div className="profile-edit-verification-box">
                    <label className="field profile-edit-field">
                      <span>Verification OTP</span>
                      <div className="profile-edit-input-wrap">
                        <ShieldCheck size={18} />
                        <input
                          value={phoneOtp}
                          onChange={(event) =>
                            setPhoneOtp(event.target.value)
                          }
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="Enter OTP"
                          disabled={verifyingPhone}
                        />
                      </div>
                    </label>

                    <div className="profile-edit-verification-actions">
                      <button
                        type="button"
                        onClick={handleVerifyPhoneChange}
                        disabled={verifyingPhone || !phoneOtp.trim()}
                        className="profile-edit-save"
                      >
                        {verifyingPhone && (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        )}
                        {verifyingPhone
                          ? "Verifying..."
                          : "Confirm phone number"}
                      </button>

                      <button
                        type="button"
                        onClick={handleRequestPhoneChange}
                        disabled={sendingPhoneOtp || verifyingPhone}
                        className="profile-edit-text-action"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}

                <label className="field profile-edit-field">
                  <span>Email</span>
                  <div className="profile-edit-input-wrap">
                    <Mail size={18} />
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      autoComplete="email"
                      disabled={sendingEmail}
                    />
                  </div>
                  <small>
                    We'll send a confirmation link to your new email address.
                    Your current email stays active until you verify it.
                  </small>
                </label>

                <button
                  type="button"
                  onClick={handleRequestEmailChange}
                  disabled={
                    sendingEmail ||
                    email.trim().toLowerCase() ===
                      user.email.toLowerCase()
                  }
                  className="profile-edit-secondary-action"
                >
                  {sendingEmail && (
                    <Loader2 size={17} className="animate-spin" />
                  )}
                  {sendingEmail
                    ? "Sending verification..."
                    : "Verify new email address"}
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="profile-edit-message profile-edit-error"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="profile-edit-message profile-edit-success"
                >
                  <CheckCircle2 size={18} />
                  {message}
                </div>
              )}

              <div className="profile-edit-actions">
                <Link
                  href="/profile/settings"
                  className="profile-edit-cancel"
                >
                  Back to settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
