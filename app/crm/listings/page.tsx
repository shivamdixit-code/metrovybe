"use client";

import { useEffect, useState } from "react";
import { getListings, type Listing } from "@/lib/api";
import {
  ChevronRight,
  MapPin,
  Star,
  Store,
} from "lucide-react";

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadListings() {
    try {
      setLoading(true);
      setError("");

      const data = await getListings();
      setListings(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  return (
    <main className="mv-section-page">
      <div className="mv-section-shell">

        <header className="mv-page-header">
          <div>
            <span className="mv-kicker">LIVE DATABASE</span>
            <h1>Listings</h1>
            <p>Live listings from the MetroVybe database.</p>
          </div>

          <div className="mv-total-badge">
            <strong>{loading ? "…" : listings.length}</strong>
            <span>Listings</span>
          </div>
        </header>

        <section className={`mv-hero-stat ${loading ? "is-loading" : ""}`}>
          <div>
            <span>LIVE DATABASE</span>
            <strong>{loading ? "…" : listings.length}</strong>
            <p>Businesses currently available in MongoDB</p>
          </div>

          <div className="mv-hero-icon">
            <Store size={27} />
          </div>
        </section>

        <div className="mv-section-heading">
          <div>
            <span>DATABASE</span>
            <h2>All listings</h2>
          </div>
        </div>

        <div className="mv-card-list">
          {loading ? (
            <div className="mv-list-loading">
              <strong>Loading listings</strong>
              <span>Fetching current listings from MongoDB.</span>
            </div>
          ) : error ? (
            <div className="mv-list-loading">
              <strong>Unable to load listings</strong>
              <span>{error}</span>
              <button type="button" onClick={loadListings}>
                Try again
              </button>
            </div>
          ) : listings.length === 0 ? (
            <div className="mv-list-loading">
              <strong>No listings found</strong>
              <span>There are currently no listings in MongoDB.</span>
            </div>
          ) : (
          listings.map((item, index) => (
            <article className="mv-list-card" key={item.id}>

              <div className={`mv-list-avatar avatar-${index % 4}`}>
                <Store size={20} />
              </div>

              <div className="mv-list-content">
                <div className="mv-list-title-row">
                  <h3>{item.title}</h3>

                  <span className="mv-active-pill">
                    <i />
                    Live
                  </span>
                </div>

                <div className="mv-list-details">
                  <span>{item.category}</span>

                  <span>
                    <MapPin size={11} />
                    {item.location}
                  </span>
                </div>

                <div className="mv-list-bottom">
                  <strong>{item.price}</strong>

                  <span className="mv-rating">
                    <Star size={11} fill="currentColor" />
                    {item.rating}
                  </span>
                </div>
              </div>

              <div className="mv-card-arrow">
                <ChevronRight size={18} />
              </div>

            </article>
          ))
          )}
        </div>

      </div>

      <style jsx global>{`

        .mv-section-page {
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

        .mv-section-shell {
          width: min(1050px, 100%);
          margin: 0 auto;
        }

        .mv-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 23px;
        }

        .mv-kicker {
          color: #29AB87;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .14em;
        }

        .mv-page-header h1 {
          margin: 6px 0 0;
          font-size: clamp(34px,5vw,48px);
          line-height: .95;
          letter-spacing: -.055em;
          font-weight: 950;
        }

        .mv-page-header p {
          margin: 8px 0 0;
          color: #858990;
          font-size: 13px;
          font-weight: 600;
        }

        .mv-total-badge {
          width: 65px;
          height: 65px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 21px;
          background: #111;
          color: #fff;
          box-shadow: 0 12px 28px rgba(0,0,0,.12);
        }

        .mv-total-badge strong {
          font-size: 20px;
          font-weight: 950;
        }

        .mv-total-badge span {
          margin-top: 3px;
          color: #aaa;
          font-size: 8px;
          font-weight: 800;
        }

        .mv-hero-stat {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 150px;
          padding: 23px;
          border-radius: 27px;
          color: #fff;
          background:
            radial-gradient(
              circle at 90% 10%,
              rgba(41,171,135,.95),
              transparent 43%
            ),
            #111;
          box-shadow: 0 18px 40px rgba(0,0,0,.12);
          margin-bottom: 29px;
        }

        .mv-hero-stat span {
          color: rgba(255,255,255,.48);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
        }

        .mv-hero-stat strong {
          display: block;
          margin-top: 11px;
          font-size: 32px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -.05em;
        }

        .mv-hero-stat p {
          margin: 5px 0 0;
          color: rgba(255,255,255,.53);
          font-size: 10px;
          font-weight: 600;
        }

        .mv-hero-icon {
          width: 59px;
          height: 59px;
          display: grid;
          place-items: center;
          border-radius: 19px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.12);
        }

        .mv-hero-stat.is-loading {
          opacity: .72;
        }

        .mv-hero-stat.is-loading strong {
          min-width: 42px;
          color: rgba(255,255,255,.65);
        }

        .mv-section-heading {
          margin-bottom: 12px;
        }

        .mv-section-heading span {
          color: #aaa;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .13em;
        }

        .mv-section-heading h2 {
          margin: 4px 0 0;
          font-size: 21px;
          font-weight: 950;
          letter-spacing: -.035em;
        }

        .mv-card-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .mv-list-card {
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 88px;
          padding: 13px;
          background: #fff;
          border: 1px solid #e8e9ec;
          border-radius: 22px;
          box-shadow: 0 6px 24px rgba(0,0,0,.025);
          transition: .18s ease;
        }

        .mv-list-card:hover {
          transform: translateY(-2px);
          border-color: rgba(41,171,135,.18);
          box-shadow: 0 14px 35px rgba(41,171,135,.07);
        }

        .mv-list-avatar {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 17px;
        }

        .avatar-0,
        .avatar-2 {
          background: #eef3ff;
          color: #29AB87;
        }

        .avatar-1,
        .avatar-3 {
          background: #eaf8f0;
          color: #16a05d;
        }

        .mv-list-content {
          min-width: 0;
          flex: 1;
        }

        .mv-list-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mv-list-title-row h3 {
          overflow: hidden;
          margin: 0;
          font-size: 13px;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mv-active-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 7px;
          border-radius: 999px;
          background: #eaf8f0;
          color: #16a05d;
          font-size: 7px;
          font-weight: 900;
        }

        .mv-active-pill i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #16a05d;
        }

        .mv-list-details {
          display: flex;
          gap: 11px;
          margin-top: 5px;
          color: #96999f;
          font-size: 9px;
          font-weight: 650;
        }

        .mv-list-details span {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .mv-list-bottom {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 7px;
        }

        .mv-list-bottom strong {
          font-size: 11px;
          font-weight: 900;
        }

        .mv-rating {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #29AB87;
          font-size: 9px;
          font-weight: 850;
        }

        .mv-card-arrow {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 12px;
          background: #f5f6f8;
          color: #999;
        }

        .mv-list-loading {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 30px;
          border: 1px dashed #d9dde3;
          border-radius: 22px;
          background: #fff;
          text-align: center;
        }

        .mv-list-loading strong {
          font-size: 14px;
          font-weight: 900;
        }

        .mv-list-loading span {
          color: #858990;
          font-size: 11px;
        }

        .mv-list-loading button {
          margin-top: 8px;
          padding: 9px 14px;
          border: 0;
          border-radius: 10px;
          background: #29AB87;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        @media(max-width:700px) {

          .mv-section-page {
            padding: 22px 13px 90px;
          }

          .mv-page-header h1 {
            font-size: 35px;
          }

          .mv-page-header p {
            font-size: 11px;
          }

          .mv-total-badge {
            width: 50px;
            height: 50px;
            border-radius: 16px;
          }

          .mv-total-badge strong {
            font-size: 17px;
          }

          .mv-hero-stat {
            min-height: 137px;
            padding: 20px;
            border-radius: 24px;
          }

          .mv-list-card {
            min-height: 83px;
            padding: 11px;
            gap: 10px;
            border-radius: 19px;
          }

          .mv-list-avatar {
            width: 45px;
            height: 45px;
            border-radius: 15px;
          }

          .mv-list-title-row h3 {
            font-size: 12px;
          }

          .mv-list-details {
            font-size: 8px;
          }

          .mv-list-details span:last-child {
            max-width: 110px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

      `}</style>
    </main>
  );
}
