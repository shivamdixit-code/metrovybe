"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth";
import {
  Users,
  UserCheck,
  UserX,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  createdAt?: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch("/api/admin/customers");

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      setCustomers(Array.isArray(data) ? data : data.customers || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const active = customers.filter(
    (customer) => customer.status === "active"
  ).length;

  const inactive = customers.filter(
    (customer) => customer.status !== "active"
  ).length;

  return (
    <main className="real-page">
      <div className="real-shell">
        <header className="real-header">
          <div>
            <span>CUSTOMERS</span>
            <h1>Customers</h1>
            <p>Real customer records from MongoDB.</p>
          </div>

          <button className="refresh-button" onClick={loadCustomers}>
            <RefreshCw size={15} />
            Refresh
          </button>
        </header>

        <section className="real-stats">
          <div className="real-stat primary">
            <div className="stat-icon">
              <Users size={18} />
            </div>
            <span>Total customers</span>
            <strong>{customers.length}</strong>
          </div>

          <div className="real-stat">
            <div className="stat-icon green">
              <UserCheck size={18} />
            </div>
            <span>Active</span>
            <strong>{active}</strong>
          </div>

          <div className="real-stat">
            <div className="stat-icon gray">
              <UserX size={18} />
            </div>
            <span>Other status</span>
            <strong>{inactive}</strong>
          </div>
        </section>

        <section className="real-section">
          <div className="section-heading">
            <div>
              <span>DATABASE</span>
              <h2>Customer records</h2>
            </div>
            <small>{customers.length} real records</small>
          </div>

          {loading ? (
            <div className="empty-card">
              <div className="loader" />
              <strong>Loading customers</strong>
              <p>Fetching current records from MongoDB.</p>
            </div>
          ) : error ? (
            <div className="empty-card error">
              <strong>Unable to load customers</strong>
              <p>{error}</p>
              <button onClick={loadCustomers}>Try again</button>
            </div>
          ) : customers.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">
                <Users size={22} />
              </div>
              <strong>No customers yet</strong>
              <p>
                There are currently no customer records in MongoDB.
              </p>
            </div>
          ) : (
            <div className="customer-list">
              {customers.map((customer) => (
                <article className="customer-card" key={customer._id}>
                  <div className="customer-avatar">
                    {(customer.name || "?").charAt(0).toUpperCase()}
                  </div>

                  <div className="customer-content">
                    <div className="customer-title">
                      <h3>{customer.name}</h3>
                      <span
                        className={
                          customer.status === "active"
                            ? "status active"
                            : "status"
                        }
                      >
                        {customer.status || "unknown"}
                      </span>
                    </div>

                    <p>{customer.email}</p>

                    <small>
                      {customer.phone || "No phone number"}
                      {customer.createdAt
                        ? ` · Joined ${new Date(
                            customer.createdAt
                          ).toLocaleDateString()}`
                        : ""}
                    </small>
                  </div>

                  <ChevronRight size={18} />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        .real-page {
          min-height: 100vh;
          padding: 34px 28px 60px;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(41,171,135,.06),
              transparent 30%
            ),
            #f7f8fa;
        }

        .real-shell {
          width: min(1050px, 100%);
          margin: auto;
        }

        .real-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
        }

        .real-header > div > span,
        .section-heading > div > span {
          color: #29AB87;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.14em;
        }

        .real-header h1 {
          margin: 6px 0 0;
          font-size: clamp(34px, 5vw, 48px);
          line-height: 0.95;
          letter-spacing: -0.055em;
          font-weight: 950;
        }

        .real-header p {
          margin: 8px 0 0;
          color: #858990;
          font-size: 13px;
          font-weight: 600;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #e1e3e8;
          background: white;
          border-radius: 14px;
          padding: 10px 13px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .real-stats {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 10px;
          margin-bottom: 30px;
        }

        .real-stat {
          min-height: 125px;
          padding: 18px;
          border: 1px solid #e6e7eb;
          border-radius: 22px;
          background: white;
        }

        .real-stat.primary {
          background: #111;
          color: white;
          border-color: #111;
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #e8f7f2;
          color: #29AB87;
          margin-bottom: 16px;
        }

        .stat-icon.green {
          color: #12955a;
          background: #eaf8f0;
        }

        .stat-icon.gray {
          color: #777;
          background: #f0f1f3;
        }

        .real-stat span {
          display: block;
          color: #8b8e95;
          font-size: 10px;
          font-weight: 800;
        }

        .real-stat.primary span {
          color: #aaa;
        }

        .real-stat strong {
          display: block;
          margin-top: 4px;
          font-size: 28px;
          line-height: 1;
          font-weight: 950;
        }

        .real-section {
          margin-top: 10px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 12px;
        }

        .section-heading h2 {
          margin: 5px 0 0;
          font-size: 21px;
          letter-spacing: -0.035em;
          font-weight: 950;
        }

        .section-heading small {
          color: #999;
          font-size: 10px;
          font-weight: 700;
        }

        .customer-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .customer-card {
          min-height: 80px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 12px;
          border: 1px solid #e7e8eb;
          border-radius: 21px;
          background: white;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.025);
        }

        .customer-avatar {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: #111;
          color: white;
          font-size: 15px;
          font-weight: 950;
        }

        .customer-content {
          min-width: 0;
          flex: 1;
        }

        .customer-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .customer-title h3 {
          margin: 0;
          font-size: 13px;
          font-weight: 900;
        }

        .status {
          padding: 4px 7px;
          border-radius: 999px;
          background: #f0f1f3;
          color: #777;
          font-size: 7px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .status.active {
          color: #108b54;
          background: #e9f8ef;
        }

        .customer-content p {
          margin: 4px 0;
          color: #777;
          font-size: 11px;
        }

        .customer-content small {
          color: #aaa;
          font-size: 9px;
          font-weight: 600;
        }

        .empty-card {
          min-height: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
          border: 1px dashed #d9dce2;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.7);
        }

        .empty-card strong {
          margin-top: 12px;
          font-size: 15px;
          font-weight: 900;
        }

        .empty-card p {
          margin: 6px 0 0;
          color: #8b8e95;
          font-size: 11px;
          max-width: 340px;
        }

        .empty-card button {
          margin-top: 14px;
          border: 0;
          border-radius: 12px;
          background: #111;
          color: white;
          padding: 9px 14px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: #e8f7f2;
          color: #29AB87;
        }

        .loader {
          width: 22px;
          height: 22px;
          border: 2px solid #e5e7eb;
          border-top-color: #29AB87;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .error strong {
          color: #c62828;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .real-page {
            padding: 22px 14px 40px;
          }

          .real-header {
            align-items: flex-start;
            gap: 14px;
          }

          .refresh-button {
            flex-shrink: 0;
          }

          .real-stats {
            grid-template-columns: 1fr 1fr;
          }

          .real-stat.primary {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </main>
  );
}
