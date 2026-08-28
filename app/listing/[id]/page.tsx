"use client";

import { useEffect, useState } from "react";
import { getListing, checkSavedListing, saveListing, unsaveListing, createBooking } from "@/lib/api";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getToken, getUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Heart, CalendarDays, X } from "lucide-react";

export default function Listing({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingSending, setBookingSending] = useState(false);

  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { id } = await params;
        const listing = await getListing(id);

        if (!mounted) return;

        if (!listing) {
          notFound();
          return;
        }

        setItem(listing);

        const token = getToken();
        const user = getUser();

        if (token && user?.role === "customer") {
          try {
            const result = await checkSavedListing(listing.id);
            if (mounted) {
              setSaved(Boolean(result.saved));
            }
          } catch (error) {
            console.error("Failed to check saved listing:", error);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [params]);

  if (loading) {
    return (
      <div className="page">
        <Header />

        <main className="shell inner">
          <div
            style={{
              minHeight: "55vh",
              display: "grid",
              placeItems: "center",
              padding: "32px 16px",
            }}
          >
            <div
              style={{
                width: "min(100%, 280px)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  margin: "0 auto 16px",
                  borderRadius: 18,
                  background: "rgba(41,171,135,0.12)",
                  display: "grid",
                  placeItems: "center",
                  animation: "mvLoaderPulse 1.4s ease-in-out infinite",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "3px solid rgba(41,171,135,0.22)",
                    borderTopColor: "#29AB87",
                    animation: "mvLoaderSpin 0.8s linear infinite",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#111",
                }}
              >
                Finding your Vybe...
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#777",
                }}
              >
                Getting everything ready for you.
              </div>
            </div>
          </div>
        </main>

        <BottomNav active="explore" />

        <style jsx>{`
          @keyframes mvLoaderSpin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes mvLoaderPulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.04);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  const toggleSaved = async () => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      window.location.href = "/login";
      return;
    }

    if (user.role !== "customer") {
      setMessage("Please Login as customer to save listings.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      if (saved) {
        await unsaveListing(item.id);
        setSaved(false);
        setMessage("Listing removed from saved.");
      } else {
        await saveListing(item.id);
        setSaved(true);
        setMessage("Listing saved successfully.");
      }

      window.dispatchEvent(new Event("metrovybe-saved-changed"));
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update saved listing."
      );
    } finally {
      setSaving(false);
    }
  };

  const sendBooking = async () => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      window.location.href = "/login";
      return;
    }

    if (user.role !== "customer") {
      setMessage("Please Login as customer to make a booking.");
      return;
    }

    try {
      setBookingSending(true);
      setMessage("");

      const result = await createBooking({
        listingId: item.id,
        bookingDate: bookingDate || undefined,
        message: bookingMessage.trim() || undefined,
      });

      setMessage(result.message || "Booking request sent successfully.");
      setBookingOpen(false);
      setBookingDate("");
      setBookingMessage("");

      window.dispatchEvent(new Event("metrovybe-bookings-changed"));
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to send booking request. Please try again."
      );
    } finally {
      setBookingSending(false);
    }
  };

  const sendEnquiry = async () => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      window.location.href = "/login";
      return;
    }

    if (user.role !== "customer") {
      setMessage("Please Login as customer to send an enquiry.");
      return;
    }

    if (!enquiryMessage.trim()) {
      setMessage("Please enter your message.");
      return;
    }

    try {
      setSending(true);
      setMessage("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/enquiries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            listingId: item.id,
            message: enquiryMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send enquiry");
      }

      setMessage("Enquiry sent successfully.");
      setEnquiryMessage("");
      setEnquiryOpen(false);
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to send enquiry. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <Header />

      <main className="shell inner business-listing-detail-page">
        <Link href="/explore" style={{ fontWeight: 900 }}>
          ← Back to explore
        </Link>

        <div className="grid-2" style={{ marginTop: 20 }}>
          <div className="panel">
            <div
              className="listing-detail-image"
              style={{
                height: 450,
                overflow: "hidden",
                borderRadius: 24,
                position: "relative",
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, var(--green) 0%, var(--cyan) 45%, var(--purple) 100%)",
                    fontSize: 42,
                  }}
                >
                  🏠
                </div>
              )}

              <button
                type="button"
                onClick={toggleSaved}
                disabled={saving}
                aria-label={saved ? "Remove from saved" : "Save listing"}
                title={saved ? "Remove from saved" : "Save listing"}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.85)",
                  background: "rgba(255,255,255,0.96)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: saving ? "wait" : "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
                  zIndex: 5,
                }}
              >
                <Heart
                  size={23}
                  strokeWidth={2.4}
                  fill={saved ? "#ff3b81" : "none"}
                  color={saved ? "#ff3b81" : "#111"}
                />
              </button>
            </div>
          </div>

          <div className="panel">
            <span
              className="badge"
              style={{
                position: "static",
                display: "inline-block",
              }}
            >
              FEATURED
            </span>

            <h1
              className="page-title"
              style={{
                fontSize: 52,
                marginTop: 18,
              }}
            >
              {item.title}
            </h1>

            <p>
              {item.location} · ⭐ {item.rating} ({item.reviews || 0} reviews)
            </p>

            <h2 style={{ fontSize: 30 }}>{item.price}</h2>

            <div className="tags">
              {(item.tags || []).map((tag: string) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <p style={{ lineHeight: 1.6 }}>
              {item.description ||
                "A trusted MetroVybe listing with verified details, transparent pricing, and useful services near you."}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                type="button"
                className="btn btn-black"
                onClick={() => {
                  setEnquiryOpen(false);
                  setBookingOpen(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: 0,
                  cursor: "pointer",
                }}
              >
                <CalendarDays size={18} />
                Book Now
              </button>

              <button
                type="button"
                className="btn"
                onClick={toggleSaved}
                disabled={saving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                <Heart
                  size={18}
                  fill={saved ? "#ff3b81" : "none"}
                  color={saved ? "#ff3b81" : "currentColor"}
                />
                {saved ? "Saved" : "Save"}
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => {
                  setBookingOpen(false);
                  setEnquiryOpen(true);
                }}
                style={{
                  display: "inline-block",
                  cursor: "pointer",
                }}
              >
                Enquire Now
              </button>
            </div>

            {message && (
              <div className="mv-listing-toast" role="status">
                <span className="mv-listing-toast-icon">✓</span>
                <span>{message}</span>
              </div>
            )}

            {bookingOpen && (
              <div
                style={{
                  marginTop: 18,
                  padding: 18,
                  border: "1px solid #e5e7eb",
                  borderRadius: 18,
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 20 }}>
                    Send booking request
                  </h3>

                  <button
                    type="button"
                    onClick={() => setBookingOpen(false)}
                    disabled={bookingSending}
                    aria-label="Close booking"
                    style={{
                      width: 34,
                      height: 34,
                      border: 0,
                      borderRadius: "50%",
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <p
                  style={{
                    marginTop: 6,
                    marginBottom: 12,
                    color: "#6b7280",
                    fontSize: 13,
                  }}
                >
                  Choose your preferred date and add a message for the
                  business.
                </p>

                <input
                  type="date"
                  value={bookingDate}
                  onChange={(event) => setBookingDate(event.target.value)}
                  style={{
                    width: "100%",
                    padding: 13,
                    border: "1px solid #d9dde3",
                    borderRadius: 12,
                    font: "inherit",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />

                <textarea
                  value={bookingMessage}
                  onChange={(event) =>
                    setBookingMessage(event.target.value)
                  }
                  maxLength={2000}
                  rows={4}
                  placeholder="Optional message..."
                  style={{
                    width: "100%",
                    minHeight: 100,
                    marginTop: 10,
                    resize: "vertical",
                    padding: 13,
                    border: "1px solid #d9dde3",
                    borderRadius: 12,
                    font: "inherit",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-black"
                    onClick={sendBooking}
                    disabled={bookingSending}
                  >
                    {bookingSending
                      ? "Sending..."
                      : "Send Booking Request"}
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => setBookingOpen(false)}
                    disabled={bookingSending}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {enquiryOpen && (
              <div
                className="listing-enquiry-box"
                style={{
                  marginTop: 18,
                  padding: 18,
                  border: "1px solid #e5e7eb",
                  borderRadius: 18,
                  background: "#fff",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 20 }}>
                  Send an enquiry
                </h3>

                <p
                  style={{
                    marginTop: 6,
                    marginBottom: 12,
                    color: "#6b7280",
                    fontSize: 13,
                  }}
                >
                  Ask the business anything about this listing.
                </p>

                <textarea
                  value={enquiryMessage}
                  onChange={(event) =>
                    setEnquiryMessage(event.target.value)
                  }
                  maxLength={2000}
                  rows={5}
                  placeholder="Write your message..."
                  style={{
                    width: "100%",
                    minHeight: 120,
                    resize: "vertical",
                    padding: 13,
                    border: "1px solid #d9dde3",
                    borderRadius: 12,
                    font: "inherit",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-black"
                    onClick={sendEnquiry}
                    disabled={sending}
                  >
                    {sending ? "Sending..." : "Send Enquiry"}
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setEnquiryOpen(false);
                      setMessage("");
                    }}
                    disabled={sending}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav active="explore" />
    </div>
  );
}
