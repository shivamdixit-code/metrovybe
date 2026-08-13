"use client";

import Link from "next/link";
import {
  Home,
  Search,
  Plus,
  Heart,
  User,
} from "lucide-react";

type BottomNavProps = {
  active?: "home" | "explore" | "list" | "saved" | "profile";
};

export function BottomNav({ active = "home" }: BottomNavProps) {
  const items = [
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
      id: "list",
      label: "List",
      href: "/list",
      icon: Plus,
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
