"use client";

import Link from "next/link";
import {
  Home,
  Search,
  Heart,
  User,
  LayoutDashboard,
  List,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getToken, getUser, type AuthUser } from "@/lib/auth";

type BottomNavProps = {
  active?:
    | "home"
    | "explore"
    | "list"
    | "saved"
    | "profile"
    | "dashboard"
    | "enquiries"
    | "account"
    | "bookings";
};

export function BottomNav({ active = "home" }: BottomNavProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncAuth = () => {
      const token = getToken();
      const currentUser = getUser();

      setUser(token && currentUser ? currentUser : null);
    };

    syncAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("metrovybe-auth-changed", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("metrovybe-auth-changed", syncAuth);
    };
  }, []);

  const isBusiness = user?.role === "business";

  const customerItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      id: "explore",
      label: "Explore",
      href: "/explore",
      icon: Search,
    },
    {
      id: "bookings",
      label: "Bookings",
      href: "/bookings",
      icon: List,
    },
    {
      id: "saved",
      label: "Saved",
      href: "/saved",
      icon: Heart,
    },
    {
      id: "profile",
      label: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  const businessItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/business/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "list",
      label: "Listings",
      href: "/business/listings/new",
      icon: List,
    },
    {
      id: "enquiries",
      label: "Enquiries",
      href: "/business/dashboard",
      icon: MessageSquare,
    },
    {
      id: "account",
      label: "Profile",
      href: "/business/dashboard",
      icon: User,
    },
  ];

  const items = isBusiness ? businessItems : customerItems;

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`bottom-nav-item ${
              isActive ? "active" : ""
            }`}
          >
            <span className="bottom-nav-icon">
              <Icon
                size={24}
                strokeWidth={isActive ? 2.8 : 2.2}
              />
            </span>

            <span className="bottom-nav-label">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
