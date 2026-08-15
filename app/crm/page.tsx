"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth";
import {
  BarChart3,
  Store,
  Users,
  ClipboardList,
  CircleDollarSign,
  Plus,
  ArrowUpRight,
  Activity,
  Clock3,
} from "lucide-react";

const actions = [
  {
    title: "Add a listing",
    description: "Publish a new business on MetroVybe",
    color: "green",
    icon: Store,
    href: "/crm/listings/new",
  },
  {
    title: "View customers",
    description: "See your customer activity",
    color: "#29AB87",
    icon: Users,
    href: "/crm/customers",
  },
  {
    title: "Review orders",
    description: "Track bookings & requests",
    color: "orange",
    icon: ClipboardList,
    href: "/crm/orders",
  },
  {
    title: "Manage payments",
    description: "Transactions & settlements",
    color: "purple",
    icon: CircleDollarSign,
    href: "/crm/payments",
  },
];

export default function CRMPage() {
  const [dashboard, setDashboard] = useState<{
    customers: number;
    listings: number;
    pendingListings: number;
    orders: string;
    revenue: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await authenticatedFetch("/api/admin/dashboard");

        if (!response.ok) {
          throw new Error(`Dashboard request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!active) return;

        setDashboard({
          customers: Number(data?.users?.customers ?? 0),
          listings: Number(data?.listings?.published ?? 0),
          pendingListings: Number(data?.listings?.pending ?? 0),
          orders: "0",
          revenue: "₹0",
        });
      } catch (error) {
        console.error("Failed to load CRM dashboard:", error);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const dashboardData = dashboard ?? {
    customers: 0,
    listings: 0,
    pendingListings: 0,
    orders: "0",
    revenue: "₹0",
  };

  const stats = [
    {
      title: "Listings",
      value: String(dashboardData.listings),
      description: "Active businesses",
      color: "green",
      icon: Store,
      href: "/crm/listings",
    },
    {
      title: "Pending Listings",
      value: String(dashboardData.pendingListings),
      description: "Awaiting review",
      icon: Clock3,
      color: "orange",
      href: "/crm/listings",
    },
    {
      title: "Customers",
      value: String(dashboardData.customers),
      description: "People on MetroVybe",
      color: "#29AB87",
      icon: Users,
      href: "/crm/customers",
    },
    {
      title: "Orders",
      value: dashboardData.orders,
      description: "Bookings & requests",
      color: "orange",
      icon: ClipboardList,
      href: "/crm/orders",
    },
    {
      title: "Revenue",
      value: dashboardData.revenue,
      description: "Total processed",
      color: "purple",
      icon: CircleDollarSign,
      href: "/crm/payments",
    },
  ];

  return (
    <main className="crm-dashboard">
      <header className="crm-header">
        <div className="crm-header-copy">
          <span className="crm-overline">OVERVIEW</span>
          <h1>Good to see you.</h1>
          <p>Everything happening across your MetroVybe business.</p>
        </div>

        <Link href="/profile" className="crm-profile">
          <div className="crm-profile-avatar">M</div>

          <div className="crm-profile-copy">
            <strong>My profile</strong>
            <span>Account &amp; settings</span>
          </div>

          <ArrowUpRight size={21} strokeWidth={2} />
        </Link>
      </header>

      <section className="crm-hero">
        <div className="crm-hero-content">
          <div className="crm-hero-label">
            <span>✦</span>
            TODAY AT A GLANCE
          </div>

          <h2>
            Your marketplace,
            <em> beautifully organized.</em>
          </h2>

          <p>
            Manage your listings, customers, orders and payments
            <br className="desktop-break" />
            from one focused workspace.
          </p>

          <Link href="/crm/listings/new" className="crm-add-button">
            <span className="crm-plus">
              <Plus size={21} strokeWidth={2.8} />
            </span>

            <span>Add a listing</span>

            <ArrowUpRight size={19} />
          </Link>
        </div>

        <div className="crm-hero-art">
          <div className="crm-orbit crm-orbit-1" />
          <div className="crm-orbit crm-orbit-2" />
          <div className="crm-orbit crm-orbit-3" />

          <div className="crm-dot crm-dot-1" />
          <div className="crm-dot crm-dot-2" />
          <div className="crm-dot crm-dot-3" />

          <div className="crm-art-center">
            <BarChart3 size={48} strokeWidth={2.5} />
          </div>
        </div>
      </section>

      <section className="crm-stat-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link key={stat.title} href={stat.href} className="crm-stat-card">
              <div className={`crm-stat-icon ${stat.color}`}>
                <Icon size={27} strokeWidth={2.1} />
              </div>

              <div className="crm-stat-body">
                <div className="crm-stat-top">
                  <span>{stat.title}</span>
                  <ArrowUpRight size={19} />
                </div>

                <strong>{stat.value}</strong>

                <small>{stat.description}</small>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="crm-content-grid">
        <div className="crm-panel">
          <div className="crm-panel-header">
            <div>
              <span className="crm-section-label">ACTIVITY</span>
              <h3>Recent activity</h3>
            </div>

            <span className="crm-live">
              <i />
              Live
            </span>
          </div>

          <div className="crm-empty">
            <div className="crm-empty-icon">
              <Activity size={40} strokeWidth={1.8} />
            </div>

            <div>
              <h4>Nothing new just yet</h4>
              <p>
                Your latest listings, bookings and customer
                <br className="desktop-break" />
                activity will appear here.
              </p>
            </div>
          </div>
        </div>

        <div className="crm-panel">
          <div className="crm-panel-header">
            <div>
              <span className="crm-section-label">SHORTCUTS</span>
              <h3>Quick actions</h3>
            </div>
          </div>

          <div className="crm-actions">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="crm-action"
                >
                  <div className={`crm-action-icon ${action.color}`}>
                    <Icon size={21} strokeWidth={2.1} />
                  </div>

                  <div>
                    <strong>{action.title}</strong>
                    <br />
                    <span>{action.description}</span>
                  </div>

                  <ArrowUpRight size={18} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="crm-footer">
        <div className="crm-footer-left">
          <div className="crm-footer-mark">MV</div>

          <div>
            <strong>MetroVybe Marketplace</strong>
            <span>Discover. Connect. Vybe.</span>
          </div>
        </div>

        <div className="crm-system-status">
          <i />
          All systems ready
        </div>
      </footer>


    </main>
  );
}
