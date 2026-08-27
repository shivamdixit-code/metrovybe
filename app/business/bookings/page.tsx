"use client";

import { CalendarDays, CheckCircle2, Clock3, Loader2, UserRound, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Header } from "@/components/Header";
import { getUser } from "@/lib/auth";
import {
  getBusinessBookings,
  updateBookingStatus,
  type Booking,
} from "@/lib/api";

type Filter = "all" | Booking["status"];

export default function BusinessBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBusinessBookings();
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      console.error("Failed to load business bookings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load booking requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getUser();

    if (!user || user.role !== "business") {
      setIsBusiness(false);
      setAuthChecked(true);
      setLoading(false);
      return;
    }

    setIsBusiness(true);
    setAuthChecked(true);
    loadBookings();
  }, []);

  const updateStatus = async (
    bookingId: string,
    status: "confirmed" | "rejected" | "completed"
  ) => {
    if (updatingId) return;

    const labels = {
      confirmed: "confirm",
      rejected: "reject",
      completed: "mark as completed",
    };

    if (
      !window.confirm(
        `Are you sure you want to ${labels[status]} this booking?`
      )
    ) {
      return;
    }

    try {
      setUpdatingId(bookingId);
      const result = await updateBookingStatus(bookingId, status);

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId ? result.booking : booking
        )
      );
    } catch (err) {
      console.error("Failed to update booking:", err);
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to update booking status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    }),
    [bookings]
  );

  const formatDate = (date?: string | null) => {
    if (!date) return "Not specified";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Not specified";

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusClass = (status: Booking["status"]) =>
    `business-booking-status ${status}`;

  if (!authChecked) {
    return (
      <main className="page">
        <Header />
        <div className="shell inner mv-account-page">
          <div className="mv-light-state">
            <div className="mv-light-state-title">Checking your account...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!isBusiness) {
    return (
      <main className="page">
        <Header />
        <div className="shell inner mv-account-page" style={{ paddingBottom: 100 }}>
          <div className="mv-account-head">
            <div>
              <span className="profile-kicker dark">BUSINESS CENTER</span>
              <h1>Booking requests.</h1>
              <p>Manage requests and keep your customers updated.</p>
            </div>
          </div>

          <div className="mv-light-state business-bookings-empty">
            <CalendarDays size={32} />
            <h2>Business account required</h2>
            <p>Login with your business account to manage booking requests.</p>
            <Link
              href="/login?redirect=/business/bookings&role=business"
              className="business-bookings-login"
            >
              Login as Business
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <Header />

      <div className="shell inner mv-account-page business-bookings-page">
        <div className="mv-account-head business-bookings-head">
          <div>
            <span className="profile-kicker dark">BUSINESS CENTER</span>
            <h1>Booking requests.</h1>
            <p>Review customer requests and manage every booking in one place.</p>
          </div>

          <Link href="/business/dashboard" className="business-bookings-back">
            Dashboard
          </Link>
        </div>

        <div className="business-booking-summary">
          <div>
            <strong>{counts.all}</strong>
            <span>Total</span>
          </div>
          <div>
            <strong>{counts.pending}</strong>
            <span>Pending</span>
          </div>
          <div>
            <strong>{counts.confirmed}</strong>
            <span>Confirmed</span>
          </div>
          <div>
            <strong>{counts.completed}</strong>
            <span>Completed</span>
          </div>
        </div>

        <div className="business-booking-filters">
          {(["all", "pending", "confirmed", "completed", "rejected", "cancelled"] as Filter[]).map(
            (item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item === "all"
                  ? `All (${counts.all})`
                  : item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="mv-light-state">
            <Loader2 className="business-bookings-spinner" size={28} />
            <div className="mv-light-state-title">Loading booking requests...</div>
            <div className="mv-light-state-text">
              Fetching your latest customer requests.
            </div>
          </div>
        ) : error ? (
          <div className="mv-light-state">
            <div className="mv-light-state-title">Couldn&apos;t load bookings.</div>
            <div className="mv-light-state-text">{error}</div>
            <button
              type="button"
              className="business-bookings-retry"
              onClick={loadBookings}
            >
              Try Again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="mv-light-state business-bookings-empty">
            <CalendarDays size={32} />
            <h2>No bookings here yet</h2>
            <p>Customer booking requests will appear here when they arrive.</p>
          </div>
        ) : (
          <div className="business-booking-list">
            {filteredBookings.map((booking) => {
              const listing =
                booking.listing && typeof booking.listing === "object"
                  ? booking.listing
                  : null;

              const customer =
                booking.customer && typeof booking.customer === "object"
                  ? booking.customer
                  : null;

              const title =
                listing?.title || booking.listingTitle || "Booking";

              const isUpdating = updatingId === booking._id;

              return (
                <article key={booking._id} className="business-booking-card">
                  <div className="business-booking-card-top">
                    <div>
                      <span className="business-booking-kicker">BOOKING REQUEST</span>
                      <h2>{title}</h2>
                      {listing?.location && (
                        <p className="business-booking-location">
                          {listing.location}
                        </p>
                      )}
                    </div>

                    <span className={statusClass(booking.status)}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="business-booking-details">
                    <div>
                      <UserRound size={17} />
                      <span>
                        <small>Customer</small>
                        <strong>{customer?.name || "Customer"}</strong>
                        {customer?.phone && <em>{customer.phone}</em>}
                        {customer?.email && <em>{customer.email}</em>}
                      </span>
                    </div>

                    <div>
                      <CalendarDays size={17} />
                      <span>
                        <small>Booking date</small>
                        <strong>{formatDate(booking.bookingDate)}</strong>
                      </span>
                    </div>

                    <div>
                      <Clock3 size={17} />
                      <span>
                        <small>Requested on</small>
                        <strong>{formatDate(booking.createdAt)}</strong>
                      </span>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="business-booking-message">
                      <small>Customer message</small>
                      <p>{booking.message}</p>
                    </div>
                  )}

                  {booking.businessNote && (
                    <div className="business-booking-note">
                      <small>Your note</small>
                      <p>{booking.businessNote}</p>
                    </div>
                  )}

                  {booking.status === "pending" && (
                    <div className="business-booking-actions">
                      <button
                        type="button"
                        className="business-booking-confirm"
                        disabled={isUpdating}
                        onClick={() =>
                          updateStatus(booking._id, "confirmed")
                        }
                      >
                        {isUpdating ? (
                          <Loader2 className="business-bookings-spinner" size={17} />
                        ) : (
                          <CheckCircle2 size={17} />
                        )}
                        Confirm
                      </button>

                      <button
                        type="button"
                        className="business-booking-reject"
                        disabled={isUpdating}
                        onClick={() =>
                          updateStatus(booking._id, "rejected")
                        }
                      >
                        <XCircle size={17} />
                        Reject
                      </button>
                    </div>
                  )}

                  {booking.status === "confirmed" && (
                    <div className="business-booking-actions">
                      <button
                        type="button"
                        className="business-booking-complete"
                        disabled={isUpdating}
                        onClick={() =>
                          updateStatus(booking._id, "completed")
                        }
                      >
                        {isUpdating ? (
                          <Loader2 className="business-bookings-spinner" size={17} />
                        ) : (
                          <CheckCircle2 size={17} />
                        )}
                        Mark completed
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
