"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  MapPin,
  X,
  Check,
  Clock,
} from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";

type Business = {
  _id: string;
  businessName: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  category?: string;
  verificationStatus:
    | "pending"
    | "under_review"
    | "verified"
    | "rejected"
    | "suspended";
  rejectionReason?: string;
};

type Document = {
  _id: string;
  documentType: string;
  documentNumber?: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
};

type Verification = {
  _id: string;
  status:
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "more_information_required";
  documents: Document[];
  rejectionReason?: string;
  adminNotes?: string;
};

type VerificationResponse = {
  business: Business;
  verification: Verification | null;
};

export default function Businesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  async function loadBusinesses() {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch(
        "/api/admin/businesses/pending"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load businesses");
      }

      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load businesses"
      );
    } finally {
      setLoading(false);
    }
  }

  async function openVerification(id: string) {
    try {
      setDetailLoading(true);
      setError("");
      setInfoMessage("");

      const response = await authenticatedFetch(
        `/api/admin/businesses/${id}/verification`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load business verification"
        );
      }

      setSelected(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load business verification"
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function approveBusiness() {
    if (!selected) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await authenticatedFetch(
        `/api/admin/businesses/${selected.business._id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve business");
      }

      setInfoMessage("Business verified successfully.");
      setSelected(null);
      await loadBusinesses();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve business"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectBusiness() {
    if (!selected) return;

    if (!reason.trim()) {
      setError("Please enter a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await authenticatedFetch(
        `/api/admin/businesses/${selected.business._id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject business");
      }

      setInfoMessage("Business rejected successfully.");
      setReason("");
      setSelected(null);
      await loadBusinesses();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject business"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function requestInformation() {
    if (!selected) return;

    if (!reason.trim()) {
      setError("Please enter the information required from the business.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await authenticatedFetch(
        `/api/admin/businesses/${selected.business._id}/request-information`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to request additional information"
        );
      }

      setInfoMessage("Additional information requested.");
      setReason("");
      setSelected(null);
      await loadBusinesses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to request additional information"
      );
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    loadBusinesses();
  }, []);

  const pending = businesses.filter(
    (p) =>
      p.verificationStatus === "pending" ||
      p.verificationStatus === "under_review"
  );

  const verified = businesses.filter(
    (p) => p.verificationStatus === "verified"
  );

  return (
    <main className="mv-business-page">
      <div className="mv-business-shell">
        <header className="mv-business-header">
          <div>
            <span>PARTNERS</span>
            <h1>Businesses</h1>
            <p>Review businesses and verify their documents.</p>
          </div>

          <div className="mv-business-count">
            <strong>{businesses.length}</strong>
            <small>Pending</small>
          </div>
        </header>

        {error && <div className="mv-business-alert error">{error}</div>}
        {infoMessage && (
          <div className="mv-business-alert success">{infoMessage}</div>
        )}

        <section className="mv-business-hero">
          <div>
            <span>BUSINESS VERIFICATION</span>
            <strong>{pending.length}</strong>
            <p>Businesses waiting for verification</p>
          </div>
          <BriefcaseBusiness size={28} />
        </section>

        <div className="mv-business-stats">
          <div>
            <Clock size={16} />
            <strong>{pending.length}</strong>
            <span>Pending Review</span>
          </div>

          <div>
            <BadgeCheck size={16} />
            <strong>{verified.length}</strong>
            <span>Verified</span>
          </div>
        </div>

        <div className="mv-business-heading">
          <span>VERIFICATION QUEUE</span>
          <h2>Businesses</h2>
        </div>

        {loading ? (
          <div className="mv-business-empty">Loading businesses...</div>
        ) : businesses.length === 0 ? (
          <div className="mv-business-empty">
            No businesses are waiting for verification.
          </div>
        ) : (
          <div className="mv-business-list">
            {businesses.map((business) => (
              <button
                type="button"
                className="mv-business-card"
                key={business._id}
                onClick={() => openVerification(business._id)}
              >
                <div className="mv-business-icon">
                  <BriefcaseBusiness size={19} />
                </div>

                <div className="mv-business-info">
                  <div className="mv-business-title">
                    <h3>{business.businessName}</h3>

                    <span
                      className={
                        business.verificationStatus === "verified"
                          ? "mv-verified"
                          : "mv-business-pending"
                      }
                    >
                      {business.verificationStatus === "verified" ? (
                        <BadgeCheck size={10} />
                      ) : (
                        <Clock size={10} />
                      )}

                      {business.verificationStatus === "verified"
                        ? "Verified"
                        : business.verificationStatus === "under_review"
                        ? "Under Review"
                        : "Pending"}
                    </span>
                  </div>

                  <div className="mv-business-meta">
                    <span>{business.email || "No email"}</span>

                    {(business.city || business.state) && (
                      <span>
                        <MapPin size={10} />
                        {[business.city, business.state]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="mv-business-arrow"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {(selected || detailLoading) && (
        <div
          className="mv-verification-overlay"
          onClick={() => !actionLoading && setSelected(null)}
        >
          <section
            className="mv-verification-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading || !selected ? (
              <div className="mv-verification-loading">
                Loading verification...
              </div>
            ) : (
              <>
                <header className="mv-verification-modal-header">
                  <div>
                    <span>BUSINESS VERIFICATION</span>
                    <h2>{selected.business.businessName}</h2>
                    <p>{selected.business.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    disabled={actionLoading}
                  >
                    <X size={20} />
                  </button>
                </header>

                <div className="mv-verification-status">
                  <span>Status</span>
                  <strong>
                    {selected.verification?.status || "No submission"}
                  </strong>
                </div>

                <div className="mv-document-heading">
                  <span>SUBMITTED DOCUMENTS</span>
                  <strong>
                    {selected.verification?.documents?.length || 0}
                  </strong>
                </div>

                <div className="mv-document-list">
                  {selected.verification?.documents?.length ? (
                    selected.verification.documents.map((document) => (
                      <article
                        className="mv-document-card"
                        key={document._id}
                      >
                        <div className="mv-document-icon">
                          <FileText size={18} />
                        </div>

                        <div>
                          <strong>{document.documentType}</strong>
                          <small>
                            {document.documentNumber || "Document number not provided"}
                          </small>
                        </div>

                        <a
                          href={document.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mv-document-view"
                        >
                          View
                        </a>
                      </article>
                    ))
                  ) : (
                    <div className="mv-business-empty">
                      No documents submitted.
                    </div>
                  )}
                </div>

                <textarea
                  className="mv-verification-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Rejection reason or additional information required..."
                  disabled={actionLoading}
                />

                <div className="mv-verification-actions">
                  <button
                    type="button"
                    className="mv-request-button"
                    onClick={requestInformation}
                    disabled={actionLoading}
                  >
                    Request Information
                  </button>

                  <button
                    type="button"
                    className="mv-reject-button"
                    onClick={rejectBusiness}
                    disabled={actionLoading}
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    className="mv-approve-button"
                    onClick={approveBusiness}
                    disabled={
                      actionLoading ||
                      !selected.verification?.documents?.length
                    }
                  >
                    <Check size={15} />
                    Verify Business
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <style jsx global>{`
        .mv-business-page {
          min-height: 100vh;
          padding: 34px 28px 60px;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(41, 171, 135, 0.06),
              transparent 30%
            ),
            #f7f8fa;
        }

        .mv-business-shell {
          width: min(1050px, 100%);
          margin: auto;
        }

        .mv-business-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 23px;
        }

        .mv-business-header > div:first-child > span,
        .mv-business-heading > span {
          color: #29ab87;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.14em;
        }

        .mv-business-header h1 {
          margin: 6px 0 0 !important;
          font-family: inherit !important;
          font-size: clamp(34px, 5vw, 48px) !important;
          line-height: 0.95 !important;
          letter-spacing: -0.055em !important;
          font-weight: 950 !important;
        }

        .mv-business-header p {
          margin: 8px 0 0;
          color: #858990;
          font-size: 13px;
          font-weight: 600;
        }

        .mv-business-count {
          width: 62px;
          height: 62px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          background: #111;
          color: #fff;
        }

        .mv-business-count strong {
          font-size: 20px;
          font-weight: 950;
        }

        .mv-business-count small {
          color: #aaa;
          font-size: 8px;
          font-weight: 800;
        }

        .mv-business-hero {
          min-height: 145px;
          padding: 23px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 27px;
          color: #fff;
          background:
            radial-gradient(
              circle at 90% 10%,
              rgba(41, 171, 135, 0.95),
              transparent 43%
            ),
            #111;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
          margin-bottom: 18px;
        }

        .mv-business-hero span {
          color: rgba(255, 255, 255, 0.48);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .mv-business-hero strong {
          display: block;
          margin-top: 10px;
          font-size: 32px;
          font-weight: 950;
        }

        .mv-business-hero p {
          margin: 4px 0 0;
          color: rgba(255, 255, 255, 0.55);
          font-size: 10px;
        }

        .mv-business-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 28px;
        }

        .mv-business-stats > div {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 14px 16px;
          border: 1px solid #e8e9ec;
          border-radius: 18px;
          background: #fff;
        }

        .mv-business-stats svg {
          color: #29ab87;
        }

        .mv-business-stats strong {
          font-size: 16px;
          font-weight: 950;
        }

        .mv-business-stats span {
          color: #999;
          font-size: 9px;
          font-weight: 800;
        }

        .mv-business-heading {
          margin-bottom: 12px;
        }

        .mv-business-heading > span {
          color: #aaa;
        }

        .mv-business-heading h2 {
          margin: 4px 0 0;
          font-size: 21px;
          font-weight: 950;
          letter-spacing: -0.035em;
        }

        .mv-business-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .mv-business-card {
          width: 100%;
          min-height: 82px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 12px;
          border-radius: 21px;
          background: #fff;
          border: 1px solid #e8e9ec;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.025);
          text-align: left;
          cursor: pointer;
        }

        .mv-business-card:hover {
          border-color: #29ab87;
          transform: translateY(-1px);
        }

        .mv-business-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 16px;
          background: #eef8f4;
          color: #29ab87;
        }

        .mv-business-info {
          min-width: 0;
          flex: 1;
        }

        .mv-business-title {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .mv-business-title h3 {
          overflow: hidden;
          margin: 0;
          font-size: 13px;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mv-verified,
        .mv-business-pending {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
          padding: 4px 7px;
          border-radius: 999px;
          font-size: 7px;
          font-weight: 900;
        }

        .mv-verified {
          background: #eaf8f0;
          color: #16a05d;
        }

        .mv-business-pending {
          background: #fff5dc;
          color: #b57900;
        }

        .mv-business-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 7px;
          color: #96999f;
          font-size: 8px;
          font-weight: 700;
        }

        .mv-business-meta span {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .mv-business-arrow {
          color: #aaa;
          flex-shrink: 0;
        }

        .mv-business-empty {
          padding: 30px;
          border: 1px dashed #dfe1e5;
          border-radius: 20px;
          background: #fff;
          color: #888;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
        }

        .mv-business-alert {
          margin-bottom: 14px;
          padding: 12px 15px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 800;
        }

        .mv-business-alert.error {
          color: #b42318;
          background: #fff0ef;
          border: 1px solid #ffd4d0;
        }

        .mv-business-alert.success {
          color: #087443;
          background: #eaf8f0;
          border: 1px solid #c8ead8;
        }

        .mv-verification-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
        }

        .mv-verification-modal {
          width: min(680px, 100%);
          max-height: 90vh;
          overflow: auto;
          padding: 24px;
          border-radius: 26px;
          background: #fff;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
        }

        .mv-verification-modal-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid #eee;
        }

        .mv-verification-modal-header span,
        .mv-document-heading span {
          color: #29ab87;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.14em;
        }

        .mv-verification-modal-header h2 {
          margin: 5px 0 3px;
          font-size: 24px;
          font-weight: 950;
          letter-spacing: -0.04em;
        }

        .mv-verification-modal-header p {
          margin: 0;
          color: #888;
          font-size: 10px;
        }

        .mv-verification-modal-header button {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 12px;
          background: #f3f3f3;
          cursor: pointer;
        }

        .mv-verification-status {
          display: flex;
          justify-content: space-between;
          margin: 18px 0;
          padding: 14px;
          border-radius: 15px;
          background: #f7f8fa;
        }

        .mv-verification-status span {
          color: #999;
          font-size: 9px;
          font-weight: 800;
        }

        .mv-verification-status strong {
          color: #29ab87;
          font-size: 10px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .mv-document-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .mv-document-heading strong {
          font-size: 12px;
        }

        .mv-document-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
        }

        .mv-document-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px;
          border: 1px solid #e8e9ec;
          border-radius: 15px;
        }

        .mv-document-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #eef8f4;
          color: #29ab87;
        }

        .mv-document-card > div:nth-child(2) {
          flex: 1;
          min-width: 0;
        }

        .mv-document-card strong,
        .mv-document-card small {
          display: block;
        }

        .mv-document-card strong {
          font-size: 11px;
          font-weight: 900;
        }

        .mv-document-card small {
          margin-top: 3px;
          color: #999;
          font-size: 8px;
        }

        .mv-document-view {
          padding: 7px 10px;
          border-radius: 9px;
          background: #111;
          color: #fff;
          font-size: 8px;
          font-weight: 900;
          text-decoration: none;
        }

        .mv-verification-reason {
          width: 100%;
          min-height: 80px;
          resize: vertical;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 13px;
          outline: none;
          font: inherit;
          font-size: 10px;
          margin-bottom: 12px;
        }

        .mv-verification-reason:focus {
          border-color: #29ab87;
        }

        .mv-verification-actions {
          display: grid;
          grid-template-columns: 1fr 0.7fr 1.2fr;
          gap: 8px;
        }

        .mv-verification-actions button {
          min-height: 42px;
          border: 0;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .mv-verification-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mv-request-button {
          background: #eef3ff;
          color: #3654a8;
        }

        .mv-reject-button {
          background: #fff0ef;
          color: #c43d32;
        }

        .mv-approve-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          background: #29ab87;
          color: #fff;
        }

        .mv-verification-loading {
          padding: 60px 20px;
          text-align: center;
          color: #888;
          font-size: 12px;
          font-weight: 800;
        }

        @media (max-width: 640px) {
          .mv-business-page {
            padding: 22px 14px 80px;
          }

          .mv-business-header {
            align-items: center;
          }

          .mv-business-header h1 {
            font-size: 34px;
          }

          .mv-business-stats {
            grid-template-columns: 1fr;
          }

          .mv-verification-overlay {
            padding: 10px;
          }

          .mv-verification-modal {
            padding: 18px;
            border-radius: 21px;
          }

          .mv-verification-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
