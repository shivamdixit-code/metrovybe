"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type Business = {
  businessName: string;
  category?: string;
  city?: string;
  verificationStatus?: string;
  status?: string;
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

export default function BusinessDashboard() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = getToken();

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const [businessResponse, listingsResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/business/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(`${API_URL}/api/listings/business/mine`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (!businessResponse.ok) {
          throw new Error("Unable to load business profile");
        }

        if (!listingsResponse.ok) {
          throw new Error("Unable to load listings");
        }

        const businessData = await businessResponse.json();
        const listingsData = await listingsResponse.json();

        setBusiness(businessData.business);
        setListings(listingsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="mv-business-dashboard">
        <div className="mv-business-loading">
          <div className="mv-loading-mark">✦</div>
          <h2>Loading your Vybe...</h2>
          <p>Getting your business dashboard ready.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mv-business-dashboard">
        <div className="mv-business-error">
          <div className="mv-error-icon">!</div>
          <h1>Something went wrong.</h1>
          <p>{error}</p>
          <Link href="/business/dashboard">
            Try again →
          </Link>
        </div>
      </main>
    );
  }

  const published = listings.filter(
    (x) => x.status === "published"
  ).length;

  const pending = listings.filter(
    (x) => x.status === "pending"
  ).length;

  const verification =
    business?.verificationStatus || "pending";

  return (
    <main className="mv-business-dashboard">
      <div className="mv-business-shell">

        <header className="mv-business-header">
          <div>
            <Link href="/" className="mv-business-logo">
              metro<span>vybe</span>✦
            </Link>

            <div className="mv-business-eyebrow">
              BUSINESS HUB
            </div>

            <h1>YOUR BUSINESS.<br />YOUR VYBE.</h1>

            <p>
              Manage your listings and grow your presence
              on MetroVybe.
            </p>
          </div>

          <Link href="/" className="mv-business-back">
            ← Marketplace
          </Link>
        </header>

        {business && (
          <section className="mv-business-profile-card">
            <div className="mv-business-profile-main">
              <div className="mv-business-avatar">
                {business.businessName
                  ?.charAt(0)
                  ?.toUpperCase() || "B"}
              </div>

              <div>
                <div className="mv-business-small-label">
                  BUSINESS PROFILE
                </div>

                <h2>{business.businessName}</h2>

                <p>
                  {business.category || "MetroVybe Business"}
                  {business.city
                    ? ` · ${business.city}`
                    : ""}
                </p>
              </div>
            </div>

            <span
              className={`mv-business-status ${
                verification === "verified"
                  ? "verified"
                  : "pending"
              }`}
            >
              {verification === "verified"
                ? "✓ VERIFIED"
                : "◷ PENDING"}
            </span>
          </section>
        )}

        <section className="mv-business-stats">

          <div className="mv-business-stat green">
            <span>MY LISTINGS</span>
            <strong>{listings.length}</strong>
            <small>Total listings</small>
          </div>

          <div className="mv-business-stat cyan">
            <span>PUBLISHED</span>
            <strong>{published}</strong>
            <small>Live on MetroVybe</small>
          </div>

          <div className="mv-business-stat orange">
            <span>PENDING</span>
            <strong>{pending}</strong>
            <small>Awaiting review</small>
          </div>

        </section>

        <section className="mv-business-listings">

          <div className="mv-business-section-head">
            <div>
              <div className="mv-business-small-label">
                YOUR SPACE
              </div>
              <h2>MY LISTINGS</h2>
            </div>

            <Link
              href="/business/listings/new"
              className="mv-business-add"
            >
              + ADD LISTING
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="mv-business-empty">
              <div className="mv-empty-icon">✦</div>

              <h3>No listings yet.</h3>

              <p>
                Put your business on the MetroVybe map.
              </p>

              <Link
                href="/business/listings/new"
                className="mv-business-add"
              >
                CREATE YOUR FIRST LISTING →
              </Link>
            </div>
          ) : (
            <div className="mv-business-list-grid">
              {listings.map((listing) => (
                <article
                  key={listing._id}
                  className="mv-business-listing-card"
                >
                  <div className="mv-business-listing-top">
                    <div className="mv-business-listing-icon">
                      {listing.category === "stay"
                        ? "🏠"
                        : listing.category === "eat"
                        ? "🍴"
                        : listing.category === "live"
                        ? "🧺"
                        : listing.category === "move"
                        ? "🚚"
                        : "✦"}
                    </div>

                    <span
                      className={`mv-listing-status ${
                        listing.status === "published"
                          ? "live"
                          : "waiting"
                      }`}
                    >
                      {listing.status === "published"
                        ? "LIVE"
                        : listing.status || "PENDING"}
                    </span>
                  </div>

                  <h3>{listing.title}</h3>

                  <p>
                    {listing.location ||
                      "MetroVybe location"}
                  </p>

                  {listing.price && (
                    <strong className="mv-listing-price">
                      {listing.price}
                    </strong>
                  )}
                </article>
              ))}
            </div>
          )}

        </section>

      </div>
    </main>
  );
}
