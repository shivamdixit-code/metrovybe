"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getToken, getUser, logout, type AuthUser } from "@/lib/auth";

export default function ProfileSettings() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
    logout();
    window.dispatchEvent(new Event("metrovybe-auth-changed"));
    router.replace("/login");
  };

  if (checkingAuth || !user) {
    return (
      <div className="page">
        <Header />
        <main className="settings-page">
          <div className="settings-loading">Loading settings...</div>
        </main>
        <BottomNav active="profile" />
      </div>
    );
  }

  const displayName = user.name?.trim() || "Customer";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C";

  const rows = [
    {
      href: "/profile/edit",
      icon: UserRound,
      title: "Personal information",
      description: "Name, phone and account details",
    },
    {
      href: "/profile/security",
      icon: ShieldCheck,
      title: "Security",
      description: "Password and account protection",
    },
    {
      href: "/profile/notifications",
      icon: Bell,
      title: "Notifications",
      description: "Manage your MetroVybe alerts",
    },
    {
      href: "/saved",
      icon: Heart,
      title: "Saved places",
      description: "Your favourite listings",
    },
    {
      href: "/bookings",
      icon: CalendarDays,
      title: "Bookings",
      description: "Upcoming and past bookings",
    },
    {
      href: "/explore",
      icon: MapPin,
      title: "Explore nearby",
      description: "Discover services around you",
    },
    {
      href: "/help",
      icon: HelpCircle,
      title: "Help & support",
      description: "Get help with MetroVybe",
    },
  ];

  return (
    <div className="page">
      <Header />

      <main className="settings-page">
        <div className="settings-shell">

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link href="/profile" className="settings-back">
              <ArrowLeft size={17} />
              <span>Back to profile</span>
            </Link>

          </div>

          <header className="settings-heading">
            <div>
              <span className="settings-eyebrow">ACCOUNT</span>
              <h1>Settings</h1>
              <p>Manage your MetroVybe account.</p>
            </div>
          </header>

          <section className="settings-account-card">
            <div className="settings-avatar" aria-label={`${displayName} profile`}>
              <span>{initials}</span>
            </div>

            <div className="settings-account-info">
              <strong>{displayName}</strong>
              <span>{user.email}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Link href="/profile/edit" className="settings-edit-link">
                Edit
              </Link>

              <button
                type="button"
                className="settings-top-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-title">
              <span>ACCOUNT</span>
            </div>

            <div className="settings-list">
              {rows.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="settings-row"
                  >
                    <span className="settings-row-icon">
                      <Icon size={19} strokeWidth={2.2} />
                    </span>

                    <span className="settings-row-copy">
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>

                    <ChevronRight
                      className="settings-row-arrow"
                      size={18}
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}

