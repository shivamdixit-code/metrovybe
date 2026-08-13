"use client";

import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";

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

          <span
            className="badge"
            style={{
              background: "linear-gradient(135deg, #FFF3A3 0%, #FFD700 28%, #F5B700 55%, #FFF0A0 78%, #D99A00 100%)",
              color: "#111",
              border: "1px solid #FFE45C",
              boxShadow: "0 2px 10px rgba(255, 193, 7, 0.45)",
              textShadow: "0 1px 0 rgba(255,255,255,0.55)"
            }}
          >
            FEATURED
          </span>
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
