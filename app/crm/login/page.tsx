"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, logout } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";

export default function CRMLoginPage() {
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
      const result = await login(email.trim(), password);

      if (result.user.role !== "admin") {
        logout();
        setError("This login is for MetroVybe CRM administrators only.");
        return;
      }

      router.replace("/crm");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="crm-login-page">
      <section className="crm-login-card">
        <Link href="/" className="crm-login-brand">
          <strong className="crm-wordmark">
            <span className="crm-logo-metro">metro</span><span className="crm-logo-vybe">vybe</span><span className="crm-logo-star">✦</span>
          </strong>
          <span className="crm-logo-crm">CRM</span>
        </Link>

        <div className="crm-login-heading">
          <span>ADMINISTRATION</span>
          <h1>CRM login</h1>
          <p>Sign in to manage MetroVybe.</p>
        </div>

        {error && (
          <div className="crm-login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="crm-login-form">
          <label htmlFor="crm-email">Email</label>
          <input
            id="crm-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@metrovybe.com"
            autoComplete="email"
            required
          />

          <label htmlFor="crm-password">Password</label>

          <div className="crm-password-wrap">
            <input
              id="crm-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="crm-password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={2} />
              ) : (
                <Eye size={18} strokeWidth={2} />
              )}
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to CRM"}
          </button>
        </form>


      </section>


    </main>
  );
}
