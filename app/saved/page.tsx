"use client";

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
            id: String(listing.id),
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

      <main className="shell inner">
        <h1 className="page-title">SAVED.</h1>

        {loading ? (
          <div className="panel">
            <h2>Loading saved listings...</h2>
            <p className="subtle">
              Fetching your favourite places.
            </p>
          </div>
        ) : message ? (
          <div className="panel">
            <h2>{message}</h2>
            {!getToken() && (
              <a
                href="/login"
                className="btn btn-black"
                style={{
                  display: "inline-block",
                  marginTop: 14,
                }}
              >
                Login to view saved
              </a>
            )}
          </div>
        ) : saved.length === 0 ? (
          <div className="panel">
            <h2>No saved listings yet.</h2>
            <p className="subtle">
              Tap the ♡ button on any listing to save it for later.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: 18,
                fontWeight: 800,
              }}
            >
              {saved.length}{" "}
              {saved.length === 1 ? "saved listing" : "saved listings"}
            </div>

            <div className="grid-3">
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
