"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, CircleAlert, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

function VerificationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const isSuccess = status === "success";
  const isExpired = status === "expired";
  const isAlreadyVerified = status === "already-verified";

  const title = isSuccess
    ? "Email verified!"
    : isAlreadyVerified
      ? "Email already verified"
      : isExpired
        ? "Verification link expired"
        : "Verification link invalid";

  const message = isSuccess
    ? "Your MetroVybe email has been verified successfully."
    : isAlreadyVerified
      ? "This email address has already been verified. You can safely continue to your account."
      : isExpired
        ? "This verification link has expired. Please request a new verification email."
        : "This verification link is invalid or has already been used. Please request a new verification email.";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#f7f7f4",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          border: "2px solid #111",
          borderRadius: 28,
          padding: "42px 32px",
          textAlign: "center",
          boxShadow: "8px 8px 0 #111",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            margin: "0 auto 22px",
            borderRadius: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isSuccess ? "#00E676" : "#f1f1ed",
            color: "#111",
          }}
        >
          {isSuccess ? (
            <CheckCircle2 size={38} strokeWidth={2.5} />
          ) : isExpired ? (
            <Mail size={36} strokeWidth={2.3} />
          ) : (
            <CircleAlert size={38} strokeWidth={2.3} />
          )}
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.12em",
            marginBottom: 10,
          }}
        >
          METROVYBE
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(30px, 6vw, 46px)",
            lineHeight: 0.98,
            letterSpacing: "-0.055em",
            fontWeight: 900,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: "20px auto 30px",
            maxWidth: 420,
            color: "#666",
            fontSize: 16,
            lineHeight: 1.55,
          }}
        >
          {message}
        </p>

        {isSuccess || isAlreadyVerified ? (
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              minHeight: 50,
              padding: "0 22px",
              borderRadius: 14,
              background: "#111",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Continue to login
            <ArrowRight size={18} />
          </Link>
        ) : (
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              minHeight: 50,
              padding: "0 22px",
              borderRadius: 14,
              background: "#111",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Back to login
            <ArrowRight size={18} />
          </Link>
        )}
      </section>
    </main>
  );
}

export default function EmailVerificationPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#f7f7f4",
            fontWeight: 800,
          }}
        >
          Loading...
        </main>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
