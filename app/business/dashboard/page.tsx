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

        const [businessResponse, listingsResponse] = await Promise.all([
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
      <main style={{ padding: 40 }}>
        <p>Loading business dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Business Dashboard</h1>
        <p style={{ color: "#c00" }}>{error}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f8fa",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#111",
                fontSize: 25,
                fontWeight: 800,
              }}
            >
              metro<span style={{ color: "#16a34a" }}>vybe</span>✦
            </Link>

            <h1 style={{ margin: "18px 0 5px" }}>
              Business Dashboard
            </h1>

            <p style={{ color: "#666", margin: 0 }}>
              Manage your MetroVybe business.
            </p>
          </div>

          <Link
            href="/"
            style={{
              padding: "10px 16px",
              borderRadius: 9,
              background: "#111",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to marketplace
          </Link>
        </header>

        {business && (
          <section
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 25,
              marginBottom: 25,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  {business.businessName}
                </h2>

                <p style={{ color: "#666" }}>
                  {business.city || "MetroVybe Business"}
                </p>
              </div>

              <span
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  background:
                    business.verificationStatus === "verified"
                      ? "#dcfce7"
                      : "#fef3c7",
                  color:
                    business.verificationStatus === "verified"
                      ? "#166534"
                      : "#92400e",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {business.verificationStatus || "pending"}
              </span>
            </div>
          </section>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 18,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 22,
              borderRadius: 15,
            }}
          >
            <p style={{ color: "#777", margin: 0 }}>
              My Listings
            </p>
            <h2 style={{ margin: "8px 0 0" }}>
              {listings.length}
            </h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: 22,
              borderRadius: 15,
            }}
          >
            <p style={{ color: "#777", margin: 0 }}>
              Published
            </p>
            <h2 style={{ margin: "8px 0 0" }}>
              {listings.filter((x) => x.status === "published").length}
            </h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: 22,
              borderRadius: 15,
            }}
          >
            <p style={{ color: "#777", margin: 0 }}>
              Pending Review
            </p>
            <h2 style={{ margin: "8px 0 0" }}>
              {listings.filter((x) => x.status === "pending").length}
            </h2>
          </div>
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 25,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h2 style={{ margin: 0 }}>My Listings</h2>

            <Link
              href="/business/listings/new"
              style={{
                background: "#16a34a",
                color: "#fff",
                padding: "11px 16px",
                borderRadius: 9,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              + Add Listing
            </Link>
          </div>

          {listings.length === 0 ? (
            <div
              style={{
                padding: 35,
                textAlign: "center",
                color: "#777",
              }}
            >
              <p>You don't have any listings yet.</p>

              <Link
                href="/business/listings/new"
                style={{
                  color: "#16a34a",
                  fontWeight: 700,
                }}
              >
                Create your first listing →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 15,
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 5px" }}>
                      {listing.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#777",
                        fontSize: 14,
                      }}
                    >
                      {listing.location || ""}
                      {listing.price
                        ? ` • ${listing.price}`
                        : ""}
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}
                  >
                    {listing.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
