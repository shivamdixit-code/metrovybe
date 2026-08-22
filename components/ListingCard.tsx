"use client";

import Link from "next/link";
import {
  Heart,
  MapPin,
  Star,
  Home,
  Utensils,
  BedDouble,
  BookOpen,
  Briefcase,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  checkSavedListing,
  saveListing,
  unsaveListing,
} from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";

type Listing = {
  id: string;
  title: string;
  category?: string;
  location?: string;
  price?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  tags?: string[];
};

export function ListingCard({ item }: { item: Listing }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSavedState = async () => {
      const token = getToken();
      const user = getUser();

      if (!token || !user || user.role !== "customer") {
        return;
      }

      try {
        const result = await checkSavedListing(item.id);

        if (mounted) {
          setSaved(result.saved);
        }
      } catch (error) {
        console.error("Failed to check saved listing:", error);
      }
    };

    loadSavedState();

    return () => {
      mounted = false;
    };
  }, [item.id]);

  const handleSave = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      window.location.href = "/login";
      return;
    }

    if (user.role !== "customer") {
      return;
    }

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      if (saved) {
        await unsaveListing(item.id);
        setSaved(false);
      } else {
        await saveListing(item.id);
        setSaved(true);
      }

      window.dispatchEvent(new Event("metrovybe-saved-changed"));
    } catch (error) {
      console.error("Failed to update saved listing:", error);
    } finally {
      setSaving(false);
    }
  };

  const category = (item.category || "").toLowerCase();

  const CategoryIcon =
    category.includes("food") || category.includes("tiffin")
      ? Utensils
      : category.includes("room") ||
          category.includes("pg") ||
          category.includes("stay")
        ? BedDouble
        : category.includes("study") ||
            category.includes("education")
          ? BookOpen
          : category.includes("job") ||
              category.includes("work")
            ? Briefcase
            : category.includes("shop") ||
                category.includes("buy")
              ? ShoppingBag
              : Home;

  const categoryColor =
    category.includes("food") || category.includes("tiffin")
      ? "#F97316"
      : category.includes("room") ||
          category.includes("pg") ||
          category.includes("stay")
        ? "#2563EB"
        : category.includes("study") ||
            category.includes("education")
          ? "#7C3AED"
          : category.includes("job") ||
              category.includes("work")
            ? "#16A34A"
            : category.includes("shop") ||
                category.includes("buy")
              ? "#DB2777"
              : "#2563EB";

  return (
    <div className="card">
      <Link href={`/listing/${item.id}`}>
        <div className="card-image">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div className="fake-img">🏠</div>
          )}

          {item.category && (
            <span
              style={{
                position: "absolute",
                left: 10,
                bottom: 10,
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.97)",
                border: "1px solid rgba(255,255,255,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 14px rgba(0,0,0,0.28)",
                zIndex: 3,
              }}
              title={item.category}
            >
              <CategoryIcon
                size={20}
                color={categoryColor}
                strokeWidth={2.5}
              />
            </span>
          )}

          <span
            className="badge"
            style={{
              background:
                "linear-gradient(135deg, #FFF3A3 0%, #FFD700 28%, #F5B700 55%, #FFF0A0 78%, #D99A00 100%)",
              color: "#111",
              border: "1px solid #FFE45C",
              boxShadow: "0 2px 10px rgba(255, 193, 7, 0.45)",
              textShadow: "0 1px 0 rgba(255,255,255,0.55)",
            }}
          >
            FEATURED
          </span>

          <button
            type="button"
            aria-label={saved ? "Remove from saved" : "Save listing"}
            title={saved ? "Remove from saved" : "Save listing"}
            onClick={handleSave}
            disabled={saving}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.9)",
              background: "rgba(255,255,255,0.96)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: saving ? "wait" : "pointer",
              zIndex: 5,
              boxShadow: "0 3px 14px rgba(0,0,0,0.25)",
              padding: 0,
            }}
          >
            <Heart
              size={21}
              strokeWidth={2.4}
              fill={saved ? "#ff3b6b" : "none"}
              color={saved ? "#ff3b6b" : "#111"}
            />
          </button>
        </div>
      </Link>

      <div className="card-body">
        <div className="card-title-row">
          <div className="card-title">{item.title}</div>

          {item.price && (
            <div className="price">
              {item.price}
            </div>
          )}
        </div>

        <div className="meta">
          <MapPin size={14} style={{ verticalAlign: "-2px" }} />{" "}
          {item.location || "Near you"}

          {item.rating !== undefined && (
            <span className="rating">
              <Star
                size={14}
                className="star"
                fill="currentColor"
                style={{ verticalAlign: "-2px" }}
              />{" "}
              {item.rating} ({item.reviews || 0})
            </span>
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="tags">
            {item.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <Link
            href={`/listing/${item.id}`}
            className="btn btn-small"
            style={{ display: "inline-block" }}
          >
            View listing →
          </Link>
        </div>
      </div>
    </div>
  );
}
