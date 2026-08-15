"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Store,
  Users,
  ClipboardList,
  CircleDollarSign,
  UserRound,
  MapPin,
  Home,
} from "lucide-react";

const nav = [
  { label: "Overview", href: "/crm", icon: BarChart3 },
  { label: "Listings", href: "/crm/listings", icon: Store },
  { label: "Customers", href: "/crm/customers", icon: Users },
  { label: "Orders", href: "/crm/orders", icon: ClipboardList },
  { label: "Payments", href: "/crm/payments", icon: CircleDollarSign },
  { label: "Providers", href: "/crm/providers", icon: UserRound },
];

export default function CRMLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routeReady, setRouteReady] = useState(false);

  useEffect(() => {
    setRouteReady(false);

    const frame = requestAnimationFrame(() => {
      setRouteReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className="mv-crm-root">
      <button
        type="button"
        className="mv-crm-mobile-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open CRM menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {sidebarOpen && (
        <button
          type="button"
          className="mv-crm-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close CRM menu"
        />
      )}

      <aside className={`mv-crm-sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <div className="mv-crm-brand">
          <div className="mv-crm-brand-line">
            <span className="mv-logo-metro">metro</span><span className="mv-logo-vybe">vybe</span><span className="mv-logo-star">✦</span><span className="mv-logo-crm">CRM</span>
          </div>
        </div>

        <div className="mv-crm-section-label">WORKSPACE</div>

        <nav className="mv-crm-nav">
          {nav.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/crm"
                ? pathname === "/crm"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`mv-crm-nav-item ${active ? "active" : ""}`}
              >
                <Icon size={19} strokeWidth={2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mv-crm-sidebar-bottom">
          <Link
            href="/"
            className="mv-crm-bottom-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Home size={18} />
            <span>Back to website</span>
          </Link>
        </div>
      </aside>

      <main
        className="mv-crm-content"
        style={{
          visibility: routeReady ? "visible" : "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}
