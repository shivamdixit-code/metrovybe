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
    ? "Your MetroVybe email has been verified successfully. Your account is ready to go."
    : isAlreadyVerified
      ? "This email address has already been verified. You can safely continue to your account."
      : isExpired
        ? "This verification link has expired. Please request a new verification email."
        : "This verification link is invalid or has already been used. Please request a new verification email.";

  const eyebrow = isSuccess
    ? "VERIFICATION COMPLETE"
    : isAlreadyVerified
      ? "ACCOUNT VERIFIED"
      : isExpired
        ? "VERIFICATION EXPIRED"
        : "VERIFICATION ERROR";

  return (
    <main
      style={{
        minHeight: "100svh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 18px",
        background: "#f5f5f0",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Decorative MetroVybe background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: isSuccess
            ? "rgba(0,230,118,0.14)"
            : "rgba(167,139,250,0.12)",
          top: -190,
          right: -150,
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(85,230,232,0.10)",
          bottom: -150,
          left: -120,
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          width: "100%",
          maxWidth: 560,
          position: "relative",
          background: "#fff",
          border: "2px solid #111",
          borderRadius: 30,
          padding: "clamp(30px, 7vw, 54px) clamp(22px, 6vw, 46px)",
          textAlign: "center",
          boxShadow: "9px 9px 0 #111",
        }}
      >
        {/* Top brand */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 30,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.14em",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#00E676",
              border: "2px solid #111",
              display: "inline-block",
            }}
          />
          METROVYBE
        </div>

        {/* Status icon */}
        <div
          style={{
            width: 88,
            height: 88,
            margin: "0 auto 25px",
            borderRadius: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isSuccess ? "#00E676" : "#f1f1ed",
            border: "2px solid #111",
            boxShadow: "5px 5px 0 #111",
          }}
        >
          {isSuccess ? (
            <CheckCircle2 size={44} strokeWidth={2.5} />
          ) : isExpired ? (
            <Mail size={42} strokeWidth={2.3} />
          ) : isAlreadyVerified ? (
            <ShieldCheck size={42} strokeWidth={2.3} />
          ) : (
            <CircleAlert size={44} strokeWidth={2.3} />
          )}
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.15em",
            marginBottom: 13,
            color: "#666",
          }}
        >
          {eyebrow}
        </div>

        {/* Main heading */}
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(38px, 9vw, 64px)",
            lineHeight: 0.91,
            letterSpacing: "-0.065em",
            fontWeight: 950,
            color: "#111",
          }}
        >
          {title}
        </h1>

        {/* Message */}
        <p
          style={{
            margin: "25px auto 32px",
            maxWidth: 430,
            color: "#5f5f5f",
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        {/* Action */}
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            maxWidth: 280,
            minHeight: 54,
            padding: "0 22px",
            borderRadius: 15,
            background: "#111",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 900,
            fontSize: 15,
            border: "2px solid #111",
            boxShadow: "4px 4px 0 #00E676",
          }}
        >
          {isSuccess || isAlreadyVerified
            ? "Continue to login"
            : "Back to login"}
          <ArrowRight size={19} strokeWidth={2.7} />
        </Link>

        {/* Bottom micro copy */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 18,
            borderTop: "1px solid #e5e5e0",
            color: "#999",
            fontSize: 12,
            lineHeight: 1.5,
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
