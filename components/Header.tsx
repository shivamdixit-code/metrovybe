"use client";

import Link from "next/link";
import { Search, Plus } from "lucide-react";

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">

        <Link href="/" className="brand">
          <div className="brand-name">
            metro<span>vybe</span>
            <sup>✦</sup>
          </div>

          <div className="brand-tagline">
            YOUR CITY. YOUR VYBE.
          </div>
        </Link>

        <div className="header-search">
          <Search size={22} strokeWidth={2.5} />

          <input
            type="text"
            placeholder="Search PGs, food, laundry..."
          />

          <span className="search-shortcut">
            /
          </span>
        </div>

        <div className="header-actions">
          <Link
            href="/login"
            className="login-button"
          >
            Log in
          </Link>

          <Link
            href="/list"
            className="list-service-button"
          >
            List a service
            <Plus size={20} strokeWidth={3} />
          </Link>
        </div>

      </div>
    </header>
  );
}
