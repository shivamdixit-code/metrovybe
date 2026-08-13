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

type ListingCardProps = {
  item: Listing;
};

export function ListingCard({ item }: ListingCardProps) {
  return (
    <Link
      href={`/listing/${item.id}`}
      className="listing-card"
    >

      <div className="listing-image-wrap">

        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="listing-image"
          />
        ) : (
          <div className="listing-image-placeholder">
            MetroVybe
          </div>
        )}

        <span className="featured-badge">
          FEATURED
        </span>

        <button
          type="button"
          className="listing-heart"
          onClick={(event) => {
            event.preventDefault();
          }}
          aria-label="Save listing"
        >
          <Heart size={21} />
        </button>

      </div>

      <div className="listing-body">

        <div className="listing-title-row">

          <h3>
            {item.title}
          </h3>

          {item.price && (
            <div className="listing-price">
              {item.price}
            </div>
          )}

        </div>

        <div className="listing-location">
          <MapPin size={15} />
          <span>
            {item.location || "Near you"}
          </span>
        </div>

        {item.rating !== undefined && (
          <div className="listing-rating">
            <Star size={15} fill="currentColor" />
            <span>
              {item.rating}
            </span>

            {item.reviews !== undefined && (
              <span>
                ({item.reviews})
              </span>
            )}
          </div>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="listing-tags">
            {item.tags.map((tag) => (
              <span key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

      </div>

    </Link>
  );
}
