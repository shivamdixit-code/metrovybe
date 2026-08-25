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

const PHONE_COUNTRIES = {
  IN: { code: "+91", label: "🇮🇳 +91", placeholder: "9876543210" },
  GB: { code: "+44", label: "🇬🇧 +44", placeholder: "7911123456" },
  US: { code: "+1", label: "🇺🇸 +1", placeholder: "2015550123" },
  CA: { code: "+1", label: "🇨🇦 +1", placeholder: "4165550123" },
  AU: { code: "+61", label: "🇦🇺 +61", placeholder: "412345678" },
  NZ: { code: "+64", label: "🇳🇿 +64", placeholder: "211234567" },
  SG: { code: "+65", label: "🇸🇬 +65", placeholder: "81234567" },
  MY: { code: "+60", label: "🇲🇾 +60", placeholder: "123456789" },
  AE: { code: "+971", label: "🇦🇪 +971", placeholder: "501234567" },
} as const;

type PhoneCountry = keyof typeof PHONE_COUNTRIES;

function getInternationalPhone(country: PhoneCountry, phone: string) {
  return `${PHONE_COUNTRIES[country].code}${phone.replace(/\D/g, "")}`;
}

function parsePhone(phone: string): { country: PhoneCountry; number: string } {
  const entries = Object.entries(PHONE_COUNTRIES)
    .sort((a, b) => b[1].code.length - a[1].code.length);

  for (const [country, details] of entries) {
    if (phone.startsWith(details.code)) {
      return {
        country: country as PhoneCountry,
        number: phone.slice(details.code.length),
      };
    }
  }

  return { country: "IN", number: phone.replace(/^\+/, "") };
}

export default function ProfileEdit() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>("IN");
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

    const parsedPhone = parsePhone(nextUser.phone || "");
    setPhoneCountry(parsedPhone.country);
    setPhone(parsedPhone.number);

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

    const cleanPhone = phone.replace(/\D/g, "");
    const internationalPhone = getInternationalPhone(phoneCountry, cleanPhone);

    if (cleanPhone.length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (internationalPhone === user?.phone) {
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
            phone: internationalPhone,
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
    <div className="page profile-edit-page">
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

              <form onSubmit={handleSaveName} className="profile-edit-name-form">
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

                <button
                  type="submit"
                  disabled={savingName || name.trim() === user.name}
                  className="profile-edit-name-save"
                  aria-label="Save name"
                  title="Save name"
                >
                  {savingName ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                </button>
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
                  <div className="profile-edit-phone-wrap">
                    <div className="profile-edit-input-wrap profile-edit-country-select">
                      <Phone size={18} />
                      <select
                        value={phoneCountry}
                        onChange={(event) => {
                          setPhoneCountry(event.target.value as PhoneCountry);
                          if (phoneOtpSent) {
                            setPhoneOtpSent(false);
                            setPhoneOtp("");
                          }
                        }}
                        disabled={sendingPhoneOtp || verifyingPhone}
                        aria-label="Country code"
                      >
                        {Object.entries(PHONE_COUNTRIES).map(([key, item]) => (
                          <option key={key} value={key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="profile-edit-input-wrap profile-edit-phone-number">
                      <input
                        value={phone}
                        onChange={(event) => {
                          setPhone(event.target.value.replace(/\D/g, ""));
                          if (phoneOtpSent) {
                            setPhoneOtpSent(false);
                            setPhoneOtp("");
                          }
                        }}
                        autoComplete="tel-national"
                        inputMode="tel"
                        placeholder={PHONE_COUNTRIES[phoneCountry].placeholder}
                        disabled={sendingPhoneOtp || verifyingPhone}
                      />
                    </div>
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
                      getInternationalPhone(phoneCountry, phone) === user.phone
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

            </div>
          </div>
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
