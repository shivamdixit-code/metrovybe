"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal, X, Check, Grid2X2, House,
  Utensils, WashingMachine, Truck, Star, MapPin,
  IndianRupee, Sparkles, ArrowDownUp
} from "lucide-react";

const categories = [
  { label: "All", value: "", icon: Grid2X2 },
  { label: "Stay", value: "stay", icon: House },
  { label: "Food", value: "eat", icon: Utensils },
  { label: "Laundry", value: "live", icon: WashingMachine },
  { label: "Move", value: "move", icon: Truck },
];

const chipStyle = (active: boolean) => ({
  padding: "9px 13px",
  borderRadius: 999,
  border: active ? "1.5px solid #111" : "1.5px solid #e5e5e5",
  background: active ? "var(--green)" : "#fff",
  color: "#111",
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
});

export default function ExploreFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") || "recommended");

  function applyFilters() {
    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minRating) params.set("minRating", minRating);
    if (location.trim()) params.set("location", location.trim());
    if (featured) params.set("featured", "true");
    if (sort !== "recommended") params.set("sort", sort);

    router.push(`/explore${params.toString() ? `?${params}` : ""}`);
    setOpen(false);
  }

  function clearFilters() {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setLocation("");
    setFeatured(false);
    setSort("recommended");
    router.push("/explore");
    setOpen(false);
  }

  const hasFilters =
    category || minPrice || maxPrice || minRating ||
    location || featured || sort !== "recommended";

  return (
    <>
      <button
        type="button"
        className="filter-btn"
        onClick={() => setOpen(true)}
        style={{
          marginLeft: "auto", flexShrink: 0, height: 40, padding: "0 15px",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          gap: 7, borderRadius: 999,
          border: hasFilters ? "1.5px solid #111" : "1.5px solid rgba(17,17,17,0.14)",
          background: hasFilters ? "var(--green)" : "#fff",
          color: "#111", boxShadow: "0 2px 8px rgba(17,17,17,0.08)",
          fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        <SlidersHorizontal size={16} strokeWidth={2.2} />
        Filters {hasFilters ? "•" : ""}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.42)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 18,
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 500, maxHeight: "88vh",
              overflowY: "auto", background: "#fff", borderRadius: 24,
              padding: 22, boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 23, fontWeight: 950, letterSpacing: "-0.6px" }}>Filters</h2>
                <p style={{ margin: "4px 0 0", color: "#777", fontSize: 13, fontWeight: 600 }}>
                  Find exactly what you're looking for.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} style={{
                width: 36, height: 36, border: "none", borderRadius: "50%",
                background: "#f4f4f4", cursor: "pointer", display: "grid", placeItems: "center"
              }}>
                <X size={19} />
              </button>
            </div>

            <Section icon={<MapPin size={15} />} title="Location">
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="Search city, area or locality"
                style={inputStyle} />
            </Section>

            <Section icon={<Grid2X2 size={15} />} title="Category">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categories.map(({ label, value, icon: Icon }) => {
                  const active = category === value;
                  return (
                    <button key={label} type="button" onClick={() => setCategory(value)}
                      style={{ ...chipStyle(active), display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Icon size={15} /> {label}
                      {active && <Check size={14} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section icon={<IndianRupee size={15} />} title="Price range">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min price" style={inputStyle} />
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max price" style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                {[
                  ["Under ₹500", "", "500"],
                  ["₹500 – ₹2k", "500", "2000"],
                  ["₹2k – ₹10k", "2000", "10000"],
                  ["₹10k+", "10000", ""],
                ].map(([label, min, max]) => (
                  <button key={label} type="button"
                    onClick={() => { setMinPrice(min); setMaxPrice(max); }}
                    style={chipStyle(minPrice === min && maxPrice === max)}>
                    {label}
                  </button>
                ))}
              </div>
            </Section>

            <Section icon={<Star size={15} />} title="Minimum rating">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  ["Any", ""], ["3+ ★", "3"], ["4+ ★", "4"], ["4.5+ ★", "4.5"]
                ].map(([label, value]) => (
                  <button key={label} type="button" onClick={() => setMinRating(value)}
                    style={chipStyle(minRating === value)}>
                    {label}
                  </button>
                ))}
              </div>
            </Section>

            <Section icon={<Sparkles size={15} />} title="Listing type">
              <button type="button" onClick={() => setFeatured(!featured)}
                style={{ ...chipStyle(featured), display: "inline-flex", alignItems: "center", gap: 7 }}>
                <Sparkles size={15} /> Featured listings only
                {featured && <Check size={14} strokeWidth={3} />}
              </button>
            </Section>

            <Section icon={<ArrowDownUp size={15} />} title="Sort by">
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="recommended">Recommended</option>
                <option value="rating-desc">Highest rated</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="newest">Newest first</option>
              </select>
            </Section>

            <div style={{ display: "flex", gap: 10, borderTop: "1px solid #eee", paddingTop: 18, marginTop: 22 }}>
              <button type="button" onClick={clearFilters} style={{
                flex: 1, height: 48, borderRadius: 14, border: "1.5px solid #ddd",
                background: "#fff", fontWeight: 850, cursor: "pointer"
              }}>
                Clear all
              </button>
              <button type="button" onClick={applyFilters} style={{
                flex: 1.35, height: 48, borderRadius: 14, border: "1.5px solid #111",
                background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer"
              }}>
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderTop: "1px solid #eee", paddingTop: 18, marginTop: 18 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 7, fontSize: 12,
        fontWeight: 900, letterSpacing: "0.7px", textTransform: "uppercase",
        color: "#666", marginBottom: 11
      }}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 44,
  borderRadius: 12,
  border: "1.5px solid #e2e2e2",
  padding: "0 13px",
  fontSize: 14,
  fontWeight: 600,
  outline: "none",
  boxSizing: "border-box" as const,
};
