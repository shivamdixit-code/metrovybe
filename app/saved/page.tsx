"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ListingCard } from "@/components/ListingCard";
import { getSavedListings } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";

export default function Saved() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadSaved = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getSavedListings();

      const normalized = (data.saved || [])
        .map((item) => {
          const listing = item.listing;

          if (!listing) {
            return null;
          }

          return {
            ...listing,
            id: String(listing.id || listing._id || ""),
          };
        })
        .filter(
          (item): item is NonNullable<typeof item> => item !== null
        );

      setSaved(normalized);
    } catch (error) {
      console.error("Failed to load saved listings:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load saved listings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();

    const handleSavedChanged = () => {
      loadSaved();
    };

    window.addEventListener(
      "metrovybe-saved-changed",
      handleSavedChanged
    );

    return () => {
      window.removeEventListener(
        "metrovybe-saved-changed",
        handleSavedChanged
      );
    };
  }, []);

  return (
    <div className="page">
      <Header />

      <main className="shell inner mv-account-page">
        <div className="mv-account-head">
      <div>
        <span className="profile-kicker dark">YOUR COLLECTION</span>
        <h1>Saved places.</h1>
        <p>Places worth coming back to.</p>
      </div>
    </div>

        {loading ? (
          <div className="mv-light-state">
            <div className="mv-light-state-title">Loading saved places...</div>
            <div className="mv-light-state-text">
              Fetching your favourite places.
            </div>
          </div>
        ) : message ? (
          <div className="mv-light-state">
            <div className="mv-light-state-title">{message}</div>
            {!getToken() && (
              <a
                href="/login"
                className="btn btn-black"
                style={{
                  display: "inline-block",
                  marginTop: 14,
                }}
              >
                Login as customer to view saved
              </a>
            )}
          </div>
        ) : saved.length === 0 ? (
          <div
            className="panel"
            style={{
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "40px 24px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ maxWidth: "560px", margin: "0 auto" }}>
              <div
                aria-hidden="true"
                style={{
                  width: "76px",
                  height: "76px",
                  margin: "0 auto 22px",
                  borderRadius: "50%",
                  background: "#29AB87",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111",
                  fontSize: "28px",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                <MapPin size={30} strokeWidth={2.5} />
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                  lineHeight: 1.08,
                  fontWeight: 850,
                  letterSpacing: "-0.045em",
                  color: "#111",
                }}
              >
                No places saved yet
              </h2>

              <p
                style={{
                  margin: "14px auto 0",
                  maxWidth: "460px",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  fontWeight: 600,
                  color: "#777",
                }}
              >
                Tap the ♡ button on any listing to save it for later.
              </p>
            </div>
          </div>
        ) : (
          <>

            <div className="mv-account-grid">
              {saved.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav active="saved" />
    </div>
  );
}
