"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, UserRound } from "lucide-react";
import { getToken, getUser, type AuthUser } from "@/lib/auth";

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);

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

  const profileHref =
    user?.role === "business"
      ? "/business/profile"
      : user?.role === "admin"
        ? "/admin"
        : "/profile";

  const profileLabel =
    user?.role === "business"
      ? "Business Dashboard"
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
          {user ? (
            <Link href={profileHref} className="btn">
              <UserRound
                size={17}
                style={{
                  verticalAlign: "middle",
                  marginRight: 6,
                }}
              />
              {profileLabel}
            </Link>
          ) : (
            <Link href="/login" className="btn">
              Log in
            </Link>
          )}

          <Link href="/list" className="btn btn-green">
            <Plus
              size={17}
              style={{
                verticalAlign: "middle",
                marginRight: 5,
              }}
            />
            List a service
          </Link>
        </div>
      </div>
    </header>
  );
}
