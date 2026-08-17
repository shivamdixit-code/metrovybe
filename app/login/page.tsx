"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, UserRound, ArrowLeft } from "lucide-react";

import {
  login,
  sendLoginPhoneOtp,
  verifyLoginPhoneOtp,
  forgotPassword,
  resetPassword,
} from "@/lib/auth";

type Role = "customer" | "business";

export default function LoginPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "whatsapp">(
    "whatsapp"
  );
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);

  const [forgotMessage, setForgotMessage] = useState("");

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyWidth = body.style.width;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.width = "100%";

    const keepLoginViewportStable = () => {
      window.scrollTo(0, 0);

      if (window.visualViewport) {
        document.documentElement.style.setProperty(
          "--mv-login-visual-height",
          `${window.visualViewport.height}px`
        );
        window.scrollTo(0, 0);
      }
    };

    keepLoginViewportStable();

    const viewport = window.visualViewport;

    viewport?.addEventListener("resize", keepLoginViewportStable);
    viewport?.addEventListener("scroll", keepLoginViewportStable);
    window.addEventListener("resize", keepLoginViewportStable);

    const handleFocus = () => {
      window.setTimeout(keepLoginViewportStable, 0);
      window.setTimeout(keepLoginViewportStable, 250);
      window.setTimeout(keepLoginViewportStable, 500);
    };

    document.addEventListener("focusin", handleFocus);

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
      body.style.position = previousBodyPosition;
      body.style.width = previousBodyWidth;

      viewport?.removeEventListener("resize", keepLoginViewportStable);
      viewport?.removeEventListener("scroll", keepLoginViewportStable);
      window.removeEventListener("resize", keepLoginViewportStable);
      document.removeEventListener("focusin", handleFocus);

      document.documentElement.style.removeProperty(
        "--mv-login-visual-height"
      );
    };
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");
    const resetEmail = params.get("email");

    if (token && resetEmail) {
      setResetToken(token);
      setEmail(resetEmail);
      setForgotEmail(resetEmail);
      setResetMode(true);
      setForgotMode(true);
      setSelectedRole("customer");
      setLoginMethod("password");
      setError("");
      setForgotMessage("");
    }
  }, []);

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setForgotMessage("");
    setForgotLoading(true);

    try {
      await forgotPassword(email.trim());

      setForgotMessage(
        "If an account exists with this email, a password reset link has been sent."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send password reset email."
      );
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!resetPasswordValue) {
      setError("Please enter a new password.");
      return;
    }

    if (resetPasswordValue.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (resetPasswordValue !== confirmResetPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setForgotMessage("");
    setForgotLoading(true);

    try {
      await resetPassword(
        email.trim(),
        resetToken,
        resetPasswordValue
      );

      setForgotMessage(
        "Password reset successfully. You can now log in."
      );

      setResetMode(false);
      setForgotMode(false);
      setResetToken("");
      setResetPasswordValue("");
      setConfirmResetPassword("");
      setPassword("");

      window.history.replaceState({}, "", "/login");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password."
      );
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRole) {
      setError("Please select an account type.");
      return;
    }

    setError("");

    if (loginMethod === "whatsapp") {
      if (!phone.trim()) {
        setError("Please enter your WhatsApp number.");
        return;
      }

      if (otpSent) {
        if (!otp.trim()) {
          setError("Please enter the OTP.");
          return;
        }

        setLoading(true);

        try {
          const result = await verifyLoginPhoneOtp(
            phone.trim(),
            otp.trim(),
            selectedRole
          );

          if (result.user.role === "business") {
            router.push("/business/dashboard");
          } else {
            router.push("/profile");
          }
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "OTP verification failed"
          );
        } finally {
          setLoading(false);
        }

        return;
      }

      if (resendCountdown > 0) {
        return;
      }

      setOtpLoading(true);

      try {
        await sendLoginPhoneOtp(phone.trim(), selectedRole);
        setOtpSent(true);
        setOtp("");
        setResendCountdown(60);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to send WhatsApp OTP"
        );
      } finally {
        setOtpLoading(false);
      }

      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password, selectedRole);

      if (result.user.role === "business") {
        router.push("/business/dashboard");
        return;
      }

      if (result.user.role === "admin") {
        setError("Admin accounts must use the CRM login.");
        return;
      }

      router.push("/profile");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="public-login-page"
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="public-login-card"
        style={{
          boxSizing: "border-box",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#111318",
            display: "block",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 850,
              letterSpacing: "-1.2px",
              lineHeight: 1,
            }}
          >
            metro
            <span style={{ color: "#29AB87" }}>vybe</span>
            <span
              style={{
                fontSize: "11px",
                position: "relative",
                top: "-10px",
                marginLeft: "3px",
                color: "#D9AA32",
              }}
            >
              ✦
            </span>
          </div>

          <div
            style={{
              fontSize: "9px",
              letterSpacing: "1.7px",
              color: "#8A9097",
              marginTop: "6px",
              fontWeight: 700,
            }}
          >
            YOUR CITY. YOUR VYBE.
          </div>
        </Link>

        {error && (
          <div
            style={{
              background: "#FFF4F5",
              border: "1px solid #FFD9DE",
              color: "#B4233C",
              padding: "11px 13px",
              borderRadius: "11px",
              marginBottom: "16px",
              fontSize: "13px",
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {!selectedRole ? (
          <div>
        <h1
          style={{
            fontSize: "28px",
            lineHeight: 1.1,
            letterSpacing: "-0.7px",
            margin: "0 0 7px",
            color: "#111318",
          }}
        >
          How will you log in?
        </h1>

        <p
          style={{
            color: "#747A82",
            fontSize: "14px",
            margin: "0 0 22px",
          }}
        >
          Select your MetroVybe account type.
        </p>

            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#2563EB",
                letterSpacing: "0.9px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Account type
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSelectedRole("customer");
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "13px",
                marginBottom: "10px",
                border: "1px solid #E5EAF2",
                borderRadius: "14px",
                background: "#FFFFFF",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 5px 18px rgba(17,24,39,0.045)",
              }}
            >
              <span
                style={{
                  width: "38px",
                  height: "38px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "11px",
                  background: "#EEF9F5",
                  color: "#29AB87",
                }}
              >
                <UserRound size={19} strokeWidth={2.1} />
              </span>

              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    color: "#15181D",
                    fontSize: "14px",
                    fontWeight: 800,
                    marginBottom: "2px",
                  }}
                >
                  Customer
                </span>
                <span
                  style={{
                    display: "block",
                    color: "#8A9097",
                    fontSize: "11px",
                  }}
                >
                  Discover places and manage your bookings
                </span>
              </span>

              <span style={{ color: "#B3B9C1", fontSize: "20px" }}>›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSelectedRole("business");
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "13px",
                border: "1px solid #E5EAF2",
                borderRadius: "14px",
                background: "#FFFFFF",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 5px 18px rgba(17,24,39,0.045)",
              }}
            >
              <span
                style={{
                  width: "38px",
                  height: "38px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "11px",
                  background: "#FFF7E2",
                  color: "#B78317",
                }}
              >
                <Building2 size={19} strokeWidth={2.1} />
              </span>

              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    color: "#15181D",
                    fontSize: "14px",
                    fontWeight: 800,
                    marginBottom: "2px",
                  }}
                >
                  Business
                </span>
                <span
                  style={{
                    display: "block",
                    color: "#8A9097",
                    fontSize: "11px",
                  }}
                >
                  Manage your business and listings
                </span>
              </span>

              <span style={{ color: "#B3B9C1", fontSize: "20px" }}>›</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2
              style={{
                fontSize: "24px",
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "#111318",
                margin: "0 0 6px",
              }}
            >
              Welcome back
            </h2>

            <p
              style={{
                color: "#747A82",
                fontSize: "14px",
                margin: "0 0 22px",
              }}
            >
              Log in to your MetroVybe account.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "19px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSelectedRole("");
                  setEmail("");
                  setPassword("");
                }}
                aria-label="Change account type"
                style={{
                  width: "auto",
                  height: "34px",
                  padding: "0",
                  border: "none",
                  background: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "5px",
                  margin: 0,
                  color: "#2563EB",
                  fontSize: "12px",
                  fontWeight: 700,
                  lineHeight: 1,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <img
                  src="/icons/back-arrow.png"
                  alt=""
                  width={20}
                  height={20}
                  style={{
                    display: "block",
                    width: "20px",
                    height: "20px",
                    objectFit: "contain",
                    transform: "translateY(-2px)",
                    flexShrink: 0,
                    filter:
                      "brightness(0) saturate(100%) invert(36%) sepia(45%) saturate(1050%) hue-rotate(183deg) brightness(88%)",
                  }}
                />
                <span>Change Account Type</span>
              </button>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(135deg,#FFF9E8 0%,#F7D978 48%,#D9AA32 100%)",
                  color: "#72550D",
                  fontSize: "10px",
                  fontWeight: 850,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  border: "1px solid rgba(207,163,43,.35)",
                  boxShadow:
                    "0 2px 8px rgba(217,170,50,.16), inset 0 1px 0 rgba(255,255,255,.8)",
                }}
              >
                {selectedRole}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "18px",
                padding: "4px",
                borderRadius: "12px",
                background: "#F2F4F6",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("password");
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                }}
                style={{
                  height: "38px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    loginMethod === "password" ? "#fff" : "transparent",
                  color:
                    loginMethod === "password" ? "#111318" : "#747A82",
                  fontSize: "12px",
                  fontWeight: 750,
                  cursor: "pointer",
                  boxShadow:
                    loginMethod === "password"
                      ? "0 2px 7px rgba(0,0,0,.08)"
                      : "none",
                }}
              >
                Email & Password
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod("whatsapp");
                  setError("");
                }}
                style={{
                  height: "38px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    loginMethod === "whatsapp" ? "#fff" : "transparent",
                  color:
                    loginMethod === "whatsapp" ? "#111318" : "#747A82",
                  fontSize: "12px",
                  fontWeight: 750,
                  cursor: "pointer",
                  boxShadow:
                    loginMethod === "whatsapp"
                      ? "0 2px 7px rgba(0,0,0,.08)"
                      : "none",
                }}
              >
                WhatsApp OTP
              </button>
            </div>

            {forgotMode ? (
              <>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#111318",
                    margin: "0 0 7px",
                  }}
                >
                  {resetMode ? "Reset password" : "Forgot password?"}
                </h2>

                <p
                  style={{
                    color: "#747A82",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    margin: "0 0 20px",
                  }}
                >
                  {resetMode
                    ? "Create a new password for your account."
                    : "Enter your email and we'll send you a password reset link."}
                </p>

                {!resetMode ? (
                  <>
                    <label
                      style={{
                        display: "block",
                        color: "#252A31",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "7px",
                      }}
                    >
                      Email
                    </label>

                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(event) => {
                        setForgotEmail(event.target.value);
                        setEmail(event.target.value);
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      style={{
                        width: "100%",
                        height: "46px",
                        padding: "0 45px 0 13px",
                        border: "1px solid #DDE2E9",
                        borderRadius: "11px",
                        marginBottom: "15px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        outline: "none",
                        color: "#15181D",
                        background: "#fff",
                      }}
                    />

                    {forgotMessage && (
                      <div
                        style={{
                          marginBottom: "14px",
                          padding: "11px 12px",
                          borderRadius: "9px",
                          background: "#F0FDF4",
                          color: "#166534",
                          fontSize: "12px",
                          lineHeight: 1.45,
                        }}
                      >
                        {forgotMessage}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={forgotLoading}
                      style={{
                        width: "100%",
                        height: "46px",
                        border: "none",
                        borderRadius: "11px",
                        background:
                          "linear-gradient(135deg, #111318 0%, #18201E 100%)",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: 750,
                        cursor: forgotLoading ? "not-allowed" : "pointer",
                        opacity: forgotLoading ? 0.7 : 1,
                      }}
                    >
                      {forgotLoading ? "Sending..." : "Send reset link"}
                    </button>
                  </>
                ) : (
                  <>
                    <label
                      style={{
                        display: "block",
                        color: "#252A31",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "7px",
                      }}
                    >
                      New password
                    </label>

                    <input
                      type={showResetPassword ? "text" : "password"}
                      value={resetPasswordValue}
                      onChange={(event) =>
                        setResetPasswordValue(event.target.value)
                      }
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      required
                      style={{
                        width: "100%",
                        height: "46px",
                        padding: "0 45px 0 13px",
                        border: "1px solid #DDE2E9",
                        borderRadius: "11px",
                        marginBottom: "15px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        outline: "none",
                        color: "#15181D",
                        background: "#fff",
                      }}
                    />

                    <label
                      style={{
                        display: "block",
                        color: "#252A31",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "7px",
                      }}
                    >
                      Confirm password
                    </label>

                    <input
                      type={showConfirmResetPassword ? "text" : "password"}
                      value={confirmResetPassword}
                      onChange={(event) =>
                        setConfirmResetPassword(event.target.value)
                      }
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      required
                      style={{
                        width: "100%",
                        height: "46px",
                        padding: "0 45px 0 13px",
                        border: "1px solid #DDE2E9",
                        borderRadius: "11px",
                        marginBottom: "15px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        outline: "none",
                        color: "#15181D",
                        background: "#fff",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmResetPassword((value) => !value)}
                      aria-label={
                        showConfirmResetPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      style={{
                        position: "absolute",
                        marginTop: "-61px",
                        right: "4px",
                        width: "40px",
                        height: "46px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: 0,
                        background: "transparent",
                        color: "#777F88",
                        cursor: "pointer",
                      }}
                    >
                      {showConfirmResetPassword ? (
                        <EyeOff size={18} strokeWidth={2} />
                      ) : (
                        <Eye size={18} strokeWidth={2} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={forgotLoading}
                      style={{
                        width: "100%",
                        height: "46px",
                        border: "none",
                        borderRadius: "11px",
                        background:
                          "linear-gradient(135deg, #111318 0%, #18201E 100%)",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: 750,
                        cursor: forgotLoading ? "not-allowed" : "pointer",
                        opacity: forgotLoading ? 0.7 : 1,
                      }}
                    >
                      {forgotLoading ? "Resetting..." : "Reset password"}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setResetMode(false);
                    setError("");
                    setForgotMessage("");
                  }}
                  style={{
                    width: "100%",
                    height: "42px",
                    marginTop: "10px",
                    border: "none",
                    background: "transparent",
                    color: "#2563EB",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Back to login
                </button>
              </>
            ) : loginMethod === "password" ? (
              <>
                <label
                  style={{
                    display: "block",
                    color: "#252A31",
                    fontSize: "13px",
                    fontWeight: 700,
                    marginBottom: "7px",
                  }}
                >
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 13px",
                    border: "1px solid #DDE2E9",
                    borderRadius: "11px",
                    marginBottom: "15px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    color: "#15181D",
                    background: "#fff",
                  }}
                />

                <label
                  style={{
                    display: "block",
                    color: "#252A31",
                    fontSize: "13px",
                    fontWeight: 700,
                    marginBottom: "7px",
                  }}
                >
                  Password
                </label>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    marginBottom: "17px",
                  }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    style={{
                      width: "100%",
                      height: "46px",
                      padding: "0 45px 0 13px",
                      border: "1px solid #DDE2E9",
                      borderRadius: "11px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none",
                      color: "#15181D",
                      background: "#fff",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    style={{
                      position: "absolute",
                      top: 0,
                      right: "4px",
                      width: "40px",
                      height: "46px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: 0,
                      background: "transparent",
                      color: "#777F88",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={2} />
                    ) : (
                      <Eye size={18} strokeWidth={2} />
                    )}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "-7px",
                    marginBottom: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setForgotEmail(email);
                      setError("");
                      setForgotSent(false);
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      color: "#2563EB",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "46px",
                    border: "none",
                    borderRadius: "11px",
                    background:
                      "linear-gradient(135deg, #111318 0%, #18201E 100%)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 750,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    boxShadow: "0 7px 18px rgba(17,19,24,.14)",
                  }}
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>
              </>
            ) : (
              <>
                <label
                  style={{
                    display: "block",
                    color: "#252A31",
                    fontSize: "13px",
                    fontWeight: 700,
                    marginBottom: "7px",
                  }}
                >
                  WhatsApp Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 9876543210"
                  autoComplete="tel"
                  disabled={otpSent}
                  required
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 13px",
                    border: "1px solid #DDE2E9",
                    borderRadius: "11px",
                    marginBottom: "15px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    color: "#15181D",
                    background: otpSent ? "#F5F6F7" : "#fff",
                  }}
                />

                {otpSent && (
                  <>
                    <label
                      style={{
                        display: "block",
                        color: "#252A31",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "7px",
                      }}
                    >
                      WhatsApp OTP
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      placeholder="Enter 6-digit OTP"
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                      style={{
                        width: "100%",
                        height: "46px",
                        padding: "0 13px",
                        border: "1px solid #DDE2E9",
                        borderRadius: "11px",
                        marginBottom: "17px",
                        fontSize: "18px",
                        letterSpacing: "4px",
                        textAlign: "center",
                        boxSizing: "border-box",
                        outline: "none",
                        color: "#15181D",
                        background: "#fff",
                      }}
                    />
                  </>
                )}

                <button
                  type="submit"
                  disabled={otpLoading || loading}
                  style={{
                    width: "100%",
                    height: "46px",
                    border: "none",
                    borderRadius: "11px",
                    background:
                      "linear-gradient(135deg, #111318 0%, #18201E 100%)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 750,
                    cursor:
                      otpLoading || loading ? "not-allowed" : "pointer",
                    opacity: otpLoading || loading ? 0.7 : 1,
                    boxShadow: "0 7px 18px rgba(17,19,24,.14)",
                  }}
                >
                  {otpLoading
                    ? "Sending OTP..."
                    : loading
                    ? "Verifying..."
                    : otpSent
                    ? "Verify & Log in"
                    : "Send WhatsApp OTP"}
                </button>

                {otpSent && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "12px",
                    }}
                  >
                    <button
                      type="button"
                      disabled={resendCountdown > 0 || otpLoading}
                      onClick={async () => {
                        if (!selectedRole || resendCountdown > 0) return;

                        setError("");
                        setOtpLoading(true);

                        try {
                          await sendLoginPhoneOtp(
                            phone.trim(),
                            selectedRole
                          );
                          setOtp("");
                          setResendCountdown(60);
                        } catch (error) {
                          setError(
                            error instanceof Error
                              ? error.message
                              : "Unable to resend OTP"
                          );
                        } finally {
                          setOtpLoading(false);
                        }
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        color:
                          resendCountdown > 0 ? "#9AA0A8" : "#2563EB",
                        fontSize: "12px",
                        fontWeight: 750,
                        cursor:
                          resendCountdown > 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      {resendCountdown > 0
                        ? `Resend OTP in ${resendCountdown}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                )}
              </>
            )}
          </form>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "19px",
            fontSize: "12px",
            color: "#8A9097",
          }}
        >
          Don't have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "#2563EB",
              fontWeight: 750,
              textDecoration: "none",
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
