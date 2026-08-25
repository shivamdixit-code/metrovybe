"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Clock3,
  Check,
} from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { getToken } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type Enquiry = {
  _id: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  listing?: {
    title?: string;
    category?: string;
    location?: string;
    image?: string;
  };
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function BusinessEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnquiries = useCallback(async () => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/enquiries/business`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load enquiries"
        );
      }

      setEnquiries(data.enquiries || []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load enquiries"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  const markRead = async (id: string) => {
    const token = getToken();

    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/enquiries/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return;

      setEnquiries((current) =>
        current.map((item) =>
          item._id === id && item.status === "new"
            ? { ...item, status: "read" }
            : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = enquiries.filter(
    (item) => item.status === "new"
  ).length;

  return (
    <div className="page">
      <Header />
      <main className="shell inner business-enquiries-page">
        <div className="business-enquiries-header">
          <div>
            <div className="panel-kicker">
              CUSTOMER MESSAGES
            </div>

            <div className="business-enquiries-title-row">
              <div>
                <h1 className="page-title">ENQUIRIES.</h1>
                <p className="subtle">
                  See questions and messages from your customers.
                </p>
              </div>

              {!loading && enquiries.length > 0 && (
                <div className="business-enquiries-count">
                  <strong>{unreadCount}</strong>
                  <span>new</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="panel business-enquiries-loading">
            <MessageSquare size={24} />
            <span>Loading your enquiries...</span>
          </div>
        ) : error ? (
          <div className="panel business-enquiries-empty">
            <MessageSquare size={30} />
            <h2>Couldn&apos;t load enquiries</h2>
            <p>{error}</p>
            <button
              type="button"
              className="business-enquiries-retry"
              onClick={loadEnquiries}
            >
              Try again
            </button>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="panel business-enquiries-empty">
            <div className="business-enquiries-empty-icon">
              <MessageSquare size={30} />
            </div>

            <h2>No enquiries yet</h2>

            <p>
              Customer questions and messages about your listings
              will appear here.
            </p>

            <Link
              href="/business/listings/new"
              className="business-enquiries-empty-link"
            >
              Add a listing
            </Link>
          </div>
        ) : (
          <div className="business-enquiries-list">
            {enquiries.map((enquiry) => {
              const isNew = enquiry.status === "new";

              const customerName =
                enquiry.customer?.name ||
                enquiry.customerName ||
                "Customer";

              const customerEmail =
                enquiry.customer?.email ||
                enquiry.customerEmail ||
                "";

              const customerPhone =
                enquiry.customer?.phone ||
                enquiry.customerPhone ||
                "";

              return (
                <article
                  key={enquiry._id}
                  className={`panel business-enquiry-card ${
                    isNew ? "is-new" : ""
                  }`}
                >
                  <div className="business-enquiry-card-top">
                    <div className="business-enquiry-customer">
                      <div className="business-enquiry-avatar">
                        {customerName
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h2>{customerName}</h2>

                        <div className="business-enquiry-meta">
                          <Clock3 size={13} />
                          <span>
                            {formatDate(enquiry.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`business-enquiry-status ${enquiry.status}`}
                    >
                      {isNew ? "New" : enquiry.status}
                    </span>
                  </div>

                  {enquiry.listing?.title && (
                    <div className="business-enquiry-listing">
                      {enquiry.listing.image ? (
                        <img
                          src={enquiry.listing.image}
                          alt=""
                        />
                      ) : (
                        <div className="business-enquiry-listing-icon">
                          <MessageSquare size={18} />
                        </div>
                      )}

                      <div>
                        <span>Regarding</span>
                        <strong>
                          {enquiry.listing.title}
                        </strong>

                        {enquiry.listing.location && (
                          <small>
                            <MapPin size={12} />
                            {enquiry.listing.location}
                          </small>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="business-enquiry-message">
                    <p>{enquiry.message}</p>
                  </div>

                  {(customerEmail || customerPhone) && (
                    <div className="business-enquiry-contact">
                      {customerEmail && (
                        <a href={`mailto:${customerEmail}`}>
                          <Mail size={16} />
                          <span>{customerEmail}</span>
                        </a>
                      )}

                      {customerPhone && (
                        <a href={`tel:${customerPhone}`}>
                          <Phone size={16} />
                          <span>{customerPhone}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {isNew && (
                    <button
                      type="button"
                      className="business-enquiry-read"
                      onClick={() => markRead(enquiry._id)}
                    >
                      <Check size={16} />
                      Mark as read
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav active="enquiries" />
    </div>
  );
}
