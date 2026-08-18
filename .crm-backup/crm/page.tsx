"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

const menu = [
  {
    title: "Listings",
    description: "Manage businesses and places",
    href: "/crm/listings",
    icon: Store,
    accent: "green",
  },
  {
    title: "Customers",
    description: "View and manage customers",
    href: "/crm/customers",
    icon: Users,
    accent: "blue",
  },
  {
    title: "Orders",
    description: "Track bookings and orders",
    href: "/crm/orders",
    icon: ClipboardList,
    accent: "orange",
  },
  {
    title: "Payments",
    description: "Manage transactions and settlements",
    href: "/crm/payments",
    icon: CircleDollarSign,
    accent: "purple",
  },
  {
    title: "Providers",
    description: "Manage business providers",
    href: "/crm/providers",
    icon: BriefcaseBusiness,
    accent: "pink",
  },
];

const stats = [
  { label: "Listings", value: "—", icon: Store },
  { label: "Customers", value: "—", icon: Users },
  { label: "Orders", value: "—", icon: ClipboardList },
  { label: "Revenue", value: "—", icon: CircleDollarSign },
];

export default function CRMPage() {
  return (
    <main className="crm-page">
      <div className="crm-shell">

        <header className="crm-header">
          <div>
            <div className="crm-eyebrow">
              <Sparkles size={13} />
              MetroVybe
            </div>
            <h1>CRM</h1>
            <p>Manage your MetroVybe marketplace.</p>
          </div>

          <Link href="/profile" className="profile-button">
            <div className="profile-avatar">M</div>
            <span>Profile</span>
          </Link>
        </header>

        <section className="welcome-card">
          <div className="welcome-content">
            <span className="welcome-badge">
              <LayoutDashboard size={14} />
              Control Center
            </span>

            <h2>Your business,<br />all in one place.</h2>

            <p>
              Manage listings, customers, orders and payments
              from one simple workspace.
            </p>
          </div>

          <div className="welcome-icon">
            <BarChart3 size={34} strokeWidth={1.8} />
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="stat-card" key={stat.label}>
                <div className="stat-icon">
                  <Icon size={17} />
                </div>
                <div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <span>WORKSPACE</span>
              <h3>Manage MetroVybe</h3>
            </div>
          </div>

          <div className="crm-menu">
            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  href={item.href}
                  className="crm-menu-card"
                  key={item.title}
                >
                  <div className={`menu-icon ${item.accent}`}>
                    <Icon size={20} strokeWidth={2} />
                  </div>

                  <div className="menu-copy">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>

                  <ChevronRight
                    className="menu-arrow"
                    size={19}
                  />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="quick-section">
          <Link href="/business/listings/new" className="add-listing">
            <div className="add-icon">
              <ShoppingBag size={20} />
            </div>

            <div>
              <strong>Add a new listing</strong>
              <span>Publish a business on MetroVybe</span>
            </div>

            <ArrowRight size={19} />
          </Link>
        </section>

        <section className="location-card">
          <div className="location-icon">
            <MapPin size={18} />
          </div>

          <div>
            <strong>MetroVybe Marketplace</strong>
            <span>Discover. Connect. Vybe.</span>
          </div>

          <Settings size={17} className="settings-icon" />
        </section>

        <nav className="crm-bottom-nav">
          <Link href="/" className="bottom-item">
            <Store size={19} />
            <span>Home</span>
          </Link>

          <Link href="/explore" className="bottom-item">
            <MapPin size={19} />
            <span>Explore</span>
          </Link>

          <Link href="/crm" className="bottom-item active">
            <LayoutDashboard size={20} />
            <span>CRM</span>
          </Link>

          <Link href="/profile" className="bottom-item">
            <Users size={19} />
            <span>Profile</span>
          </Link>
        </nav>

      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        .crm-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% -10%,
              rgba(0, 55, 255, 0.06),
              transparent 32%
            ),
            #f7f8fa;
          color: #111;
          padding: 34px 20px 70px;
        }

        .crm-shell {
          width: min(1080px, 100%);
          margin: 0 auto;
        }

        .crm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 26px;
        }

        .crm-eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #0037ff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .13em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .crm-header h1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 48px);
          line-height: .98;
          letter-spacing: -0.055em;
          font-weight: 900;
        }

        .crm-header p {
          margin: 9px 0 0;
          color: #777;
          font-size: 14px;
          font-weight: 600;
        }

        .profile-button {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #111;
          text-decoration: none;
          background: #fff;
          border: 1px solid #e9e9e9;
          border-radius: 18px;
          padding: 7px 12px 7px 7px;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 8px 25px rgba(0,0,0,.04);
        }

        .profile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #111;
          color: #fff;
          font-size: 12px;
          font-weight: 900;
        }

        .welcome-card {
          min-height: 260px;
          border-radius: 32px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 20px 55px rgba(0,0,0,.12);
        }

        .welcome-card:after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          right: -80px;
          top: -110px;
          border-radius: 50%;
          background: rgba(0,55,255,.75);
          filter: blur(5px);
        }

        .welcome-content {
          position: relative;
          z-index: 2;
          max-width: 570px;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,.08);
          padding: 7px 11px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .welcome-card h2 {
          margin: 18px 0 10px;
          font-size: clamp(31px, 5vw, 51px);
          line-height: .98;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .welcome-card p {
          margin: 0;
          max-width: 440px;
          color: rgba(255,255,255,.62);
          font-size: 14px;
          line-height: 1.6;
          font-weight: 600;
        }

        .welcome-icon {
          position: relative;
          z-index: 3;
          width: 78px;
          height: 78px;
          border-radius: 25px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.14);
          backdrop-filter: blur(15px);
          flex-shrink: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin: 16px 0 32px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #ededed;
          border-radius: 22px;
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 25px rgba(0,0,0,.025);
        }

        .stat-icon {
          width: 38px;
          height: 38px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          background: #f4f5f7;
          color: #111;
          flex-shrink: 0;
        }

        .stat-card strong,
        .stat-card span {
          display: block;
        }

        .stat-card strong {
          font-size: 18px;
          font-weight: 900;
        }

        .stat-card span {
          color: #888;
          font-size: 10px;
          font-weight: 800;
          margin-top: 2px;
        }

        .section-heading {
          margin-bottom: 13px;
        }

        .section-heading span {
          color: #999;
          font-size: 9px;
          letter-spacing: .13em;
          font-weight: 900;
        }

        .section-heading h3 {
          margin: 4px 0 0;
          font-size: 21px;
          letter-spacing: -.035em;
          font-weight: 900;
        }

        .crm-menu {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 11px;
        }

        .crm-menu-card {
          display: flex;
          align-items: center;
          min-height: 78px;
          padding: 13px;
          border-radius: 22px;
          background: #fff;
          border: 1px solid #eaeaea;
          text-decoration: none;
          color: #111;
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .crm-menu-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 13px 30px rgba(0,0,0,.07);
        }

        .menu-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          margin-right: 13px;
          flex-shrink: 0;
        }

        .menu-icon.green {
          background: #e8f7ee;
          color: #16a05d;
        }

        .menu-icon.blue {
          background: #eaf0ff;
          color: #315fff;
        }

        .menu-icon.orange {
          background: #fff1e4;
          color: #e97c18;
        }

        .menu-icon.purple {
          background: #f1eaff;
          color: #7a48db;
        }

        .menu-icon.pink {
          background: #ffeaf1;
          color: #db4774;
        }

        .menu-copy {
          min-width: 0;
          flex: 1;
        }

        .menu-copy strong,
        .menu-copy span {
          display: block;
        }

        .menu-copy strong {
          font-size: 14px;
          font-weight: 900;
        }

        .menu-copy span {
          color: #8a8a8a;
          font-size: 11px;
          font-weight: 600;
          margin-top: 4px;
        }

        .menu-arrow {
          color: #aaa;
          flex-shrink: 0;
        }

        .quick-section {
          margin-top: 12px;
        }

        .add-listing {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          background: #0037ff;
          color: #fff;
          border-radius: 22px;
          text-decoration: none;
          box-shadow: 0 15px 35px rgba(0,55,255,.18);
        }

        .add-icon {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: rgba(255,255,255,.13);
        }

        .add-listing div:nth-child(2) {
          flex: 1;
        }

        .add-listing strong,
        .add-listing span {
          display: block;
        }

        .add-listing strong {
          font-size: 13px;
          font-weight: 900;
        }

        .add-listing span {
          margin-top: 3px;
          font-size: 10px;
          color: rgba(255,255,255,.68);
          font-weight: 600;
        }

        .location-card {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding: 15px;
          background: #fff;
          border: 1px solid #ededed;
          border-radius: 21px;
        }

        .location-icon {
          width: 40px;
          height: 40px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          background: #f0f7f3;
          color: #1a9b5c;
        }

        .location-card strong,
        .location-card span {
          display: block;
        }

        .location-card strong {
          font-size: 12px;
          font-weight: 900;
        }

        .location-card span {
          margin-top: 3px;
          color: #999;
          font-size: 10px;
          font-weight: 600;
        }

        .settings-icon {
          margin-left: auto;
          color: #aaa;
        }

        .crm-bottom-nav {
          display: none;
        }

        @media (max-width: 700px) {
          .crm-page {
            padding: 19px 14px 96px;
            background: #f7f8fa;
          }

          .crm-header {
            margin-bottom: 18px;
          }

          .crm-header h1 {
            font-size: 34px;
          }

          .crm-header p {
            font-size: 12px;
            margin-top: 6px;
          }

          .profile-button span {
            display: none;
          }

          .profile-button {
            padding: 5px;
            border-radius: 15px;
          }

          .profile-avatar {
            width: 34px;
            height: 34px;
          }

          .welcome-card {
            min-height: 235px;
            padding: 23px;
            border-radius: 27px;
          }

          .welcome-card h2 {
            font-size: 34px;
          }

          .welcome-card p {
            font-size: 12px;
            max-width: 285px;
          }

          .welcome-icon {
            position: absolute;
            right: 18px;
            bottom: 18px;
            width: 52px;
            height: 52px;
            border-radius: 17px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 9px;
            margin: 11px 0 25px;
          }

          .stat-card {
            border-radius: 18px;
            padding: 12px;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
            border-radius: 11px;
          }

          .stat-card strong {
            font-size: 15px;
          }

          .stat-card span {
            font-size: 9px;
          }

          .section-heading h3 {
            font-size: 19px;
          }

          .crm-menu {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .crm-menu-card {
            min-height: 72px;
            border-radius: 19px;
            padding: 11px;
          }

          .menu-icon {
            width: 45px;
            height: 45px;
            border-radius: 14px;
          }

          .menu-copy strong {
            font-size: 13px;
          }

          .menu-copy span {
            font-size: 10px;
          }

          .add-listing,
          .location-card {
            border-radius: 19px;
          }

          .crm-bottom-nav {
            position: fixed;
            z-index: 100;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            left: 12px;
            right: 12px;
            bottom: 10px;
            padding: 7px;
            border-radius: 23px;
            background: rgba(255,255,255,.94);
            border: 1px solid #e5e5e5;
            box-shadow: 0 15px 40px rgba(0,0,0,.14);
            backdrop-filter: blur(20px);
          }

          .bottom-item {
            min-height: 50px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            color: #999;
            text-decoration: none;
            border-radius: 17px;
            font-size: 8px;
            font-weight: 900;
          }

          .bottom-item.active {
            color: #0037ff;
            background: #f0f4ff;
          }
        }

        @media (max-width: 390px) {
          .crm-page {
            padding-left: 11px;
            padding-right: 11px;
          }

          .welcome-card h2 {
            font-size: 31px;
          }

          .welcome-card {
            min-height: 220px;
          }
        }
      `}</style>
    </main>
  );
}
