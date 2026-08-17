"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState(
    "Verifying your email address..."
  );

  useEffect(() => {
    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    if (!token || !email) {
      setStatus("error");
      setMessage("This verification link is incomplete.");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify-email?token=${encodeURIComponent(
            token
          )}&email=${encodeURIComponent(email)}`
        );

        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setStatus("error");
          setMessage(
            data.message || "Unable to verify your email."
          );
          return;
        }

        setStatus("success");
        setMessage(
          "Your email has been verified successfully. You can now log in."
        );
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            "Unable to connect to MetroVybe. Please try again."
          );
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <main className="public-login-page">
      <div className="public-login-card">
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: status === "success" ? "#E8F8F2" : "#F5F6F7",
            color: status === "success" ? "#29AB87" : "#666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: 800,
            margin: "0 auto 20px",
          }}
        >
          {status === "loading"
            ? "..."
            : status === "success"
              ? "✓"
              : "!"}
        </div>

        <h1
          style={{
            fontSize: "28px",
            textAlign: "center",
            margin: "0 0 12px",
          }}
        >
          {status === "loading"
            ? "Verifying email"
            : status === "success"
              ? "Email verified"
              : "Verification failed"}
        </h1>

        <p
          style={{
            color: "#747A82",
            fontSize: "14px",
            lineHeight: 1.6,
            textAlign: "center",
            margin: "0 0 24px",
          }}
        >
          {message}
        </p>

        {status === "success" && (
          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "50px",
              borderRadius: "8px",
              background: "#29AB87",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Continue to Login
          </Link>
        )}

        {status === "error" && (
          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "50px",
              borderRadius: "8px",
              background: "#29AB87",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Go to Login
          </Link>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return <VerifyEmailContent />;
}
