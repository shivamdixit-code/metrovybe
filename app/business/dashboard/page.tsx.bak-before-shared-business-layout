"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getToken } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type Business = {
  _id?: string;
  businessName: string;
  description?: string;
  category?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  logo?: string;
  images?: string[];
  verificationStatus?: string;
  rejectionReason?: string;
  verifiedAt?: string | null;
  status?: string;
  owner?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
  };
};

type Listing = {
  _id: string;
  title: string;
  category?: string;
  location?: string;
  price?: string;
  status?: string;
  image?: string;
};

function pretty(value?: string) {
  return (value || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (x) => x.toUpperCase());
}

function statusClass(value?: string) {
  const v = (value || "pending").toLowerCase();

  if (v === "published" || v === "verified" || v === "active") {
    return "mv-status mv-status-success";
  }

  if (v === "rejected" || v === "suspended" || v === "blocked") {
    return "mv-status mv-status-danger";
  }

  return "mv-status mv-status-warning";
}

export default function BusinessDashboard() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const cacheBust = Date.now();

      const fetchWithTimeout = async (
        url: string,
        options: RequestInit,
        timeout = 10000
      ) => {
        const controller = new AbortController();
        const timer = window.setTimeout(
          () => controller.abort(),
          timeout
        );

        try {
          return await fetch(url, {
            ...options,
            signal: controller.signal,
          });
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            throw new Error("Dashboard request timed out. Please try again.");
          }
          throw err;
        } finally {
          window.clearTimeout(timer);
        }
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      };

      const [businessResponse, listingsResponse] = await Promise.all([
        fetchWithTimeout(
          `${API_URL}/api/business/me?_t=${cacheBust}`,
          {
            cache: "no-store",
            headers,
          }
        ),

        fetchWithTimeout(
          `${API_URL}/api/listings/business/mine?_t=${cacheBust}`,
          {
            cache: "no-store",
            headers,
          }
        ),
      ]);

      if (!businessResponse.ok) {
        throw new Error(
          `Unable to load business profile (${businessResponse.status})`
        );
      }

      if (!listingsResponse.ok) {
        throw new Error(
          `Unable to load listings (${listingsResponse.status})`
        );
      }

      const businessData = await businessResponse.json();
      const listingsData = await listingsResponse.json();

      setBusiness(businessData.business || null);
      setVerification(businessData.verification || null);

      setListings(
        Array.isArray(listingsData)
          ? listingsData
          : Array.isArray(listingsData?.listings)
            ? listingsData.listings
            : []
      );

      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load business dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setHydrated(true);
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const published = listings.filter(
      (x) => x.status?.toLowerCase() === "published"
    ).length;

    const pending = listings.filter(
      (x) => x.status?.toLowerCase() === "pending"
    ).length;

    const other = Math.max(
      listings.length - published - pending,
      0
    );

    return {
      total: listings.length,
      published,
      pending,
      other,
    };
  }, [listings]);

  const verificationStatus =
    business?.verificationStatus ||
    verification?.status ||
    "pending";


  const listingStats = {
    total: listings.length,
    published: listings.filter(
      (listing) => listing.status === "published"
    ).length,
    pending: listings.filter(
      (listing) => listing.status === "pending"
    ).length,
    other: listings.filter(
      (listing) =>
        listing.status !== "published" &&
        listing.status !== "pending"
    ).length,
  };

  const publishedCount = listingStats.published;
  const pendingCount = listingStats.pending;
  const otherCount = listingStats.other;


  const displayVerification =
    verificationStatus === "verified"
      ? "Verified"
      : verificationStatus === "rejected"
        ? "Rejected"
        : verificationStatus === "suspended"
          ? "Suspended"
          : "Pending";

  const verificationTone =
    verificationStatus === "verified"
      ? "verified"
      : verificationStatus === "rejected" ||
          verificationStatus === "suspended"
        ? "danger"
        : "pending";


  const locationText =
    [business?.city, business?.state]
      .filter(Boolean)
      .join(", ") || "Location not provided";

  const ownerName =
    business?.owner?.name ||
    business?.businessName ||
    "Business Owner";

  const initials = (business?.businessName || "B")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x.charAt(0).toUpperCase())
    .join("");

  function logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("metrovybe_token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("metrovybe_token");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("accessToken");
    } catch {}

    window.location.href = "/login";
  }

  function Icon({
    name,
    size = 22,
  }: {
    name:
      | "grid"
      | "list"
      | "check"
      | "clock"
      | "shield"
      | "phone"
      | "mail"
      | "pin"
      | "refresh"
      | "logout"
      | "plus"
      | "arrow"
      | "building"
      | "edit"
      | "external";
    size?: number;
  }) {
    const common = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.9,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      "aria-hidden": true,
    };

    if (name === "grid")
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );

    if (name === "list")
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 9h9M8 13h9M8 17h6" />
          <path d="M5.5 9h.01M5.5 13h.01M5.5 17h.01" />
        </svg>
      );

    if (name === "check")
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    if (name === "clock")
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    if (name === "shield")
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );

    if (name === "phone")
      return (
        <svg {...common}>
          <path d="M7 3h3l1.5 4-2 1.5a15 15 0 0 0 6 6L17 12l4 1.5v3c0 1.4-1.1 2.5-2.5 2.5C11 19 5 13 5 5.5 5 4.1 5.9 3 7 3Z" />
        </svg>
      );

    if (name === "mail")
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );

    if (name === "pin")
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    if (name === "refresh")
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
          <path d="M3 5v5h5" />
          <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
          <path d="M21 19v-5h-5" />
        </svg>
      );

    if (name === "logout")
      return (
        <svg {...common}>
          <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
          <path d="m14 8 4 4-4 4" />
          <path d="M18 12H9" />
        </svg>
      );

    if (name === "plus")
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    if (name === "arrow")
      return (
        <svg {...common}>
          <path d="M5 12h13" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    if (name === "building")
      return (
        <svg {...common}>
          <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
          <path d="M16 9h2a2 2 0 0 1 2 2v10" />
          <path d="M8 7h4M8 11h4M8 15h4M9 21v-3h2v3" />
        </svg>
      );

    if (name === "edit")
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      );

    return (
      <svg {...common}>
        <path d="M14 5h5v5" />
        <path d="M19 5 10 14" />
        <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
      </svg>
    );
  }

  if (!hydrated) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f8fa",
          visibility: "hidden",
        }}
      />
    );
  }

  if (loading) {
    return (
      <main className="mv-premium-dashboard loading-screen">
        <div className="loading-orb" />
        <div className="loading-content">
          <div className="loading-brand">
            metro<span>vybe</span><sup>✦</sup>
          </div>
          <div className="loading-spinner" />
          <strong>Preparing your Business Center</strong>
          <p>Fetching your latest business information...</p>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mv-premium-dashboard error-screen">
        <div className="error-card">
          <div className="error-symbol">!</div>
          <div className="eyebrow">BUSINESS CENTER</div>
          <h1>We couldn't load your dashboard</h1>
          <p>{error}</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => loadDashboard(true)}
          >
            <Icon name="refresh" size={18} />
            Try again
          </button>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="mv-premium-dashboard">
      <div className="dashboard-shell">

        {/* HEADER */}
        <header className="premium-header">
          <div className="brand-lockup">
            <Link href="/" className="brand">
              metro<span>vybe</span><sup>✦</sup>
            </Link>
            <span className="business-center-label">BUSINESS CENTER</span>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="icon-action refresh-action"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
            >
              <span className={refreshing ? "spin" : ""}>
                <Icon name="refresh" size={20} />
              </span>
            </button>

            <button
              type="button"
              className="logout-action"
              onClick={logout}
            >
              <Icon name="logout" size={18} />
              <span>Log out</span>
            </button>
          </div>
        </header>

        {/* INTRO */}
        <section className="dashboard-intro">
          <div>
            <h1>
              Welcome back
              {business?.owner?.name
                ? `, ${business.owner.name.split(" ")[0]}`
                : ""}
              .
            </h1>
            <p>
              Everything you need to manage your MetroVybe business presence.
            </p>
          </div>

          {lastUpdated && (
            <div className="updated-pill">
              <span className="live-dot" />
              Updated{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </section>

        {/* BUSINESS HERO */}
        {business && (
          <section className="business-hero">
            <div className="business-hero-main">

              <div className="business-avatar">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.businessName || "Business"}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="business-identity">
                <div className="business-title-line">
                  <h2>{business.businessName || "Your Business"}</h2>

                  <span className={`verification-badge ${verificationTone}`}>
                    <Icon
                      name={
                        verificationStatus === "verified"
                          ? "check"
                          : verificationStatus === "pending"
                            ? "clock"
                            : "shield"
                      }
                      size={14}
                    />
                    {displayVerification}
                  </span>
                </div>

                <div className="business-meta">
                  <span>
                    <Icon name="building" size={16} />
                    {business.category || "Business"}
                  </span>
                  <span>
                    <Icon name="pin" size={16} />
                    {locationText}
                  </span>
                </div>

                <p className="business-description">
                  {business.description ||
                    "Build your presence, manage your listings and connect with customers across MetroVybe."}
                </p>
              </div>
            </div>

            <div className="hero-status">
              <span>ACCOUNT STATUS</span>
              <strong>
                {(business.status || "active").replace(/_/g, " ")}
              </strong>
            </div>
          </section>
        )}

        {/* KPI STATS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon green">
              <Icon name="grid" size={23} />
            </div>
            <div className="stat-copy">
              <span>Total listings</span>
              <strong>{listingStats.total}</strong>
              <small>Your business inventory</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Icon name="check" size={23} />
            </div>
            <div className="stat-copy">
              <span>Published</span>
              <strong>{publishedCount}</strong>
              <small>Visible to customers</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">
              <Icon name="clock" size={23} />
            </div>
            <div className="stat-copy">
              <span>Pending review</span>
              <strong>{pendingCount}</strong>
              <small>Awaiting approval</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Icon name="shield" size={23} />
            </div>
            <div className="stat-copy">
              <span>Profile status</span>
              <strong className="stat-word">
                {displayVerification}
              </strong>
              <small>Business verification</small>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="dashboard-grid">

          {/* LISTINGS */}
          <section className="panel listings-panel">
            <div className="panel-header">
              <div>
                <div className="panel-kicker">YOUR INVENTORY</div>
                <h2>My Listings</h2>
                <p>
                  Manage everything your customers can discover.
                </p>
              </div>

              <Link
                href="/business/listings/new"
                className="add-listing-button"
              >
                <Icon name="plus" size={19} />
                <span>Add listing</span>
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="empty-listings">
                <div className="empty-icon">
                  <Icon name="building" size={30} />
                </div>
                <h3>No listings yet</h3>
                <p>
                  Create your first listing and start reaching customers
                  on MetroVybe.
                </p>
                <Link
                  href="/business/listings/new"
                  className="empty-cta"
                >
                  Create your first listing
                  <Icon name="arrow" size={17} />
                </Link>
              </div>
            ) : (
              <div className="listing-stack">
                {listings.map((listing) => {
                  const status =
                    (listing.status || "pending").toLowerCase();

                  const statusClass =
                    status === "published"
                      ? "published"
                      : status === "pending"
                        ? "pending"
                        : status === "rejected"
                          ? "rejected"
                          : "other";

                  return (
                    <article
                      key={listing._id}
                      className="listing-card"
                    >
                      <div className="listing-thumb">
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.title}
                          />
                        ) : (
                          <Icon name="building" size={27} />
                        )}
                      </div>

                      <div className="listing-content">
                        <div className="listing-topline">
                          <h3>{listing.title}</h3>
                          <span
                            className={`listing-status ${statusClass}`}
                          >
                            <i />
                            {status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="listing-details">
                          {listing.category && (
                            <span>{listing.category}</span>
                          )}

                          {listing.location && (
                            <span>
                              <Icon name="pin" size={14} />
                              {listing.location}
                            </span>
                          )}

                          {listing.price && (
                            <span>{listing.price}</span>
                          )}
                        </div>
                      </div>

                      <div className="listing-arrow">
                        <Icon name="arrow" size={18} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {otherCount > 0 && (
              <div className="listing-note">
                {otherCount} additional listing
                {otherCount === 1 ? "" : "s"} with other status.
              </div>
            )}
          </section>

          {/* RIGHT COLUMN */}
          <aside className="side-column">

            {/* VERIFICATION */}
            <section className="panel verification-panel">
              <div className="verification-top">
                <div className="large-panel-icon">
                  <Icon name="shield" size={25} />
                </div>

                <span
                  className={`mini-status ${verificationTone}`}
                >
                  {displayVerification}
                </span>
              </div>

              <h2>Business verification</h2>

              <p>
                Keep your business profile verified to build trust with
                customers.
              </p>

              <div className="verification-line">
                <div>
                  <span>Current status</span>
                  <strong>{displayVerification}</strong>
                </div>

                {business?.verifiedAt && (
                  <div>
                    <span>Verified on</span>
                    <strong>
                      {new Date(
                        business.verifiedAt
                      ).toLocaleDateString()}
                    </strong>
                  </div>
                )}
              </div>

              {business?.rejectionReason && (
                <div className="rejection-box">
                  <strong>Review note</strong>
                  <span>{business.rejectionReason}</span>
                </div>
              )}
            </section>

            {/* PROFILE */}
            {business && (
              <section className="panel profile-panel">
                <div className="panel-small-header">
                  <div>
                    <div className="panel-kicker">PROFILE</div>
                    <h2>Business details</h2>
                  </div>

                  <div className="small-icon">
                    <Icon name="edit" size={17} />
                  </div>
                </div>

                <div className="profile-details">

                  <div className="detail-row">
                    <div className="detail-icon">
                      <Icon name="mail" size={17} />
                    </div>
                    <div>
                      <span>Email</span>
                      <strong>
                        {business.email ||
                          business.owner?.email ||
                          "Not provided"}
                      </strong>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-icon">
                      <Icon name="phone" size={17} />
                    </div>
                    <div>
                      <span>Phone</span>
                      <strong>
                        {business.phone ||
                          business.owner?.phone ||
                          "Not provided"}
                      </strong>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-icon">
                      <Icon name="pin" size={17} />
                    </div>
                    <div>
                      <span>Location</span>
                      <strong>{locationText}</strong>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-icon">
                      <Icon name="building" size={17} />
                    </div>
                    <div>
                      <span>Address</span>
                      <strong>
                        {business.address ||
                          "Address not provided"}
                      </strong>
                    </div>
                  </div>

                </div>
              </section>
            )}

          </aside>
        </div>

        {/* FOOTER */}

      </div>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .mv-premium-dashboard {
    min-height: 100vh;
    background:
      radial-gradient(circle at 85% 0%, rgba(41,171,135,.08), transparent 28%),
      #f5f7f8;
    color: #101312;
  }

  .dashboard-shell {
    width: min(1380px, calc(100% - 48px));
    margin: 0 auto;
    padding: 24px 0 42px;
  }

  .premium-header {
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 44px;
  }

  .brand {
    text-decoration: none;
    color: #101312;
    font-size: 30px;
    font-weight: 950;
    letter-spacing: -1.7px;
  }

  .brand span,
  .dashboard-footer span span {
    color: #29ab87;
  }

  .brand sup {
    color: #d4a72c;
    font-size: 14px;
    margin-left: 3px;
    top: -11px;
    position: relative;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon-action,
  .logout-action {
    height: 44px;
    border: 1px solid #e1e6e4;
    background: rgba(255,255,255,.9);
    color: #151817;
    border-radius: 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: .18s ease;
  }

  .icon-action {
    width: 44px;
  }

  .logout-action {
    gap: 8px;
    padding: 0 15px;
    font-weight: 800;
    font-size: 13px;
  }

  .icon-action:hover,
  .logout-action:hover {
    border-color: #cfd8d4;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0,0,0,.06);
  }

  .spin {
    display: inline-flex;
    animation: dashboardSpin .8s linear infinite;
  }

  @keyframes dashboardSpin {
    to { transform: rotate(360deg); }
  }

  .dashboard-intro {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 30px;
    margin-bottom: 26px;
  }

  .eyebrow,
  .panel-kicker {
    font-size: 11px;
    letter-spacing: 1.7px;
    font-weight: 950;
    color: #29ab87;
  }

  .dashboard-intro h1 {
    margin: 8px 0 8px;
    font-size: clamp(32px, 4vw, 50px);
    line-height: .98;
    letter-spacing: -2.4px;
    font-weight: 950;
  }

  .dashboard-intro p {
    margin: 0;
    color: #707875;
    font-size: 15px;
    font-weight: 600;
  }

  .updated-pill {
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 13px;
    background: #fff;
    border: 1px solid #e5eae8;
    border-radius: 999px;
    color: #59625f;
    font-size: 12px;
    font-weight: 800;
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #29ab87;
    box-shadow: 0 0 0 4px rgba(41,171,135,.12);
  }

  .business-hero {
    background: #111514;
    color: #fff;
    border-radius: 28px;
    padding: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    box-shadow: 0 20px 50px rgba(16,22,20,.13);
    margin-bottom: 20px;
    overflow: hidden;
    position: relative;
  }

  .business-hero::after {
    content: "";
    position: absolute;
    width: 330px;
    height: 330px;
    right: -120px;
    top: -180px;
    border-radius: 50%;
    border: 70px solid rgba(41,171,135,.09);
  }

  .business-hero-main {
    display: flex;
    align-items: center;
    gap: 23px;
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  .business-avatar {
    width: 108px !important;
    height: 108px !important;
    min-width: 108px !important;
    border-radius: 27px !important;
    background: linear-gradient(135deg,#29ab87,#11735a);
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 4px solid rgba(255,255,255,.12);
    box-shadow: 0 14px 35px rgba(0,0,0,.28);
  }

  .business-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .business-avatar span {
    font-size: 38px;
    font-weight: 950;
    letter-spacing: -2px;
  }

  .business-identity {
    min-width: 0;
  }

  .business-title-line {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .business-title-line h2 {
    margin: 0;
    font-size: clamp(25px, 3vw, 36px);
    letter-spacing: -1.4px;
    font-weight: 950;
  }

  .verification-badge,
  .mini-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 999px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .verification-badge {
    padding: 7px 10px;
    font-size: 11px;
  }

  .verification-badge.verified,
  .mini-status.verified {
    background: rgba(41,171,135,.16);
    color: #68e4be;
  }

  .verification-badge.pending,
  .mini-status.pending {
    background: rgba(224,166,50,.15);
    color: #f0c76a;
  }

  .verification-badge.danger,
  .mini-status.danger {
    background: rgba(239,68,68,.14);
    color: #ff9999;
  }

  .business-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 10px;
    color: #aab5b1;
    font-size: 13px;
    font-weight: 700;
  }

  .business-meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .business-description {
    max-width: 670px;
    color: #89938f;
    margin: 13px 0 0;
    line-height: 1.55;
    font-size: 13px;
  }

  .hero-status {
    min-width: 145px;
    padding: 16px 18px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 17px;
    position: relative;
    z-index: 1;
  }

  .hero-status span {
    display: block;
    color: #7e8985;
    font-size: 9px;
    letter-spacing: 1.3px;
    font-weight: 950;
    margin-bottom: 5px;
  }

  .hero-status strong {
    text-transform: capitalize;
    font-size: 14px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 14px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: #fff;
    border: 1px solid #e7ebe9;
    border-radius: 20px;
    padding: 20px;
    display: flex;
    gap: 15px;
    align-items: center;
    min-height: 122px;
    box-shadow: 0 5px 18px rgba(0,0,0,.025);
  }

  .stat-icon {
    width: 49px;
    height: 49px;
    min-width: 49px;
    border-radius: 15px;
    display: grid;
    place-items: center;
  }

  .stat-icon.green {
    background: #e4f7f1;
    color: #15946f;
  }

  .stat-icon.blue {
    background: #e9f1ff;
    color: #3675d5;
  }

  .stat-icon.amber {
    background: #fff5dd;
    color: #c78a13;
  }

  .stat-icon.purple {
    background: #f0eaff;
    color: #7853c9;
  }

  .stat-copy span,
  .stat-copy small {
    display: block;
  }

  .stat-copy span {
    color: #747d79;
    font-size: 11px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: .7px;
  }

  .stat-copy strong {
    display: block;
    margin: 2px 0;
    font-size: 29px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -1px;
  }

  .stat-copy .stat-word {
    font-size: 20px;
    margin-top: 6px;
  }

  .stat-copy small {
    color: #a0a7a4;
    font-size: 10px;
    font-weight: 650;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: minmax(0,1.55fr) minmax(330px,.85fr);
    gap: 20px;
  }

  .side-column {
    display: grid;
    gap: 20px;
    align-content: start;
  }

  .panel {
    background: #fff;
    border: 1px solid #e6ebe9;
    border-radius: 24px;
    box-shadow: 0 5px 22px rgba(0,0,0,.025);
  }

  .listings-panel {
    padding: 26px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 22px;
  }

  .panel-header h2,
  .verification-panel h2,
  .profile-panel h2 {
    margin: 5px 0 4px;
    font-size: 22px;
    letter-spacing: -.8px;
    font-weight: 950;
  }

  .panel-header p,
  .verification-panel > p {
    margin: 0;
    color: #858d8a;
    font-size: 12px;
    font-weight: 600;
  }

  .add-listing-button,
  .empty-cta,
  .primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    text-decoration: none;
    border: 0;
    cursor: pointer;
    background: #29ab87;
    color: #fff;
    padding: 12px 16px;
    border-radius: 13px;
    font-size: 12px;
    font-weight: 900;
    box-shadow: 0 8px 18px rgba(41,171,135,.18);
  }

  .add-listing-button:hover,
  .empty-cta:hover,
  .primary-button:hover {
    background: #218d70;
  }

  .listing-stack {
    display: grid;
    gap: 10px;
  }

  .listing-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px;
    border: 1px solid #e8ecea;
    border-radius: 17px;
    transition: .18s ease;
  }

  .listing-card:hover {
    border-color: #cfe2db;
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(0,0,0,.045);
  }

  .listing-thumb {
    width: 61px;
    height: 61px;
    min-width: 61px;
    border-radius: 14px;
    background: #edf5f2;
    color: #239b78;
    display: grid;
    place-items: center;
    overflow: hidden;
  }

  .listing-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .listing-content {
    min-width: 0;
    flex: 1;
  }

  .listing-topline {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }

  .listing-topline h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 900;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .listing-status {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 8px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .listing-status i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
  }

  .listing-status.published {
    background: #e3f7f0;
    color: #178764;
  }

  .listing-status.pending {
    background: #fff3d9;
    color: #b77a0b;
  }

  .listing-status.rejected {
    background: #fee8e8;
    color: #c34242;
  }

  .listing-status.other {
    background: #edf0f0;
    color: #69716e;
  }

  .listing-details {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
    color: #8b9490;
    font-size: 10px;
    font-weight: 650;
  }

  .listing-details span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .listing-arrow {
    width: 32px;
    height: 32px;
    min-width: 32px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    color: #8b9490;
    background: #f5f7f6;
  }

  .listing-note {
    margin-top: 14px;
    color: #9a9f9d;
    font-size: 10px;
    font-weight: 650;
  }

  .empty-listings {
    padding: 65px 20px 58px;
    text-align: center;
    border: 1px dashed #dce4e0;
    border-radius: 18px;
    background: #fbfcfc;
  }

  .empty-icon {
    width: 68px;
    height: 68px;
    margin: 0 auto 15px;
    border-radius: 20px;
    background: #e7f7f2;
    color: #239b78;
    display: grid;
    place-items: center;
  }

  .empty-listings h3 {
    margin: 0 0 7px;
    font-size: 17px;
    font-weight: 900;
  }

  .empty-listings p {
    max-width: 380px;
    margin: 0 auto 18px;
    color: #8a928f;
    font-size: 12px;
    line-height: 1.55;
  }

  .verification-panel,
  .profile-panel {
    padding: 23px;
  }

  .verification-top,
  .panel-small-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .large-panel-icon {
    width: 51px;
    height: 51px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background: #e6f7f1;
    color: #218d70;
  }

  .mini-status {
    padding: 6px 9px;
    font-size: 9px;
  }

  .verification-panel h2 {
    margin-top: 18px;
  }

  .verification-line {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 18px;
  }

  .verification-line > div {
    padding: 12px;
    border-radius: 13px;
    background: #f6f8f7;
  }

  .verification-line span,
  .verification-line strong {
    display: block;
  }

  .verification-line span {
    color: #8d9592;
    font-size: 9px;
    font-weight: 800;
    margin-bottom: 4px;
  }

  .verification-line strong {
    font-size: 12px;
    text-transform: capitalize;
  }

  .rejection-box {
    margin-top: 13px;
    padding: 12px;
    border-radius: 13px;
    background: #fff2f2;
    color: #9b4444;
  }

  .rejection-box strong,
  .rejection-box span {
    display: block;
  }

  .rejection-box strong {
    font-size: 10px;
    margin-bottom: 3px;
  }

  .rejection-box span {
    font-size: 11px;
    line-height: 1.45;
  }

  .panel-small-header h2 {
    margin-bottom: 0;
  }

  .small-icon {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    color: #6c7672;
    background: #f4f6f5;
    border-radius: 10px;
  }

  .profile-details {
    margin-top: 20px;
    display: grid;
    gap: 2px;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 0;
    border-bottom: 1px solid #edf0ef;
  }

  .detail-row:last-child {
    border-bottom: 0;
  }

  .detail-icon {
    width: 34px;
    height: 34px;
    min-width: 34px;
    display: grid;
    place-items: center;
    color: #299b7a;
    background: #edf8f4;
    border-radius: 10px;
  }

  .detail-row div:last-child {
    min-width: 0;
  }

  .detail-row span,
  .detail-row strong {
    display: block;
  }

  .detail-row span {
    color: #929996;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .5px;
    margin-bottom: 2px;
  }

  .detail-row strong {
    color: #222725;
    font-size: 11px;
    line-height: 1.4;
    word-break: break-word;
  }

  .dashboard-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px 3px 0;
    color: #939a97;
    font-size: 10px;
    font-weight: 650;
  }

  .dashboard-footer strong {
    color: #252a28;
    font-weight: 900;
  }

  .loading-screen,
  .error-screen {
    display: grid;
    place-items: center;
    padding: 30px;
    position: relative;
    overflow: hidden;
  }

  .loading-orb {
    position: absolute;
    width: 430px;
    height: 430px;
    border-radius: 50%;
    background: rgba(41,171,135,.07);
    filter: blur(2px);
  }

  .loading-content,
  .error-card {
    position: relative;
    z-index: 1;
    text-align: center;
    background: rgba(255,255,255,.88);
    border: 1px solid #e4eae7;
    border-radius: 26px;
    padding: 42px 38px;
    box-shadow: 0 20px 60px rgba(0,0,0,.07);
  }

  .loading-brand {
    font-size: 29px;
    font-weight: 950;
    letter-spacing: -1.5px;
    margin-bottom: 27px;
  }

  .loading-brand span {
    color: #29ab87;
  }

  .loading-brand sup {
    color: #d4a72c;
  }

  .loading-spinner {
    width: 38px;
    height: 38px;
    border: 3px solid #dce7e3;
    border-top-color: #29ab87;
    border-radius: 50%;
    margin: 0 auto 17px;
    animation: dashboardSpin .75s linear infinite;
  }

  .loading-content strong {
    display: block;
    font-size: 15px;
    margin-bottom: 6px;
  }

  .loading-content p,
  .error-card p {
    margin: 0;
    color: #7c8581;
    font-size: 12px;
  }

  .error-symbol {
    width: 56px;
    height: 56px;
    margin: 0 auto 17px;
    display: grid;
    place-items: center;
    border-radius: 17px;
    background: #fee9e9;
    color: #c74c4c;
    font-size: 25px;
    font-weight: 950;
  }

  .error-card h1 {
    margin: 8px 0 8px;
    font-size: 25px;
    letter-spacing: -1px;
  }

  .primary-button {
    margin-top: 22px;
  }

  @media (max-width: 1050px) {
    .stats-grid {
      grid-template-columns: repeat(2,1fr);
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .side-column {
      grid-template-columns: repeat(2,1fr);
    }
  }

  @media (max-width: 720px) {
    .dashboard-shell {
      width: min(100% - 28px, 1380px);
      padding-top: 12px;
    }

    .premium-header {
      margin-bottom: 30px;
    }

    .brand {
      font-size: 25px;
    }

    .logout-action {
      width: 44px;
      padding: 0;
    }

    .logout-action span {
      display: none;
    }

    .dashboard-intro {
      display: block;
    }

    .dashboard-intro h1 {
      font-size: 35px;
      letter-spacing: -1.8px;
    }

    .updated-pill {
      margin-top: 16px;
    }

    .business-hero {
      padding: 21px;
      border-radius: 22px;
      display: block;
    }

    .business-hero-main {
      align-items: flex-start;
      gap: 15px;
    }

    .business-avatar {
      width: 82px !important;
      height: 82px !important;
      min-width: 82px !important;
      border-radius: 21px !important;
    }

    .business-avatar span {
      font-size: 29px;
    }

    .business-title-line h2 {
      font-size: 22px;
    }

    .business-description {
      font-size: 12px;
    }

    .hero-status {
      margin-top: 18px;
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .stat-card {
      min-height: 108px;
      padding: 14px;
      border-radius: 17px;
      gap: 10px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 12px;
    }

    .stat-copy strong {
      font-size: 24px;
    }

    .stat-copy .stat-word {
      font-size: 16px;
    }

    .listings-panel,
    .verification-panel,
    .profile-panel {
      padding: 18px;
      border-radius: 20px;
    }

    .panel-header {
      align-items: flex-start;
    }

    .add-listing-button {
      width: 44px;
      height: 44px;
      padding: 0;
    }

    .add-listing-button span {
      display: none;
    }

    .listing-card {
      padding: 10px;
      gap: 10px;
    }

    .listing-thumb {
      width: 52px;
      height: 52px;
      min-width: 52px;
    }

    .listing-topline {
      display: block;
    }

    .listing-status {
      margin-top: 6px;
    }

    .listing-arrow {
      display: none;
    }

    .side-column {
      grid-template-columns: 1fr;
    }

    .dashboard-footer {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.5;
      gap: 4px;
    }

    .dashboard-footer > span {
      display: inline-flex;
      align-items: center;
      flex-wrap: nowrap;
      white-space: nowrap;
    }

    .dashboard-footer > span:last-child {
      display: block;
      margin-top: 0;
      white-space: nowrap;
    }

    .dashboard-footer .brand-lockup,
    .dashboard-footer .brand-lockup span,
    .dashboard-footer .brand-lockup sup {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
    }
  }

  @media (max-width: 420px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .business-meta {
      display: grid;
      gap: 7px;
    }

    .business-title-line {
      display: block;
    }

    .verification-badge {
      margin-top: 8px;
    }
  }

      .brand-lockup {
        display: flex;
        align-items: center;
        gap: 13px;
        min-width: 0;
      }

      .business-center-label {
        color: #1677ff;
        font-size: 12px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: 1.15px;
        white-space: nowrap;
        padding-left: 13px;
        border-left: 1px solid #d9e2ef;
      }

      @media (max-width: 640px) {
        .brand-lockup {
          gap: 9px;
        }

        .business-center-label {
          font-size: 8px;
          letter-spacing: 0.65px;
          padding-left: 9px;
        }
      }



/* ===== FOOTER MOBILE NO-WRAP FIX ===== */

.mv-dashboard-footer,
.dashboard-footer,
.premium-dashboard-footer {
  white-space: nowrap !important;
}

.mv-dashboard-footer > span,
.dashboard-footer > span,
.premium-dashboard-footer > span {
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  flex-wrap: nowrap !important;
}

@media (max-width: 600px) {
  .mv-dashboard-footer,
  .dashboard-footer,
  .premium-dashboard-footer {
    white-space: nowrap !important;
    flex-wrap: nowrap !important;
    font-size: 11px !important;
  }

  .mv-dashboard-footer > span,
  .dashboard-footer > span,
  .premium-dashboard-footer > span {
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }

  .mv-dashboard-footer > a,
  .dashboard-footer > a,
  .premium-dashboard-footer > a {
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }
}

@media (max-width: 380px) {
  .mv-dashboard-footer,
  .dashboard-footer,
  .premium-dashboard-footer {
    font-size: 10px !important;
  }
}





/* ===== CLEAN BUSINESS FOOTER ===== */

.dashboard-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  min-width: 0;
}

.footer-brand-line {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 14px;
  white-space: nowrap;
  width: max-content;
  max-width: 100%;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  font-weight: 900;
}

.footer-brand > span {
  display: inline !important;
  white-space: nowrap !important;
}

.footer-brand sup {
  display: inline !important;
  white-space: nowrap !important;
  margin-left: 2px;
}

.footer-business {
  display: inline-block;
  white-space: nowrap;
  color: #1677ff;
  font-weight: 800;
}

.footer-tagline {
  display: block;
  white-space: nowrap;
  margin: 0;
  color: #8a8f93;
  font-weight: 700;
}

@media (max-width: 600px) {
  .dashboard-footer {
    width: 100%;
    overflow: visible;
  }

  .footer-brand-line {
    gap: 10px;
    width: max-content;
    max-width: none;
  }

  .footer-brand,
  .footer-brand > span,
  .footer-brand sup,
  .footer-business,
  .footer-tagline {
    white-space: nowrap !important;
  }

  .footer-tagline {
    margin-top: 1px;
  }
}

`;

