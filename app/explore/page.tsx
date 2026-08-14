import Link from "next/link";
import { MapPin, SlidersHorizontal, ArrowUpRight } from "lucide-react";


import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getListings } from "@/lib/api";
import ExploreMapClient from "@/components/ExploreMapClient";
import {
  Grid2X2,
  House,
  Utensils,
  WashingMachine,
  Truck,
} from "lucide-react";

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
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            marginTop: 42,
            marginBottom: 28,
            borderRadius: 30,
            background: "#111",
            minHeight: 300,
            padding: "46px",
            color: "#fff",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: "var(--green)",
              right: -150,
              top: -210,
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "#fff",
              opacity: 0.08,
              right: 100,
              bottom: -170,
            }}
          />

          <div
            style={{
              position: "absolute",
              zIndex: 2,
              right: 55,
              top: "50%",
              transform: "translateY(-50%) rotate(10deg)",
              width: 190,
              height: 230,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <MapPin
              size={190}
              strokeWidth={1.5}
              style={{
                color: "#111",
                fill: "var(--green)",
                filter: "drop-shadow(6px 7px 0 rgba(0,0,0,0.25))",
              }}
            />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: 700,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 2,
                marginBottom: 12,
                color: "var(--green)",
              }}
            >
              <MapPin size={15} strokeWidth={3} />
              <span className="explore-hero-near-you">NEAR YOU</span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(48px, 7vw, 82px)",
                lineHeight: 0.95,
                fontWeight: 950,
                letterSpacing: "-4px",
              }}
            >
              Find your
              <br />
              <span className="explore-hero-vibe" style={{ color: "var(--green)" }}>
                local vibe.
              </span>
            </h1>

            <p
              style={{
                margin: "22px 0 0",
                maxWidth: 520,
                color: "#cfcfcf",
                fontSize: 16,
                lineHeight: 1.6,
                fontWeight: 600,
              }}
            >
              Discover trusted places, services and everyday essentials
              around you.
            </p>

          </div>
        </section>


        {/* CATEGORY BAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {[
            { label: "All", value: "", icon: Grid2X2 },
            { label: "Stay", value: "stay", icon: House },
            { label: "Food", value: "food", icon: Utensils },
            { label: "Laundry", value: "laundry", icon: WashingMachine },
            { label: "Move", value: "move", icon: Truck },
          ].map(({ label, value, icon: Icon }) => {
            const active = value === (params.category || "");

            return (
              <Link
                key={label}
                href={value ? `/explore?category=${value}` : "/explore"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 15px",
                  borderRadius: 999,
                  border: active
                    ? "1.5px solid #111"
                    : "1.5px solid rgba(17,17,17,0.14)",
                  background: active ? "var(--green)" : "rgba(255,255,255,0.96)",
                  color: "#111",
                  boxShadow: active
                    ? "0 2px 0 rgba(17,17,17,0.18)"
                    : "0 2px 8px rgba(17,17,17,0.08)",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  fontSize: 13,
                  textDecoration: "none",
                  transition: "all 160ms ease",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Icon size={16} strokeWidth={2.2} />
                {label}
              </Link>
            );
          })}

          <button
            type="button"
            className="filter-btn"
            style={{
              marginLeft: "auto",
              flexShrink: 0,
              height: 40,
              padding: "0 15px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              borderRadius: 999,
              border: "1.5px solid rgba(17,17,17,0.14)",
              background: "#fff",
              color: "#111",
              boxShadow: "0 2px 8px rgba(17,17,17,0.08)",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <SlidersHorizontal size={16} strokeWidth={2.2} />
            Filters
          </button>

        </div>

        <div
          className="explore-results-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.45fr) minmax(340px, 0.85fr)",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          <div
            className="explore-list-column"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {listings.length === 0 ? (
              <div
                style={{
                  minHeight: 520,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 32,
                  background: "#fff",
                  border: "1px solid #e8e8e8",
                  borderRadius: 24,
                  boxShadow: "0 6px 22px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "var(--green)",
                    color: "#111",
                    fontSize: 26,
                    fontWeight: 900,
                    marginBottom: 16,
                  }}
                >
                  ✦
                </div>

                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 950,
                    marginBottom: 7,
                  }}
                >
                  No listings yet
                </div>

                <div
                  style={{
                    maxWidth: 360,
                    color: "#777",
                    fontSize: 13,
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  We don't have any listings in this category yet.
                  Try another category or check back soon.
                </div>
              </div>
            ) : (
              listings.map((x) => (
              <Link
                href={`/listing/${x.id}`}
                key={x.id}
                style={{
                  display: "flex",
                  minHeight: 168,
                  textDecoration: "none",
                  color: "inherit",
                  background: "#fff",
                  border: "1px solid #e8e8e8",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 6px 22px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 180,
                    minWidth: 180,
                    overflow: "hidden",
                    background: "#eee",
                  }}
                >
                  <img
                    src={x.image}
                    alt={x.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: 10,
                      bottom: 10,
                      padding: "5px 9px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.94)",
                      color: "#111",
                      fontSize: 10,
                      fontWeight: 900,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }}
                  >
                    Verified
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 19,
                          lineHeight: 1.2,
                          fontWeight: 950,
                          letterSpacing: "-0.4px",
                        }}
                      >
                        {x.title}
                      </div>

                      <div
                        style={{
                          width: 32,
                          height: 32,
                          minWidth: 32,
                          borderRadius: "50%",
                          background: "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          fontWeight: 900,
                        }}
                      >
                        ↗
                      </div>
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 10,
                        padding: "6px 9px",
                        borderRadius: 999,
                        background: "#f7f7f7",
                        color: "#555",
                        fontSize: 12,
                        fontWeight: 750,
                      }}
                    >
                      <MapPin size={14} strokeWidth={2.4} />
                      {x.location}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      gap: 12,
                      marginTop: 16,
                      paddingTop: 13,
                      borderTop: "1px solid #eeeeee",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#999",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.6px",
                          marginBottom: 3,
                        }}
                      >
                        Starting from
                      </div>

                      <strong
                        style={{
                          fontSize: 20,
                          fontWeight: 950,
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {x.price}
                      </strong>
                    </div>

                    <div
                      className="explore-rating-pill"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: "#FFF4C7",
                        border: "1px solid #E8C95E",
                        color: "#705000",
                        boxShadow: "0 2px 6px rgba(214,169,45,0.15)",
                      }}
                    >
                      <span
                        style={{
                          color: "#F5B800",
                          fontSize: 21,
                          lineHeight: 1,
                          textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                        }}
                      >
                        ★
                      </span>

                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 950,
                        }}
                      >
                        {x.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              ))
            )}
          </div>

          <div
            style={{
              position: "sticky",
              top: 24,
            }}
          >
            <ExploreMapClient listings={listings} />
          </div>
        </div>
      </main>

      <BottomNav active="explore" />
    </div>
  );
}
