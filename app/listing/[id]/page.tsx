"use client";

import { useEffect, useState } from "react";
import { getListing } from "@/lib/api";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getToken, getUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

export default function Listing({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { id } = await params;
        const listing = await getListing(id);

        if (mounted) {
          if (!listing) {
            notFound();
            return;
          }
          setItem(listing);
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
          <div className="panel" style={{ padding: 30 }}>
            Loading listing...
          </div>
        </main>
        <BottomNav active="explore" />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  const sendEnquiry = async () => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      window.location.href = "/login";
      return;
    }

    if (user.role !== "customer") {
      setMessage("Please use a customer account to send an enquiry.");
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
            listingId: item._id,
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
              }}
            >
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
              {item.location} · ⭐ {item.rating} ({item.reviews} reviews)
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
              A trusted MetroVybe listing with verified details,
              transparent pricing, and useful services near you.
            </p>

            <button
              type="button"
              className="btn btn-black"
              style={{
                display: "inline-block",
                marginTop: 15,
                border: 0,
                cursor: "pointer",
              }}
              onClick={() => setEnquiryOpen(true)}
            >
              Enquire Now
            </button>

            {message && (
              <div
                style={{
                  marginTop: 14,
                  padding: "11px 13px",
                  borderRadius: 12,
                  background: "#f4f5f6",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {message}
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
