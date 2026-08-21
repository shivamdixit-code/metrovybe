"use client";

import { ClipboardList } from "lucide-react";

export default function Orders() {
  return (
    <main className="crm-empty-page">
      <div className="crm-empty-shell">
        <span>PARTNERS</span>
        <h1>Businesses</h1>
        <p>Orders will appear here once real order records exist.</p>

        <section className="crm-empty-card">
          <div className="crm-empty-icon">
            <ClipboardList size={24} />
          </div>
          <strong>0 real orders</strong>
          <p>
            No Order model or order records currently exist in the
            MetroVybe backend. Nothing has been fabricated for this CRM.
          </p>
        </section>
      </div>

      <style jsx global>{`
        .crm-empty-page {
          min-height: 100vh;
          padding: 34px 28px 60px;
          background:
            radial-gradient(circle at 90% 0%, rgba(41,171,135,.06), transparent 30%),
            #f7f8fa;
        }

        .crm-empty-shell {
          width: min(1050px, 100%);
          margin: auto;
        }

        .crm-empty-shell > span {
          color: #29AB87;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .14em;
        }

        .crm-empty-shell h1 {
          margin: 6px 0 0;
          font-size: clamp(34px,5vw,48px);
          line-height: .95;
          letter-spacing: -.055em;
          font-weight: 950;
        }

        .crm-empty-shell > p {
          margin: 8px 0 28px;
          color: #858990;
          font-size: 13px;
          font-weight: 600;
        }

        .crm-empty-card {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
          border: 1px dashed #d9dce2;
          border-radius: 26px;
          background: rgba(255,255,255,.75);
        }

        .crm-empty-icon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: #e8f7f2;
          color: #29AB87;
        }

        .crm-empty-card strong {
          margin-top: 14px;
          font-size: 17px;
          font-weight: 950;
        }

        .crm-empty-card p {
          max-width: 430px;
          margin: 7px 0 0;
          color: #858990;
          font-size: 11px;
          line-height: 1.6;
        }
      `}</style>
    </main>
  );
}
