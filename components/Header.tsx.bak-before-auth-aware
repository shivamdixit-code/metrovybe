"use client";

import Link from "next/link";
import { Search, Plus } from "lucide-react";

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">

        <Link href="/" className="brand" style={{ textDecoration: "none", color: "#111" }}>
          <div className="logo">
            metro<span className="v">vybe</span><span className="logo-star">✦</span>
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
          <Link href="/login" className="btn">
            Log in
          </Link>

          <Link href="/list" className="btn btn-green">
            <Plus size={17} style={{ verticalAlign: "middle", marginRight: 5 }} />
            List a service
          </Link>
        </div>

      </div>
    </header>
  );
}
