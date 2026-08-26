"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Star,
  Building2,
  RefreshCw,
  Send,
  Pencil,
  Trash2,
} from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { getToken } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type FeedbackReview = {
  _id: string;
  rating: number;
  comment: string;
  createdAt?: string;
  customer?: {
    _id?: string;
    name?: string;
  };
  listing?: {
    _id?: string;
    title?: string;
  };
  businessReply?: {
    message?: string;
    repliedAt?: string;
  };

};

type RatingItem = {
  rating: number;
  count: number;
};

function formatDate(value?: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function Stars({
  rating,
  size = 18,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="mv-feedback-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

export default function BusinessFeedbackPage() {
  const [reviews, setReviews] = useState<FeedbackReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [deletingReply, setDeletingReply] = useState<string | null>(null);

  const loadFeedback = useCallback(async () => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/reviews/business`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load feedback");
      }

      setReviews(data.reviews || []);
      setAverageRating(Number(data.averageRating || 0));
      setTotalReviews(Number(data.totalReviews || 0));
      setRatingBreakdown(data.ratingBreakdown || []);
    } catch (err) {
      console.error("Load feedback error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load feedback"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReply = async (reviewId: string) => {
    const message = replyText.trim();

    if (!message) {
      setReplyError("Please write a reply first.");
      return;
    }

    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setSendingReply(true);
      setReplyError("");

      const response = await fetch(
        `${API_URL}/api/reviews/${reviewId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to send reply.");
      }

      setReplyingTo(null);
      setReplyText("");
      await loadFeedback();
    } catch (err) {
      console.error("Send review reply error:", err);
      setReplyError(
        err instanceof Error ? err.message : "Failed to send reply."
      );
    } finally {
      setSendingReply(false);
    }
  };

  const updateReply = async (reviewId: string) => {
    const message = replyText.trim();

    if (!message) {
      setReplyError("Please write a reply first.");
      return;
    }

    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setSendingReply(true);
      setReplyError("");

      const response = await fetch(
        `${API_URL}/api/reviews/${reviewId}/reply`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update reply.");
      }

      setEditingReply(null);
      setReplyText("");
      await loadFeedback();
    } catch (err) {
      console.error("Update review reply error:", err);
      setReplyError(
        err instanceof Error ? err.message : "Failed to update reply."
      );
    } finally {
      setSendingReply(false);
    }
  };

  const deleteReply = async (reviewId: string) => {
    if (!window.confirm("Delete this reply? This cannot be undone.")) {
      return;
    }

    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setDeletingReply(reviewId);
      setReplyError("");

      const response = await fetch(
        `${API_URL}/api/reviews/${reviewId}/reply`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete reply.");
      }

      await loadFeedback();
    } catch (err) {
      console.error("Delete review reply error:", err);
      setReplyError(
        err instanceof Error ? err.message : "Failed to delete reply."
      );
    } finally {
      setDeletingReply(null);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const getCount = (rating: number) =>
    ratingBreakdown.find((item) => item.rating === rating)?.count || 0;

  return (
    <div className="page mv-feedback-page">
      <Header />

      <main className="mv-feedback-main">
        <div className="mv-feedback-heading">
          <div className="mv-feedback-title-row">
            <div>
              <p className="mv-feedback-kicker">CUSTOMER VOICE</p>
              <h1>Feedback</h1>
              <p className="mv-feedback-subtitle">
                See what your customers are saying about your business.
              </p>
            </div>

            {!loading && !error && (
              <button
                type="button"
                className="mv-feedback-refresh"
                onClick={loadFeedback}
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mv-feedback-status">
            <div className="mv-feedback-loader" />
            <span>Loading your feedback...</span>
          </div>
        ) : error ? (
          <div className="mv-feedback-status mv-feedback-status-error">
            <strong>Couldn't load feedback</strong>
            <span>{error}</span>
            <button type="button" onClick={loadFeedback}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <section className="mv-feedback-overview">
              <div className="mv-feedback-score-card">
                <span className="mv-feedback-label">OVERALL RATING</span>
                <div className="mv-feedback-score">
                  {averageRating.toFixed(1)}
                </div>
                <Stars rating={averageRating} size={21} />
                <p>
                  Based on{" "}
                  <strong>
                    {totalReviews}{" "}
                    {totalReviews === 1 ? "review" : "reviews"}
                  </strong>
                </p>
              </div>

              <div className="mv-feedback-breakdown-card">
                <div className="mv-feedback-card-heading">
                  <div>
                    <span className="mv-feedback-label">RATING OVERVIEW</span>
                    <h2>How customers rate you</h2>
                  </div>
                </div>

                <div className="mv-feedback-bars">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = getCount(rating);
                    const percentage =
                      totalReviews > 0
                        ? (count / totalReviews) * 100
                        : 0;

                    return (
                      <div className="mv-feedback-bar-row" key={rating}>
                        <span className="mv-feedback-bar-number">
                          {rating}
                        </span>
                        <Star size={15} fill="currentColor" />
                        <div className="mv-feedback-track">
                          <span style={{ width: `${percentage}%` }} />
                        </div>
                        <strong>{count}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="mv-feedback-reviews-section">
              <div className="mv-feedback-reviews-heading">
                <div>
                  <p className="mv-feedback-kicker">LATEST REVIEWS</p>
                  <h2>What customers are saying</h2>
                </div>
                <div className="mv-feedback-message-icon">
                  <MessageCircle size={21} />
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="mv-feedback-empty">
                  <div className="mv-feedback-empty-icon">
                    <Star size={27} />
                  </div>
                  <h3>No feedback yet</h3>
                  <p>
                    Customer reviews from completed bookings will appear here.
                  </p>
                </div>
              ) : (
                <div className="mv-feedback-review-list">
                  {reviews.map((review) => (
                    <article
                      className="mv-feedback-review-card"
                      key={review._id}
                    >
                      <div className="mv-feedback-review-top">
                        <div className="mv-feedback-avatar">
                          {(review.customer?.name || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="mv-feedback-review-info">
                          <strong>
                            {review.customer?.name || "Customer"}
                          </strong>

                          {review.listing?.title && (
                            <span>
                              <Building2 size={13} />
                              {review.listing.title}
                            </span>
                          )}
                        </div>

                        <time>{formatDate(review.createdAt)}</time>
                      </div>

                      <div className="mv-feedback-review-rating">
                        <Stars rating={review.rating} size={16} />
                        <b>{review.rating.toFixed(1)}</b>
                      </div>

                      {review.comment && (
                        <p className="mv-feedback-comment">
                          {review.comment}
                        </p>
                      )}
                    
              {review.businessReply?.message && editingReply !== review._id ? (
                <div className="mv-feedback-business-reply">
                  <div className="mv-feedback-business-reply-head">
                    <div className="mv-feedback-business-reply-label">
                      <MessageCircle size={15} />
                      <span>Your reply</span>
                    </div>

                    <div className="mv-feedback-reply-tools">
                      <button
                        type="button"
                        className="mv-feedback-reply-edit"
                        aria-label="Edit reply"
                        onClick={() => {
                          setEditingReply(review._id);
                          setReplyingTo(null);
                          setReplyText(review.businessReply?.message || "");
                          setReplyError("");
                        }}
                        disabled={deletingReply === review._id}
                      >
                        <Pencil size={14} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="mv-feedback-reply-delete"
                        aria-label="Delete reply"
                        onClick={() => deleteReply(review._id)}
                        disabled={deletingReply === review._id}
                      >
                        <Trash2 size={14} />
                        <span>
                          {deletingReply === review._id ? "Deleting..." : "Delete"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <p>{review.businessReply.message}</p>

                  {review.businessReply.repliedAt && (
                    <time>
                      Replied {formatDate(review.businessReply.repliedAt)}
                    </time>
                  )}
                </div>
              ) : editingReply === review._id ? (
                <div className="mv-feedback-reply-box mv-feedback-reply-edit-box">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Update your reply..."
                    maxLength={2000}
                    autoFocus
                  />

                  {replyError && (
                    <p className="mv-feedback-reply-error">{replyError}</p>
                  )}

                  <div className="mv-feedback-reply-actions">
                    <button
                      type="button"
                      className="mv-feedback-reply-cancel"
                      onClick={() => {
                        setEditingReply(null);
                        setReplyText("");
                        setReplyError("");
                      }}
                      disabled={sendingReply}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="mv-feedback-reply-send"
                      onClick={() => updateReply(review._id)}
                      disabled={!replyText.trim() || sendingReply}
                    >
                      {sendingReply ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>
              ) : replyingTo === review._id ? (
                <div className="mv-feedback-reply-box">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a thoughtful reply..."
                    maxLength={2000}
                    autoFocus
                  />
                  <div className="mv-feedback-reply-actions">
                    <button
                      type="button"
                      className="mv-feedback-reply-cancel"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      disabled={sendingReply}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="mv-feedback-reply-send"
                      onClick={() => submitReply(review._id)}
                      disabled={!replyText.trim() || sendingReply}
                    >
                      {sendingReply ? "Sending..." : "Send reply"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="mv-feedback-reply-trigger"
                  onClick={() => {
                    setReplyingTo(review._id);
                    setReplyText("");
                  }}
                >
                  <MessageCircle size={16} />
                  Reply
                </button>
              )}

              </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BottomNav active="feedback" />
    </div>
  );
}
