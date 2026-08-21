"use client";

import {
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  MapPin,
} from "lucide-react";

const providers = [
  ["PR-101","StayNest Homes","Stay","32 listings","Verified"],
  ["PR-102","HomeBite Kitchen","Eat","18 listings","Verified"],
  ["PR-103","QuickWash","Live","11 listings","Pending"],
  ["PR-104","CitySwift","Move","8 listings","Verified"],
];

export default function Providers() {
  const verified = providers.filter(
    p => p[4] === "Verified"
  ).length;

  return (
    <main className="mv-provider-page">
      <div className="mv-provider-shell">

        <header className="mv-provider-header">
          <div>
            <span>PARTNERS</span>
            <h1>Providers</h1>
            <p>Local businesses and service providers.</p>
          </div>

          <div className="mv-provider-count">
            <strong>{providers.length}</strong>
            <small>Providers</small>
          </div>
        </header>

        <section className="mv-provider-hero">
          <div>
            <span>BUSINESS NETWORK</span>
            <strong>{providers.length}</strong>
            <p>{verified} verified providers on MetroVybe</p>
          </div>

          <BriefcaseBusiness size={28} />
        </section>

        <div className="mv-provider-heading">
          <span>BUSINESS DIRECTORY</span>
          <h2>All providers</h2>
        </div>

        <div className="mv-provider-list">
          {providers.map((provider) => (
            <article className="mv-provider-card" key={provider[0]}>

              <div className="mv-provider-icon">
                <BriefcaseBusiness size={19} />
              </div>

              <div className="mv-provider-info">

                <div className="mv-provider-title">
                  <h3>{provider[1]}</h3>

                  <span
                    className={
                      provider[4] === "Verified"
                        ? "mv-verified"
                        : "mv-provider-pending"
                    }
                  >
                    {provider[4] === "Verified" && (
                      <BadgeCheck size={10} />
                    )}
                    {provider[4]}
                  </span>
                </div>

                <div className="mv-provider-meta">
                  <span>{provider[0]}</span>

                  <span>
                    <MapPin size={10} />
                    {provider[2]}
                  </span>

                  <strong>{provider[3]}</strong>
                </div>

              </div>

              <ChevronRight
                size={18}
                className="mv-provider-arrow"
              />

            </article>
          ))}
        </div>

      </div>

      <style jsx global>{`

        .mv-provider-page {
          min-height:100vh;
          padding:34px 28px 60px;
          background:
            radial-gradient(circle at 90% 0%,rgba(41,171,135,.06),transparent 30%),
            #f7f8fa;
        }

        .mv-provider-shell {
          width:min(1050px,100%);
          margin:auto;
        }

        .mv-provider-header {
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          margin-bottom:23px;
        }

        .mv-provider-header > div:first-child > span,
        .mv-provider-heading > span {
          color:#29AB87;
          font-size:9px;
          font-weight:950;
          letter-spacing:.14em;
        }

        .mv-provider-header h1 {
          margin:6px 0 0;
          font-size:clamp(34px,5vw,48px);
          line-height:.95;
          letter-spacing:-.055em;
          font-weight:950;
        }

        .mv-provider-header p {
          margin:8px 0 0;
          color:#858990;
          font-size:13px;
          font-weight:600;
        }

        .mv-provider-count {
          width:62px;
          height:62px;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          border-radius:20px;
          background:#111;
          color:#fff;
        }

        .mv-provider-count strong {
          font-size:20px;
          font-weight:950;
        }

        .mv-provider-count small {
          color:#aaa;
          font-size:8px;
          font-weight:800;
        }

        .mv-provider-hero {
          min-height:145px;
          padding:23px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          border-radius:27px;
          color:#fff;
          background:
            radial-gradient(circle at 90% 10%,rgba(41,171,135,.95),transparent 43%),
            #111;
          box-shadow:0 18px 40px rgba(0,0,0,.12);
          margin-bottom:29px;
        }

        .mv-provider-hero span {
          color:rgba(255,255,255,.48);
          font-size:9px;
          font-weight:900;
          letter-spacing:.12em;
        }

        .mv-provider-hero strong {
          display:block;
          margin-top:10px;
          font-size:32px;
          font-weight:950;
        }

        .mv-provider-hero p {
          margin:4px 0 0;
          color:rgba(255,255,255,.55);
          font-size:10px;
        }

        .mv-provider-heading {
          margin-bottom:12px;
        }

        .mv-provider-heading > span {
          color:#aaa;
        }

        .mv-provider-heading h2 {
          margin:4px 0 0;
          font-size:21px;
          font-weight:950;
          letter-spacing:-.035em;
        }

        .mv-provider-list {
          display:flex;
          flex-direction:column;
          gap:9px;
        }

        .mv-provider-card {
          min-height:82px;
          display:flex;
          align-items:center;
          gap:13px;
          padding:12px;
          border-radius:21px;
          background:#fff;
          border:1px solid #e8e9ec;
          box-shadow:0 6px 24px rgba(0,0,0,.025);
        }

        .mv-provider-icon {
          width:48px;
          height:48px;
          display:grid;
          place-items:center;
          flex-shrink:0;
          border-radius:16px;
          background:#eef3ff;
          color:#29AB87;
        }

        .mv-provider-info {
          min-width:0;
          flex:1;
        }

        .mv-provider-title {
          display:flex;
          align-items:center;
          gap:7px;
        }

        .mv-provider-title h3 {
          overflow:hidden;
          margin:0;
          font-size:13px;
          font-weight:900;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .mv-verified,
        .mv-provider-pending {
          display:inline-flex;
          align-items:center;
          gap:3px;
          flex-shrink:0;
          padding:4px 7px;
          border-radius:999px;
          font-size:7px;
          font-weight:900;
        }

        .mv-verified {
          background:#eaf8f0;
          color:#16a05d;
        }

        .mv-provider-pending {
          background:#eef3ff;
          color:#29AB87;
        }

        .mv-provider-meta {
          display:flex;
          align-items:center;
          gap:10px;
          margin-top:7px;
          color:#96999f;
          font-size:8px;
          font-weight:700;
        }

        .mv-provider-meta span {
          display:inline-flex;
          align-items:center;
          gap:3px;
        }

        .mv-provider-meta strong {
          color:#111;
          font-size:9px;
          font-weight:900;
        }

        .mv-provider-arrow {
          color:#aaa;
          flex-shrink:0;
        }

        @media(max-width:700px) {
          .mv-provider-page {
            padding:22px 13px 90px;
          }

          .mv-provider-header h1 {
            font-size:35px;
          }

          .mv-provider-header p {
            font-size:11px;
          }

          .mv-provider-count {
            width:50px;
            height:50px;
            border-radius:16px;
          }

          .mv-provider-hero {
            min-height:137px;
            border-radius:24px;
          }

          .mv-provider-card {
            padding:11px;
            border-radius:19px;
          }

          .mv-provider-icon {
            width:45px;
            height:45px;
          }

          .mv-provider-meta {
            gap:7px;
          }
        }

      `}</style>
    </main>
  );
}
