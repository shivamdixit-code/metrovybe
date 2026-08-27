"use client";
import { CalendarDays, Clock3, Star } from "lucide-react";

import { Header } from "@/components/Header";

import { BottomNav } from "@/components/BottomNav";

import { getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  cancelBooking,
  getCustomerBookings,
  type Booking,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  type Review,
} from "@/lib/api";

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerBookings();

      console.log("===== CUSTOMER BOOKINGS API =====");
      console.log("Bookings response:", data);
      console.log("Bookings array:", data.bookings);

      const loadedBookings = Array.isArray(data.bookings) ? data.bookings : [];
      setBookings(loadedBookings);

      const params = new URLSearchParams(window.location.search);
      const bookingId = params.get("bookingId");

      if (bookingId) {
        const matchedBooking = loadedBookings.find(
          (booking) => String(booking._id) === String(bookingId)
        );

        if (matchedBooking) {
          setHighlightedBookingId(String(bookingId));

          window.setTimeout(() => {
            document
              .getElementById(`booking-${bookingId}`)
              ?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
          }, 150);

          window.setTimeout(() => {
            setHighlightedBookingId(null);
          }, 3500);
        }
      }
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
    const user = getUser();

    if (!user || user.role !== "customer") {
      setIsCustomer(false);
      setAuthChecked(true);
      setLoading(false);
      return;
    }

    setIsCustomer(true);
    setAuthChecked(true);
    loadBookings();

    getMyReviews()
      .then((data) => setReviews(Array.isArray(data.reviews) ? data.reviews : []))
      .catch((err) => console.error("Failed to load reviews:", err));
  }, []);

  const getReviewForBooking = (bookingId: string) =>
    reviews.find((review: any) => {
      const reviewBooking =
        typeof review.booking === "object"
          ? review.booking?._id
          : review.booking;
      return String(reviewBooking) === String(bookingId);
    });

  const handleSubmitReview = async (bookingId: string) => {
    if (submittingReview) return;

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Please select a star rating.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      const existingReview = getReviewForBooking(bookingId);

      if (existingReview && reviewBookingId === bookingId) {
        const result = await updateReview(existingReview._id, {
          rating: reviewRating,
          comment: reviewComment.trim(),
        });

        setReviews((current) =>
          current.map((review: any) =>
            String(review._id) === String(existingReview._id)
              ? result.review
              : review
          )
        );
      } else {
        const result = await createReview({
          bookingId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });

        setReviews((current) => [
          ...current.filter((review: any) => {
            const reviewBooking =
              typeof review.booking === "object"
                ? review.booking?._id
                : review.booking;
            return String(reviewBooking) !== String(bookingId);
          }),
          result.review,
        ]);
      }

      setReviewBookingId(null);
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      console.error("Failed to submit review:", err);
      setReviewError(
        err instanceof Error ? err.message : "Failed to submit your review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (deletingReview) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmed) return;

    try {
      setDeletingReview(reviewId);
      await deleteReview(reviewId);

      setReviews((current) =>
        current.filter((review: any) => String(review._id) !== String(reviewId))
      );
    } catch (err) {
      console.error("Failed to delete review:", err);
      window.alert(
        err instanceof Error ? err.message : "Failed to delete your review."
      );
    } finally {
      setDeletingReview(null);
    }
  };

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

        {!authChecked ? (
          <div className="mv-light-state">
            <div className="mv-light-state-title">Checking your account...</div>
            <div className="mv-light-state-text">
              Please wait while we check your login.
            </div>
          </div>
        ) : !isCustomer ? (
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
            <div style={{ maxWidth: "480px", margin: "0 auto" }}>
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
                Login to view your bookings
              </h2>

              <p
                style={{
                  margin: "14px auto 0",
                  maxWidth: "430px",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  fontWeight: 600,
                  color: "#777",
                }}
              >
                Please login as a customer to view your bookings, booking
                status and upcoming plans.
              </p>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/login?redirect=/bookings&role=customer";
                }}
                style={{
                  marginTop: 22,
                  border: "2px solid #111",
                  background: "#111",
                  color: "#fff",
                  borderRadius: 14,
                  padding: "12px 22px",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Login as Customer
              </button>
            </div>
          </div>
        ) : loading ? (
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
                  id={`booking-${booking._id}`}
                  key={booking._id}
                  className={`mv-booking-card${
                    highlightedBookingId === String(booking._id)
                      ? " booking-notification-highlight"
                      : ""
                  }`}
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

                  {booking.status === "completed" && (() => {
                    const existingReview = getReviewForBooking(booking._id);
                    const isReviewing = reviewBookingId === booking._id;

                    return (
                      <div
                        style={{
                          marginTop: 16,
                          padding: "18px 20px",
                          borderRadius: 16,
                          background: "#FFFCF5",
                          border: "1px solid #F0D89A",
                        }}
                      >
                        {existingReview && !isReviewing ? (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                                flexWrap: "wrap",
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 850,
                                    color: "#181818",
                                  }}
                                >
                                  Your review
                                </div>
                                <div
                                  style={{
                                    marginTop: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                      key={index}
                                      size={20}
                                      strokeWidth={2.2}
                                      fill={
                                        index < existingReview.rating
                                          ? "#F5B301"
                                          : "transparent"
                                      }
                                      color="#F5B301"
                                    />
                                  ))}
                                  <span
                                    style={{
                                      marginLeft: 5,
                                      fontSize: 13,
                                      fontWeight: 800,
                                      color: "#8A6400",
                                    }}
                                  >
                                    {existingReview.rating}/5
                                  </span>
                                </div>
                              </div>

                              <span
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                  background: "#FFF3C9",
                                  color: "#8A6400",
                                  fontSize: 11,
                                  fontWeight: 850,
                                }}
                              >
                                REVIEWED
                              </span>
                            </div>

                            {existingReview.comment && (
                              <p
                                style={{
                                  margin: "14px 0 0",
                                  paddingTop: 14,
                                  borderTop: "1px solid #F0E2BA",
                                  fontSize: 14,
                                  lineHeight: 1.55,
                                  color: "#555",
                                }}
                              >
                                {existingReview.comment}
                              </p>
                            )}

                            <div
                              className="mv-review-existing-actions"
                              style={{
                                display: "flex",
                                gap: 10,
                                marginTop: 16,
                                paddingTop: 14,
                                borderTop: "1px solid #F0E2BA",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewBookingId(booking._id);
                                  setReviewRating(existingReview.rating);
                                  setReviewComment(existingReview.comment || "");
                                  setReviewError("");
                                }}
                                style={{
                                  border: "1px solid #D8A900",
                                  background: "#FFF7DF",
                                  color: "#7A5800",
                                  borderRadius: 10,
                                  padding: "9px 15px",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  cursor: "pointer",
                                }}
                              >
                                Edit Review
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteReview(existingReview._id)}
                                disabled={deletingReview === existingReview._id}
                                style={{
                                  border: "1px solid #E7B7B3",
                                  background: "#FFF5F4",
                                  color: "#B42318",
                                  borderRadius: 10,
                                  padding: "9px 15px",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  cursor:
                                    deletingReview === existingReview._id
                                      ? "wait"
                                      : "pointer",
                                  opacity:
                                    deletingReview === existingReview._id
                                      ? 0.7
                                      : 1,
                                }}
                              >
                                {deletingReview === existingReview._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </div>
                        ) : isReviewing ? (
                          <div className="mv-review-form">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                                flexWrap: "wrap",
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 850,
                                    color: "#181818",
                                  }}
                                >
                                  How was your experience?
                                </div>
                                <div
                                  style={{
                                    marginTop: 4,
                                    fontSize: 13,
                                    color: "#777",
                                  }}
                                >
                                  Tap a star to rate your experience.
                                </div>
                              </div>

                              {reviewRating > 0 && (
                                <span
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: 999,
                                    background: "#FFF3C9",
                                    color: "#8A6400",
                                    fontSize: 12,
                                    fontWeight: 850,
                                  }}
                                >
                                  {reviewRating} of 5
                                </span>
                              )}
                            </div>

                            <div
                              className="mv-review-stars"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginTop: 16,
                              }}
                            >
                              {Array.from({ length: 5 }).map((_, index) => {
                                const value = index + 1;
                                const active = value <= reviewRating;

                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                      setReviewRating(value);
                                      setReviewError("");
                                    }}
                                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                                    style={{
                                      width: 46,
                                      height: 46,
                                      borderRadius: 12,
                                      border: active
                                        ? "1px solid #F0B429"
                                        : "1px solid #E7D9B5",
                                      background: active ? "#FFF7DF" : "#fff",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      padding: 0,
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Star
                                      size={25}
                                      strokeWidth={2.2}
                                      fill={active ? "#F5B301" : "transparent"}
                                      color="#E5A400"
                                    />
                                  </button>
                                );
                              })}
                            </div>

                            <textarea
                              value={reviewComment}
                              onChange={(event) =>
                                setReviewComment(event.target.value)
                              }
                              placeholder="Tell others about your experience (optional)"
                              maxLength={1000}
                              style={{
                                width: "100%",
                                minHeight: 88,
                                marginTop: 16,
                                padding: "12px 14px",
                                borderRadius: 12,
                                border: "1px solid #E4D8BA",
                                background: "#fff",
                                color: "#111",
                                fontSize: 14,
                                fontFamily: "inherit",
                                lineHeight: 1.5,
                                resize: "vertical",
                                boxSizing: "border-box",
                                outline: "none",
                              }}
                            />

                            {reviewError && (
                              <div
                                style={{
                                  marginTop: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#B42318",
                                }}
                              >
                                {reviewError}
                              </div>
                            )}

                            <div
                              className="mv-review-actions"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 10,
                                marginTop: 14,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewBookingId(null);
                                  setReviewRating(0);
                                  setReviewComment("");
                                  setReviewError("");
                                }}
                                disabled={submittingReview}
                                style={{
                                  border: "1px solid #D8D8D8",
                                  background: "#fff",
                                  color: "#555",
                                  borderRadius: 10,
                                  padding: "10px 17px",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSubmitReview(booking._id)}
                                disabled={submittingReview}
                                style={{
                                  border: "1px solid #D99A00",
                                  background: "#F5B301",
                                  color: "#1C1605",
                                  borderRadius: 10,
                                  padding: "10px 18px",
                                  fontSize: 13,
                                  fontWeight: 850,
                                  cursor: submittingReview ? "wait" : "pointer",
                                  opacity: submittingReview ? 0.7 : 1,
                                }}
                              >
                                {submittingReview
                                  ? "Submitting..."
                                  : "Submit Review"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mv-rate-experience-cta">
  <div className="mv-rate-experience-info">
    <div className="mv-rate-experience-icon">
      <Star size={27} strokeWidth={2.4} />
    </div>

    <div>
      <div className="mv-rate-experience-title">
        Rate your experience
      </div>
      <div className="mv-rate-experience-subtitle">
        Share your feedback and help others.
      </div>
    </div>
  </div>

  <button
    type="button"
    className="mv-rate-now-btn"
    onClick={() => {
      setReviewBookingId(booking._id);
      setReviewRating(0);
      setReviewComment("");
      setReviewError("");
    }}
  >
    Rate Now <span aria-hidden="true">→</span>
  </button>
</div>
                        )}
                      </div>
                    );
                  })()}

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
