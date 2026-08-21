"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";
import { getToken, getUser } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type Props = {
  listingId: string;
  listingTitle: string;
};

export function EnquiryButton({ listingId, listingTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  const openEnquiry = () => {
    const token = getToken();
    const user = getUser();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (user?.role !== "customer") {
      setResult("Please log in with a customer account to send an enquiry.");
      return;
    }

    setResult("");
    setOpen(true);
  };

  const closeEnquiry = () => {
    if (sending) return;
    setOpen(false);
    setMessage("");
    setResult("");
  };

  const submitEnquiry = async () => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (!message.trim()) {
      setResult("Please enter your enquiry message.");
      return;
    }

    if (message.trim().length < 5) {
      setResult("Please enter a little more detail.");
      return;
    }

    setSending(true);
    setResult("");

    try {
      const response = await fetch(`${API_URL}/api/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send enquiry");
      }

      setResult("Enquiry sent successfully.");
      setMessage("");

      window.setTimeout(() => {
        setOpen(false);
        setResult("");
      }, 1200);
    } catch (error) {
      setResult(
        error instanceof Error
          ? error.message
          : "Failed to send enquiry. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-black mv-enquiry-trigger"
        onClick={openEnquiry}
      >
        Book / Contact
      </button>

      {open && (
        <div className="mv-enquiry-overlay" onClick={closeEnquiry}>
          <div
            className="mv-enquiry-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mv-enquiry-modal-header">
              <div>
                <div className="panel-kicker">CONTACT BUSINESS</div>
                <h2>Send an enquiry.</h2>
                <p>{listingTitle}</p>
              </div>

              <button
                type="button"
                className="mv-enquiry-close"
                onClick={closeEnquiry}
                disabled={sending}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <label className="mv-enquiry-label" htmlFor="enquiry-message">
              Your message
            </label>

            <textarea
              id="enquiry-message"
              className="mv-enquiry-textarea"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Hi, I’m interested in this listing. Please share more details..."
              maxLength={2000}
              rows={6}
              disabled={sending}
            />

            <div className="mv-enquiry-footer">
              <span>{message.length}/2000</span>

              <button
                type="button"
                className="btn btn-black mv-enquiry-send"
                onClick={submitEnquiry}
                disabled={sending}
              >
                <Send size={16} />
                {sending ? "Sending..." : "Send Enquiry"}
              </button>
            </div>

            {result && (
              <div
                className={`mv-enquiry-result ${
                  result.toLowerCase().includes("success")
                    ? "success"
                    : "error"
                }`}
              >
                {result}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
