"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Mail,
  ShieldCheck,
} from "lucide-react";

function VerificationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const isSuccess = status === "success";
  const isExpired = status === "expired";
  const isAlreadyVerified = status === "already-verified";

  const title = isSuccess
    ? "Email verified!"
    : isAlreadyVerified
      ? "Already verified."
      : isExpired
        ? "Link expired."
        : "Link not valid.";

  const message = isSuccess
    ? "Your MetroVybe email is verified. Your account is ready to go."
    : isAlreadyVerified
      ? "This email is already verified. You can safely continue to your account."
      : isExpired
        ? "This verification link has expired. Please request a new one."
        : "This verification link is invalid or has already been used.";

  const eyebrow = isSuccess
    ? "VERIFICATION COMPLETE"
    : isAlreadyVerified
      ? "ACCOUNT VERIFIED"
      : isExpired
        ? "VERIFICATION EXPIRED"
        : "VERIFICATION ERROR";

  const icon = isSuccess ? (
    <CheckCircle2 size={30} strokeWidth={2.7} />
  ) : isAlreadyVerified ? (
    <ShieldCheck size={30} strokeWidth={2.5} />
  ) : isExpired ? (
    <Mail size={29} strokeWidth={2.4} />
  ) : (
    <CircleAlert size={30} strokeWidth={2.5} />
  );

  return (
    <main
      style={{
        minHeight: "100svh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        background: "#f5f5f0",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: isSuccess
            ? "rgba(0,230,118,0.10)"
            : "rgba(167,139,250,0.08)",
          top: -145,
          right: -125,
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          width: "100%",
          maxWidth: 430,
          position: "relative",
          background: "#fff",
          border: "2px solid #111",
          borderRadius: 22,
          padding: "28px 24px 24px",
          textAlign: "center",
          boxShadow: "6px 6px 0 #111",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 20,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.13em",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#29AB87",
              border: "1.5px solid #111",
              display: "inline-block",
            }}
          />
          METROVYBE
        </div>

        <div
          style={{
            width: 58,
            height: 58,
            margin: "0 auto 18px",
            borderRadius: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isSuccess ? "#29AB87" : "#f2f2ed",
            border: "2px solid #111",
            boxShadow: "3px 3px 0 #111",
          }}
        >
          {icon}
        </div>

        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#777",
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(31px, 7vw, 43px)",
            lineHeight: 0.96,
            letterSpacing: "-0.055em",
            fontWeight: 950,
            color: "#111",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: "16px auto 22px",
            maxWidth: 350,
            color: "#666",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            minHeight: 46,
            padding: "0 18px",
            borderRadius: 12,
            background: "#111",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 900,
            fontSize: 14,
            border: "2px solid #111",
            boxShadow: "3px 3px 0 #29AB87",
          }}
        >
          {isSuccess || isAlreadyVerified
            ? "Continue to login"
            : "Back to login"}
          <ArrowRight size={17} strokeWidth={2.7} />
        </Link>

        <div
          style={{
            marginTop: 18,
            paddingTop: 13,
            borderTop: "1px solid #e8e8e3",
            color: "#aaa",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.08em",
          }}
        >
          YOUR CITY. YOUR VYBE.
        </div>
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
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            background: "#f5f5f0",
            fontWeight: 900,
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
