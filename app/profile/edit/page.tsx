"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

    setUser(currentUser);
    setName(currentUser.name || "");
    setPhone(currentUser.phone || "");

    authenticatedFetch("/api/auth/me")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setUser(data.user);
        setName(data.user.name || "");
        setPhone(data.user.phone || "");

        localStorage.setItem(
          "metrovybe_user",
          JSON.stringify(data.user)
        );
      })
      .catch((err) => {
        setError(err.message || "Unable to load profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError("Name is required.");
      return;
    }

    if (!cleanPhone) {
      setError("Phone number is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await authenticatedFetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      setUser(data.user);
      setName(data.user.name || "");
      setPhone(data.user.phone || "");

      localStorage.setItem(
        "metrovybe_user",
        JSON.stringify(data.user)
      );

      window.dispatchEvent(new Event("metrovybe-auth-changed"));

      setMessage(data.message || "Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
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
              <p>Update your name and phone number.</p>
            </div>
          </header>

          <section className="settings-account-card">
            <div className="settings-account-info">
              <strong className="settings-display-name">
                {user.name || "Customer"}
              </strong>
              <span>{user.email}</span>
            </div>
          </section>

          <form
            onSubmit={handleSave}
            style={{
              marginTop: 20,
              background: "#fff",
              border: "2px solid #111",
              borderRadius: 22,
              padding: 22,
              boxShadow: "4px 5px 0 #111",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 18,
              }}
            >
              <label className="field">
                <span>Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  disabled={saving}
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  value={user.email}
                  disabled
                  readOnly
                  type="email"
                  autoComplete="email"
                />
                <small>
                  Email is your account identity and cannot be changed here.
                </small>
              </label>

              <label className="field">
                <span>Phone</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  disabled={saving}
                />
                <small>
                  Changing your phone number will require verification.
                </small>
              </label>

              {error && (
                <div
                  role="alert"
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "#FFF1F2",
                    border: "1px solid #FDA4AF",
                    fontWeight: 800,
                  }}
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "#ECFDF5",
                    border: "1px solid #86EFAC",
                    fontWeight: 800,
                  }}
                >
                  <CheckCircle2 size={18} />
                  {message}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 4,
                }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    minHeight: 46,
                    padding: "0 20px",
                    border: "2px solid #111",
                    borderRadius: 12,
                    background: "#111",
                    color: "#fff",
                    fontWeight: 900,
                    cursor: saving ? "wait" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {saving && <Loader2 size={17} className="animate-spin" />}
                  {saving ? "Saving..." : "Save changes"}
                </button>

                <Link
                  href="/profile/settings"
                  style={{
                    minHeight: 46,
                    padding: "0 20px",
                    border: "2px solid #111",
                    borderRadius: 12,
                    background: "#fff",
                    color: "#111",
                    fontWeight: 900,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
