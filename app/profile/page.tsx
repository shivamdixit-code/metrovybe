"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronRight,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Pencil,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getToken, getUser, logout, type AuthUser } from "@/lib/auth";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();

    if (!token || !currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.role !== "customer") {
      router.replace(
        currentUser.role === "business" ? "/business/profile" : "/login"
      );
      return;
    }

    setUser(currentUser);
    setCheckingAuth(false);
  }, [router]);

  const handleLogout = () => {
    setLoggingOut(true);
    logout();
    window.dispatchEvent(new Event("metrovybe-auth-changed"));
    router.replace("/login");
  };

  if (checkingAuth || !user) {
    return (
      <div className="page">
        <Header />

        <main className="shell inner profile-page">
          <section
            className="profile-top"
            style={{
              minHeight: 240,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="profile-person-info">
              <strong>Loading your profile...</strong>
              <span>Please wait a moment.</span>
            </div>
          </section>
        </main>

        <BottomNav active="profile" />
      </div>
    );
  }

  const displayName = user.name?.trim() || "Customer";
  const firstName = displayName.split(/\s+/)[0] || "Customer";

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C";

  return (
    <div className="page">
      <Header />

      <main className="shell inner profile-page">
        {/* PREMIUM PROFILE HERO */}
        <section
          className="profile-top"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            padding: "34px 34px 30px",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              right: -80,
              top: -100,
              background: "rgba(0, 230, 118, 0.12)",
              filter: "blur(2px)",
              pointerEvents: "none",
            }}
          />

          <div className="profile-top-copy" style={{ position: "relative" }}>
            <span className="profile-kicker">MY METROVYBE</span>

            <h1 style={{ letterSpacing: "-0.055em" }}>
              Hey {firstName},
              <br />
              <em>your city awaits.</em>
            </h1>

            <p style={{ maxWidth: 560 }}>
              Your favourite places, bookings and everyday city discoveries —
              all in one space.
            </p>
          </div>

          <div
            className="profile-person"
            style={{
              position: "relative",
              marginTop: 28,
              paddingTop: 22,
              borderTop: "1px solid rgba(17,17,17,0.1)",
            }}
          >
            <div
              className="profile-avatar-large"
              aria-label={`${displayName} profile`}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 25,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {initials}
              </span>
            </div>

            <div className="profile-person-info">
              <strong>{displayName}</strong>
              <span>{user.email}</span>
            </div>

            <button
              type="button"
              className="profile-settings-button"
              aria-label="Account settings"
              title="Account settings"
              onClick={() => router.push("/profile/settings")}
            >
              <Settings size={19} />
            </button>
          </div>
        </section>

        {/* ACTIVITY */}
        <section style={{ marginTop: 34 }}>
          <div className="profile-heading-row">
            <div>
              <span className="profile-kicker dark">YOUR ACTIVITY</span>
              <h2>Keep track of your vybe.</h2>
            </div>
          </div>

          <div
            className="profile-stats"
            style={{
              marginTop: 18,
              gap: 16,
            }}
          >
            <Link
              href="/bookings"
              className="profile-stat"
              style={{
                minHeight: 112,
                borderRadius: 22,
              }}
            >
              <div
                className="profile-stat-icon green"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                }}
              >
                <CalendarDays size={21} />
              </div>

              <div>
                <strong>Bookings</strong>
                <span>Upcoming & past plans</span>
              </div>

              <ChevronRight size={19} />
            </Link>

            <Link
              href="/saved"
              className="profile-stat"
              style={{
                minHeight: 112,
                borderRadius: 22,
              }}
            >
              <div
                className="profile-stat-icon yellow"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                }}
              >
                <Bookmark size={21} />
              </div>

              <div>
                <strong>Saved</strong>
                <span>Places worth coming back to</span>
              </div>

              <ChevronRight size={19} />
            </Link>
          </div>
        </section>

        {/* DISCOVER */}
        <section className="profile-discover" style={{ marginTop: 42 }}>
          <div className="profile-heading-row">
            <div>
              <span className="profile-kicker dark">DISCOVER</span>
              <h2>Find your next vybe.</h2>
            </div>

            <Link href="/explore" className="profile-see-all">
              Explore all <ArrowRight size={16} />
            </Link>
          </div>

          <div
            className="vybe-grid"
            style={{
              marginTop: 20,
              gap: 14,
            }}
          >
            <Link
              href="/explore?category=stay"
              className="vybe-card stay"
              style={{ borderRadius: 24 }}
            >
              <div className="vybe-card-top">
                <span className="vybe-number">01</span>
                <span className="vybe-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>

              <div className="vybe-card-bottom">
                <span className="vybe-icon">⌂</span>
                <h3>Stay</h3>
                <p>PGs, rooms & student living</p>
              </div>
            </Link>

            <Link
              href="/explore?category=food"
              className="vybe-card food"
              style={{ borderRadius: 24 }}
            >
              <div className="vybe-card-top">
                <span className="vybe-number">02</span>
                <span className="vybe-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>

              <div className="vybe-card-bottom">
                <span className="vybe-icon">✦</span>
                <h3>Food</h3>
                <p>Tiffin, meals & everyday eats</p>
              </div>
            </Link>

            <Link
              href="/explore?category=live"
              className="vybe-card services"
              style={{ borderRadius: 24 }}
            >
              <div className="vybe-card-top">
                <span className="vybe-number">03</span>
                <span className="vybe-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>

              <div className="vybe-card-bottom">
                <span className="vybe-icon">◇</span>
                <h3>Services</h3>
                <p>Laundry, movers & daily help</p>
              </div>
            </Link>

            <Link
              href="/explore"
              className="vybe-card all"
              style={{ borderRadius: 24 }}
            >
              <div className="vybe-card-top">
                <span className="vybe-number">04</span>
                <span className="vybe-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>

              <div className="vybe-card-bottom">
                <span className="vybe-icon">
                  <Sparkles size={22} />
                </span>
                <h3>Everything</h3>
                <p>Explore your city</p>
              </div>
            </Link>
          </div>
        </section>

      </main>

      <BottomNav active="profile" />
    </div>
  );
}
