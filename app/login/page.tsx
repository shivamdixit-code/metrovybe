"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { login } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.user.role === "business") {
        router.push("/business/dashboard");
        return;
      }

      if (result.user.role === "admin") {
        router.push("/crm/login");
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
    <main className="public-login-page">
      <div className="public-login-card">
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#111",
            display: "block",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
            }}
          >
            metro<span style={{ color: "#29AB87" }}>vybe</span>✦
          </div>

          <div
            style={{
              fontSize: "11px",
              letterSpacing: "1.5px",
              color: "#777",
              marginTop: "4px",
            }}
          >
            YOUR CITY. YOUR VYBE.
          </div>
        </Link>

        <h1
          style={{
            fontSize: "30px",
            marginBottom: "8px",
          }}
        >
          Welcome back
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "28px",
          }}
        >
          Log in to your MetroVybe account.
        </p>

        {error && (
          <div
            style={{
              background: "#fff1f2",
              color: "#be123c",
              padding: "12px 14px",
              borderRadius: "10px",
              marginBottom: "18px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
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
            required
            style={{
              width: "100%",
              padding: "13px 14px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              marginBottom: "18px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "7px",
            }}
          >
            Password
          </label>

          <div
            style={{
              position: "relative",
              width: "100%",
              marginBottom: "22px",
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                padding: "13px 48px 13px 14px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                top: 0,
                right: "8px",
                width: "36px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                border: 0,
                background: "transparent",
                color: "#777",
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#111",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            color: "#666",
            fontSize: "14px",
          }}
        >
          Are you a business?
          <br />

          <Link
            href="/business/login"
            style={{
              color: "#29AB87",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-block",
              marginTop: "6px",
            }}
          >
            Business login →
          </Link>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "14px",
            fontSize: "14px",
          }}
        >
          Don't have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "#111",
              fontWeight: 700,
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
