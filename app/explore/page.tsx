import Link from "next/link";
import { MapPin, SlidersHorizontal } from "lucide-react";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getListings } from "@/lib/api";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const listings = await getListings(
    params.category ? { category: params.category } : {}
  );
  const pins = [
    [18, 28],
    [42, 45],
    [66, 30],
    [78, 62],
    [32, 72],
  ];

  return (
    <div className="page">
      <Header />

      <main className="shell inner">
        <div className="section-head">
          <div>
            <h1 className="page-title">EXPLORE.</h1>
            <p className="subtle">
              Find trusted services around you.
            </p>
          </div>

          <button className="filter-btn" type="button">
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>

        <div className="explore-layout">
          <div className="map">
            <div className="map-label">
              <MapPin size={16} />
              Near you
            </div>

            {pins.map((p, i) => (
              <div
                key={i}
                className="map-pin"
                style={{
                  left: `${p[0]}%`,
                  top: `${p[1]}%`,
                }}
              >
                ●
              </div>
            ))}
          </div>

          <div className="listing-list">
            {listings.map((x) => (
              <Link
                href={`/listing/${x.id}`}
                className="listing-mini"
                key={x.id}
              >
                <div className="mini-img">
                  <img
                    src={x.image}
                    alt={x.title}
                  />
                </div>

                <div>
                  <b>{x.title}</b>

                  <div className="meta">
                    <span>{x.category}</span>
                    <span>•</span>
                    <span>{x.location}</span>
                  </div>

                  <div className="mini-bottom">
                    <strong>{x.price}</strong>
                    <span>★ {x.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <BottomNav active="explore" />
    </div>
  );
}
