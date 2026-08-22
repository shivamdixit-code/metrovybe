"use client";
import { CalendarDays, Clock3 } from "lucide-react";

import { Header } from "@/components/Header";

import { BottomNav } from "@/components/BottomNav";
import { useEffect, useState } from "react";
import {
  cancelBooking,
  getCustomerBookings,
  type Booking,
} from "@/lib/api";

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerBookings();

      console.log("===== CUSTOMER BOOKINGS API =====");
      console.log("Bookings response:", data);
      console.log("Bookings array:", data.bookings);

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (cancelling) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setCancelling(bookingId);

      const result = await cancelBooking(bookingId);

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? result.booking
            : booking
        )
      );
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to cancel booking."
      );
    } finally {
      setCancelling(null);
    }
  };

  const getStatusClass = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "confirmed";
      case "rejected":
        return "rejected";
      case "cancelled":
        return "cancelled";
      case "completed":
        return "completed";
      default:
        return "pending";
    }
  };

  const formatStatus = (status: Booking["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "Date not specified";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date not specified";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="page">
      <Header />

      <main
        className="shell inner mv-account-page"
        style={{
          paddingBottom: 100,
        }}
      >
        <div className="mv-account-head">
      <div>
        <span className="profile-kicker dark">YOUR ACTIVITY</span>
        <h1>Your bookings.</h1>
        <p>Keep track of your upcoming and past plans.</p>
      </div>
    </div>

        {loading ? (
          <div className="mv-light-state">
            <div className="mv-light-state-title">Loading bookings...</div>
            <div className="mv-light-state-text">
              Fetching your latest booking requests.
            </div>
          </div>
        ) : error ? (
          <div className="mv-light-state">
            <div className="mv-light-state-title">Couldn&apos;t load bookings.</div>
            <div className="mv-light-state-text">{error}</div>

            <button
              type="button"
              onClick={loadBookings}
              style={{
                marginTop: 16,
                border: "2px solid #111",
                background: "#111",
                color: "#fff",
                borderRadius: 14,
                padding: "11px 18px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div
            className="mv-light-state"
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
            <div style={{ maxWidth: "460px", margin: "0 auto" }}>
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
                }}
              >
                <CalendarDays size={28} strokeWidth={2.5} />
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
                No bookings yet
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
                Your confirmed PG, food and service bookings will show here.
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 10,
            }}
          >
            {bookings.map((booking) => {
              const listing =
                booking.listing &&
                typeof booking.listing === "object"
                  ? booking.listing
                  : null;

              const business =
                booking.business &&
                typeof booking.business === "object"
                  ? booking.business
                  : null;

              const title =
                listing?.title ||
                booking.listingTitle ||
                "Booking";

              return (
                <div
                  key={booking._id}
                  className="mv-booking-card"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 14,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <h2
                        className="mv-booking-title"
                      >
                        {title}
                      </h2>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {business?.businessName && (
                          <div className="mv-booking-business">
                            {business.businessName}
                          </div>
                        )}

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            marginTop: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            className="mv-booking-tooltip"
                            data-tooltip="Booking date"
                            style={{
                              display: "inline-flex",
                              position: "relative",
                              cursor: "pointer",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: "#EEF4FF",
                              border: "1px solid #C9DBFF",
                              color: "#1767D8",
                              fontSize: 10.5,
                              fontWeight: 800,
                              lineHeight: 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <CalendarDays size={12} strokeWidth={2.4} />
                            {formatDate(booking.bookingDate)}
                          </span>

                          <span
                            className="mv-booking-tooltip"
                            data-tooltip="Requested on"
                            style={{
                              display: "inline-flex",
                              position: "relative",
                              cursor: "pointer",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: "#FFF8E6",
                              border: "1px solid #F2E0A8",
                              color: "#8A6818",
                              fontSize: 10.5,
                              fontWeight: 800,
                              lineHeight: 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Clock3 size={12} strokeWidth={2.4} />
                            {formatDate(booking.createdAt)}
                          </span>
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        flexShrink: 0,
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 900,
                        background:
                          booking.status === "confirmed"
                            ? "#DCFCE7"
                            : booking.status === "rejected"
                              ? "#FEE2E2"
                              : booking.status === "cancelled"
                                ? "#F3F4F6"
                                : booking.status === "completed"
                                  ? "#E0E7FF"
                                  : "#FFF7D6",
                        color:
                          booking.status === "confirmed"
                            ? "#166534"
                            : booking.status === "rejected"
                              ? "#991B1B"
                              : booking.status === "cancelled"
                                ? "#4B5563"
                                : booking.status === "completed"
                                  ? "#3730A3"
                                  : "#92400E",
                      }}
                    >
                      {formatStatus(booking.status)}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 13,
                      display: "grid",
                      gap: 7,
                      fontSize: 14,
                    }}
                  >
                    {booking.message && (
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          width: "100%",
                          maxWidth: "none",
                          padding: "11px 14px",
                          borderRadius: 12,
                          background: "#F7F9FC",
                          border: "1px solid #DCE3EC",
                          color: "#20252B",
                          lineHeight: 1.5,
                          boxSizing: "border-box",
                        }}
                      >
                        <strong
                          style={{
                            color: "#111827",
                            fontWeight: 800,
                            marginRight: 4,
                          }}
                        >
                          Message:
                        </strong>
                        {booking.message}
                      </div>
                    )}

                    {booking.businessNote && (
                      <div>
                        <strong>Business note:</strong>{" "}
                        {booking.businessNote}
                      </div>
                    )}
                  </div>

                  {booking.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancelling === booking._id}
                      style={{
                        marginTop: 13,
                        width: "100%",
                        border: "1px solid #ddd",
                        background: "#fff",
                        color: "#111",
                        borderRadius: 11,
                        padding: "10px 13px",
                        fontWeight: 800,
                        cursor:
                          cancelling === booking._id
                            ? "wait"
                            : "pointer",
                        opacity:
                          cancelling === booking._id ? 0.6 : 1,
                      }}
                    >
                      {cancelling === booking._id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
