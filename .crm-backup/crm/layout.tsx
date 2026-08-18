"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getToken, getUser } from "@/lib/auth";

export default function CRMLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [checking, setChecking] = useState(true);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    setAdmin(Boolean(token && user?.role === "admin"));
    setChecking(false);
  }, []);

  if (checking) {
    return <div className="crm-layout-loading" />;
  }

  if (!admin) {
    return (
      <div className="crm-login-shell">
        {children}

        <style jsx global>{`
          .crm-login-shell {
            min-height: 100vh;
            min-height: 100dvh;
            width: 100%;
            background: #f5f8f6;
          }

          .crm-login-shell .crm-auth-page {
            min-height: 100vh;
            min-height: 100dvh;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            padding: 24px;
            background:
              radial-gradient(
                circle at 15% 10%,
                rgba(23,107,85,.12),
                transparent 30%
              ),
              radial-gradient(
                circle at 90% 90%,
                rgba(23,107,85,.08),
                transparent 32%
              ),
              #f5f8f6;
          }

          .crm-login-shell .crm-auth-card {
            position: relative;
            z-index: 2;
            width: min(100%, 410px);
            box-sizing: border-box;
            padding: 34px;
            background: rgba(255,255,255,.97);
            border: 1px solid #e1e8e4;
            border-radius: 26px;
            box-shadow:
              0 28px 80px rgba(22,45,37,.11),
              0 4px 16px rgba(22,45,37,.05);
          }

          .crm-login-shell .crm-brand-mark {
            display: flex;
            align-items: center;
            width: auto;
            height: auto;
            margin-bottom: 24px;
            padding: 0;
            border-radius: 0;
            background: transparent;
            color: #151918;
            font-size: 27px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -1.8px;
            box-shadow: none;
          }

          .crm-login-shell .crm-brand-mark span {
            color: #176b55;
          }

          .crm-login-shell .crm-brand-mark b {
            margin-left: 4px;
            color: #176b55;
            font-size: 18px;
          }

          .crm-login-shell .crm-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: #176b55;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 1.6px;
          }

          .crm-login-shell .crm-eyebrow::before {
            content: "";
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #176b55;
            box-shadow: 0 0 0 4px #e6f2ed;
          }

          .crm-login-shell .crm-auth-card h1 {
            margin: 10px 0 8px;
            color: #151918;
            font-size: 35px;
            line-height: 1.08;
            letter-spacing: -1.5px;
          }

          .crm-login-shell .crm-auth-subtitle {
            max-width: 340px;
            margin: 0 0 27px;
            color: #707a76;
            font-size: 13px;
            line-height: 1.65;
          }

          .crm-login-shell .crm-auth-card form {
            display: grid;
            gap: 16px;
          }

          .crm-login-shell .crm-auth-card label {
            display: grid;
            gap: 7px;
            color: #252c29;
            font-size: 12px;
            font-weight: 800;
          }

          .crm-login-shell .crm-auth-card input {
            width: 100%;
            height: 50px;
            box-sizing: border-box;
            padding: 0 14px;
            border: 1px solid #d9e1dd;
            border-radius: 13px;
            outline: none;
            background: #fbfcfc;
            color: #151918;
            font: inherit;
            font-size: 14px;
            transition: .18s ease;
          }

          .crm-login-shell .crm-auth-card input::placeholder {
            color: #a0a8a5;
          }

          .crm-login-shell .crm-auth-card input:focus {
            border-color: #176b55;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(23,107,85,.09);
          }

          .crm-login-shell .crm-auth-card form button {
            width: 100%;
            height: 51px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-top: 2px;
            border: 0;
            border-radius: 13px;
            background: #176b55;
            color: #fff;
            font: inherit;
            font-size: 14px;
            font-weight: 850;
            cursor: pointer;
            box-shadow: 0 9px 22px rgba(23,107,85,.19);
          }

          .crm-login-shell .crm-auth-card form button:disabled {
            opacity: .65;
            cursor: not-allowed;
          }

          .crm-login-shell .crm-auth-error {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 11px 12px;
            border-radius: 11px;
            background: #fff1f1;
            color: #982e2e;
            font-size: 12px;
            font-weight: 700;
          }

          .crm-login-shell .crm-auth-error span {
            width: 20px;
            height: 20px;
            display: grid;
            place-items: center;
            flex-shrink: 0;
            border-radius: 50%;
            background: #c33b3b;
            color: #fff;
          }

          .crm-login-shell .crm-security {
            display: block;
            margin-top: 20px;
            padding-top: 17px;
            border-top: 1px solid #edf0ef;
            color: #8b9490;
            text-align: center;
            font-size: 10px;
            font-weight: 700;
          }

          .crm-login-shell .crm-loader {
            width: 25px;
            height: 25px;
            margin: 0 auto 12px;
            border: 3px solid #dce9e4;
            border-top-color: #176b55;
            border-radius: 50%;
            animation: crm-login-spin .8s linear infinite;
          }

          .crm-login-shell .crm-auth-card > p {
            text-align: center;
            color: #68726e;
            font-size: 13px;
          }

          @keyframes crm-login-spin {
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 600px) {
            .crm-login-shell .crm-auth-page {
              align-items: flex-start;
              padding: 18px;
              padding-top: 54px;
            }

            .crm-login-shell .crm-auth-card {
              width: 100%;
              padding: 28px 20px 22px;
              border-radius: 22px;
            }

            .crm-login-shell .crm-brand-mark {
              width: auto;
              height: auto;
              margin-bottom: 21px;
              border-radius: 0;
              background: transparent;
            }

            .crm-login-shell .crm-auth-card h1 {
              font-size: 31px;
            }

            .crm-login-shell .crm-auth-subtitle {
              margin-bottom: 23px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="crm-shell">
      <aside className="crm-side">
        <div className="logo">
          metro<span className="v">vybe</span>✦
        </div>

        <p style={{ color: "#aaa" }}>ADMIN CRM</p>

        <Link className="crm-link active" href="/crm">
          Dashboard
        </Link>

        <Link className="crm-link" href="/crm/customers">
          Customers
        </Link>

        <Link className="crm-link" href="/crm/orders">
          Orders
        </Link>

        <Link className="crm-link" href="/crm/listings">
          Listings
        </Link>

        <Link className="crm-link" href="/crm/providers">
          Providers
        </Link>

        <Link className="crm-link" href="/crm/payments">
          Payments
        </Link>

        <div style={{ marginTop: 30 }}>
          <Link className="crm-link" href="/">
            ← Back to marketplace
          </Link>
        </div>
      </aside>

      <main className="crm-main">{children}</main>
    </div>
  );
}
