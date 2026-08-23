"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, UserRound, Bell } from "lucide-react";
import { getToken, getUser, type AuthUser } from "@/lib/auth";
import { getNotifications } from "@/lib/api";

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const syncAuth = () => {
      const token = getToken();
      const currentUser = getUser();

      if (token && currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    };

    syncAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("metrovybe-auth-changed", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("metrovybe-auth-changed", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let mounted = true;

    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        if (mounted) setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        // Keep the header usable even if notifications are temporarily unavailable.
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 5000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [user]);

  const profileHref =
    user?.role === "business"
      ? "/business/dashboard"
      : user?.role === "admin"
        ? "/admin"
        : "/profile";

  const profileLabel =
    user?.role === "business"
      ? "Dashboard"
      : user?.role === "admin"
        ? "Admin"
        : "Profile";

  return (
    <header className="header">
      <div className="header-inner">
        <Link
          href="/"
          className="brand"
          style={{ textDecoration: "none", color: "#111" }}
        >
          <div className="logo">
            metro<span className="v">vybe</span>
            <span className="logo-star">✦</span>
          </div>

          <div className="tagline">YOUR CITY. YOUR VYBE.</div>
        </Link>

        <div className="searchbar">
          <Search size={21} />

          <input
            type="search"
            placeholder="Search services, places, neighborhoods..."
          />
        </div>

        <div className="header-actions">
          {user?.role === "admin" ? (
            <Link href="/login" className="btn">
              Log in
            </Link>
          ) : user ? (
            <>
              <Link
                href="/profile/notification-center"
                className="header-notification-button"
                aria-label={
                  unreadCount > 0
                    ? `${unreadCount} unread notifications`
                    : "Notifications"
                }
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="header-notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link
              href={profileHref}
              className="btn header-user-button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textAlign: "left",
              }}
            >
              <UserRound size={18} />

              <span
                className="header-user-details"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1.2,
                }}
              >
                <strong className="header-user-name" style={{ fontSize: 13 }}>
                  {user.name || profileLabel}
                </strong>

                <span
                  className="header-user-email"
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    opacity: 0.7,
                    maxWidth: 160,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </span>
              </span>
              </Link>
            </>
          ) : (
            <Link href="/login" className="btn">
              Log in
            </Link>
          )}


        </div>
      </div>
    </header>
  );
}
