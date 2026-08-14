"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const LocationPicker = dynamic(
  () => import("@/components/ListingLocationPicker"),
  { ssr: false }
);

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type Business = {
  businessName: string;
  verificationStatus?: string;
};

type SelectedLocation = {
  latitude: number;
  longitude: number;
  address: string;
};

type Category = "stay" | "eat" | "live" | "move" | "go";

const CATEGORIES: {
  id: Category;
  icon: string;
  name: string;
  description: string;
}[] = [
  {
    id: "stay",
    icon: "🏠",
    name: "STAY",
    description: "PGs, rooms & flatmates",
  },
  {
    id: "eat",
    icon: "🍽️",
    name: "EAT",
    description: "Tiffin & home chefs",
  },
  {
    id: "live",
    icon: "🧺",
    name: "LIVE",
    description: "Laundry & home help",
  },
  {
    id: "move",
    icon: "📦",
    name: "MOVE",
    description: "Movers & storage",
  },
  {
    id: "go",
    icon: "🚗",
    name: "GO",
    description: "Parking & rentals",
  },
];

const OFFERINGS: Record<Category, string[]> = {
  stay: [
    "PG",
    "Room",
    "Flatmate",
    "1 BHK",
    "2 BHK",
    "3 BHK",
    "Shared Accommodation",
  ],
  eat: [
    "Tiffin Service",
    "Home Chef",
    "Meal Service",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
  ],
  live: [
    "Laundry",
    "Home Cleaning",
    "Deep Cleaning",
    "Cook",
    "Maid",
    "Home Help",
    "Repair Service",
  ],
  move: [
    "Movers",
    "Packers & Movers",
    "Storage",
    "Vehicle Transport",
    "Packing Service",
    "Local Moving",
  ],
  go: [
    "Parking",
    "Bike Rental",
    "Scooter Rental",
    "Car Rental",
    "EV Rental",
    "Driver Service",
  ],
};

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  full = false,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "field full" : "field"}>
      <label>
        {label}
        {required && <i> *</i>}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function NewBusinessListing() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [category, setCategory] = useState<Category | "">("");
  const [offering, setOffering] = useState("");

  const [locationPickerOpen, setLocationPickerOpen] =
    useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    image: "",
    images: "",
    tags: "",
  });

  const [details, setDetails] =
    useState<Record<string, string>>({});

  useEffect(() => {
    async function loadBusiness() {
      try {
        const token = getToken();

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const response = await fetch(
          `${API_URL}/api/business/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load business profile"
          );
        }

        const data = await response.json();
        setBusiness(data.business);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load business profile"
        );
      } finally {
        setLoadingBusiness(false);
      }
    }

    loadBusiness();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateDetail(
    field: string,
    value: string
  ) {
    setDetails((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function chooseCategory(value: Category) {
    setCategory(value);
    setOffering("");
    setDetails({});
    setForm((current) => ({
      ...current,
      title: "",
    }));
  }

  function handleLocationConfirm(
    location: SelectedLocation
  ) {
    setSelectedLocation(location);

    setForm((current) => ({
      ...current,
      location: location.address,
    }));

    setLocationPickerOpen(false);
  }

  function renderCategoryDetails() {
    if (!category || !offering) return null;

    if (category === "stay") {
      return (
        <>
          <Field
            label="Monthly rent"
            value={details.rent || ""}
            onChange={(v) => updateDetail("rent", v)}
            placeholder="e.g. ₹8,500"
          />

          <Field
            label="Security deposit"
            value={details.deposit || ""}
            onChange={(v) => updateDetail("deposit", v)}
            placeholder="e.g. ₹10,000"
          />

          <Field
            label="Furnishing"
            value={details.furnishing || ""}
            onChange={(v) => updateDetail("furnishing", v)}
            placeholder="Fully furnished / Semi / Unfurnished"
          />

          <Field
            label="Food included?"
            value={details.foodIncluded || ""}
            onChange={(v) =>
              updateDetail("foodIncluded", v)
            }
            placeholder="Yes / No"
          />

          <Field
            label="Preferred tenant"
            value={details.tenantPreference || ""}
            onChange={(v) =>
              updateDetail("tenantPreference", v)
            }
            placeholder="Students / Working / Anyone"
          />

          <Field
            label="Amenities"
            value={details.amenities || ""}
            onChange={(v) =>
              updateDetail("amenities", v)
            }
            placeholder="WiFi, AC, Washing machine..."
            full
          />
        </>
      );
    }

    if (category === "eat") {
      return (
        <>
          <Field
            label="Cuisine / food type"
            value={details.cuisine || ""}
            onChange={(v) => updateDetail("cuisine", v)}
            placeholder="North Indian, South Indian..."
          />

          <Field
            label="Veg / non-veg"
            value={details.foodType || ""}
            onChange={(v) => updateDetail("foodType", v)}
            placeholder="Veg / Non-veg / Both"
          />

          <Field
            label="Price per meal"
            value={details.pricePerMeal || ""}
            onChange={(v) =>
              updateDetail("pricePerMeal", v)
            }
            placeholder="e.g. ₹80"
          />

          <Field
            label="Delivery available?"
            value={details.delivery || ""}
            onChange={(v) => updateDetail("delivery", v)}
            placeholder="Yes / No"
          />

          <Field
            label="Meal timing"
            value={details.mealTiming || ""}
            onChange={(v) =>
              updateDetail("mealTiming", v)
            }
            placeholder="Breakfast / Lunch / Dinner"
          />

          <Field
            label="Delivery area"
            value={details.deliveryArea || ""}
            onChange={(v) =>
              updateDetail("deliveryArea", v)
            }
            placeholder="e.g. 5 km radius"
            full
          />
        </>
      );
    }

    if (category === "live") {
      return (
        <>
          <Field
            label="Service type"
            value={details.serviceType || ""}
            onChange={(v) =>
              updateDetail("serviceType", v)
            }
            placeholder="Weekly laundry / Deep cleaning..."
          />

          <Field
            label="Starting price"
            value={details.startingPrice || ""}
            onChange={(v) =>
              updateDetail("startingPrice", v)
            }
            placeholder="e.g. ₹299"
          />

          <Field
            label="Service area"
            value={details.serviceArea || ""}
            onChange={(v) =>
              updateDetail("serviceArea", v)
            }
            placeholder="e.g. Indirapuram + 5 km"
          />

          <Field
            label="Home visit?"
            value={details.homeVisit || ""}
            onChange={(v) =>
              updateDetail("homeVisit", v)
            }
            placeholder="Yes / No"
          />

          <Field
            label="Availability"
            value={details.availability || ""}
            onChange={(v) =>
              updateDetail("availability", v)
            }
            placeholder="Mon-Sat, 9 AM-7 PM"
          />

          <Field
            label="What's included?"
            value={details.included || ""}
            onChange={(v) =>
              updateDetail("included", v)
            }
            placeholder="Ironing, pickup, delivery..."
            full
          />
        </>
      );
    }

    if (category === "move") {
      return (
        <>
          <Field
            label="Move type"
            value={details.moveType || ""}
            onChange={(v) =>
              updateDetail("moveType", v)
            }
            placeholder="Local / Intercity"
          />

          <Field
            label="Starting price"
            value={details.startingPrice || ""}
            onChange={(v) =>
              updateDetail("startingPrice", v)
            }
            placeholder="e.g. ₹1,499"
          />

          <Field
            label="Vehicle type"
            value={details.vehicle || ""}
            onChange={(v) =>
              updateDetail("vehicle", v)
            }
            placeholder="Mini truck / Tempo / Truck"
          />

          <Field
            label="Service area"
            value={details.serviceArea || ""}
            onChange={(v) =>
              updateDetail("serviceArea", v)
            }
            placeholder="Ghaziabad / Delhi NCR"
          />

          <Field
            label="Packing available?"
            value={details.packing || ""}
            onChange={(v) =>
              updateDetail("packing", v)
            }
            placeholder="Yes / No"
          />

          <Field
            label="Storage available?"
            value={details.storage || ""}
            onChange={(v) =>
              updateDetail("storage", v)
            }
            placeholder="Yes / No"
          />
        </>
      );
    }

    return (
      <>
        <Field
          label="Vehicle / parking type"
          value={details.vehicleType || ""}
          onChange={(v) =>
            updateDetail("vehicleType", v)
          }
          placeholder="Bike / Car / Covered Parking"
        />

        <Field
          label="Price"
          value={details.rentalPrice || ""}
          onChange={(v) =>
            updateDetail("rentalPrice", v)
          }
          placeholder="e.g. ₹200/day"
        />

        <Field
          label="Availability"
          value={details.availability || ""}
          onChange={(v) =>
            updateDetail("availability", v)
          }
          placeholder="Available daily"
        />

        <Field
          label="Security deposit"
          value={details.deposit || ""}
          onChange={(v) =>
            updateDetail("deposit", v)
          }
          placeholder="e.g. ₹2,000"
        />

        <Field
          label="Pickup / return location"
          value={details.pickup || ""}
          onChange={(v) =>
            updateDetail("pickup", v)
          }
          placeholder="Where customers collect it"
        />

        <Field
          label="Requirements"
          value={details.requirements || ""}
          onChange={(v) =>
            updateDetail("requirements", v)
          }
          placeholder="Driving licence / ID / Deposit..."
          full
        />
      </>
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (!category) {
      setError("Please choose a MetroVybe category.");
      return;
    }

    if (!offering) {
      setError("Please choose what you are offering.");
      return;
    }

    if (!selectedLocation) {
      setError(
        "Please select your business location on the map."
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: form.title.trim() || offering,
        category,
        description: form.description.trim(),
        location: form.location.trim(),
        price: form.price.trim(),
        image: form.image.trim(),

        images: form.images
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        tags: form.tags
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,

        serviceDetails: {
          offering,
          ...details,
        },
      };

      const response = await fetch(
        `${API_URL}/api/listings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit listing"
        );
      }

      setMessage(
        "Your listing has been submitted for MetroVybe review."
      );

      setForm({
        title: "",
        description: "",
        location: "",
        price: "",
        image: "",
        images: "",
        tags: "",
      });

      setCategory("");
      setOffering("");
      setDetails({});
      setSelectedLocation(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit listing"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingBusiness) {
    return (
      <main className="listing-page">
        <div className="loading">
          <div className="spinner" />
          <p>Loading your business profile...</p>
        </div>
      </main>
    );
  }

  const verified =
    business?.verificationStatus === "verified";

  return (
    <main className="listing-page">
      <div className="listing-container">
        <Link
          href="/business/dashboard"
          className="back-link"
        >
          ← Business Dashboard
        </Link>

        <header className="page-header">
          <span>BUSINESS CENTER</span>
          <h1>Create a listing</h1>
          <p>
            Help nearby customers discover what your business
            offers.
          </p>
        </header>

        {business && (
          <div className="business-card">
            <div className="business-avatar">
              {business.businessName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="business-details">
              <small>BUSINESS</small>
              <strong>{business.businessName}</strong>
            </div>

            <div
              className={
                verified
                  ? "verification verified"
                  : "verification pending"
              }
            >
              {verified ? "✓ Verified" : "Pending"}
            </div>
          </div>
        )}

        {!verified ? (
          <section className="verification-card">
            <div className="verification-icon">!</div>
            <div>
              <h2>Verification required</h2>
              <p>
                Your business must be verified before you can
                create a listing.
              </p>
              <Link
                href="/business/dashboard"
                className="dashboard-button"
              >
                Go to Dashboard
              </Link>
            </div>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="listing-form"
          >
            <section className="form-section">
              <div className="section-title">
                <b>01</b>
                <div>
                  <h2>What are you listing?</h2>
                  <p>
                    Start by choosing the MetroVybe
                    category.
                  </p>
                </div>
              </div>

              <label className="category-label">
                MetroVybe category <i>*</i>
              </label>

              <div className="category-grid">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      category === item.id
                        ? "category-card active"
                        : "category-card"
                    }
                    onClick={() =>
                      chooseCategory(item.id)
                    }
                  >
                    <span className="category-icon">
                      {item.icon}
                    </span>
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                  </button>
                ))}
              </div>

              {category && (
                <div className="offering-wrap">
                  <label>
                    What are you offering? <i>*</i>
                  </label>

                  <div className="offering-grid">
                    {OFFERINGS[category].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          offering === item
                            ? "offering active"
                            : "offering"
                        }
                        onClick={() =>
                          setOffering(item)
                        }
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {category && offering && (
              <section className="form-section">
                <div className="section-title">
                  <b>02</b>
                  <div>
                    <h2>
                      {category === "stay" &&
                        "Stay details"}
                      {category === "eat" &&
                        "Food details"}
                      {category === "live" &&
                        "Service details"}
                      {category === "move" &&
                        "Moving details"}
                      {category === "go" &&
                        "Rental details"}
                    </h2>
                    <p>
                      Add information customers need before
                      choosing your service.
                    </p>
                  </div>
                </div>

                <div className="grid">
                  {renderCategoryDetails()}
                </div>
              </section>
            )}

            {category && offering && (
              <section className="form-section">
                <div className="section-title">
                  <b>03</b>
                  <div>
                    <h2>Listing information</h2>
                    <p>
                      Add the public details customers will
                      see.
                    </p>
                  </div>
                </div>

                <div className="grid">
                  <Field
                    label="Listing title"
                    value={form.title}
                    onChange={(v) =>
                      updateField("title", v)
                    }
                    placeholder={`e.g. ${offering} near Indirapuram`}
                    full
                  />

                  <div className="field full">
                    <label>
                      Description <i>*</i>
                    </label>

                    <textarea
                      required
                      value={form.description}
                      onChange={(e) =>
                        updateField(
                          "description",
                          e.target.value
                        )
                      }
                      placeholder={`Describe your ${offering.toLowerCase()}...`}
                      rows={5}
                    />
                  </div>

                  <Field
                    label="Starting price"
                    value={form.price}
                    onChange={(v) =>
                      updateField("price", v)
                    }
                    placeholder="e.g. ₹499"
                  />

                  <Field
                    label="Tags"
                    value={form.tags}
                    onChange={(v) =>
                      updateField("tags", v)
                    }
                    placeholder="student-friendly, nearby, verified"
                  />
                </div>
              </section>
            )}

            {category && offering && (
              <section className="form-section">
                <div className="section-title">
                  <b>04</b>
                  <div>
                    <h2>Business location</h2>
                    <p>
                      Search your address and fine-tune the
                      exact pin.
                    </p>
                  </div>
                </div>

                {!selectedLocation ? (
                  <button
                    type="button"
                    className="location-button"
                    onClick={() =>
                      setLocationPickerOpen(true)
                    }
                  >
                    <span className="location-pin">
                      ⌖
                    </span>

                    <span>
                      <strong>
                        Select location on map
                      </strong>
                      <small>
                        Search an address or move the pin
                        to your exact location
                      </small>
                    </span>

                    <b>→</b>
                  </button>
                ) : (
                  <div className="selected-location">
                    <div className="selected-location-icon">
                      ✓
                    </div>

                    <div className="selected-location-info">
                      <small>
                        BUSINESS LOCATION
                      </small>

                      <strong>
                        {selectedLocation.address}
                      </strong>

                      <span>
                        {selectedLocation.latitude.toFixed(
                          6
                        )}
                        ,{" "}
                        {selectedLocation.longitude.toFixed(
                          6
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setLocationPickerOpen(true)
                      }
                    >
                      Change
                    </button>
                  </div>
                )}
              </section>
            )}

            {category && offering && (
              <section className="form-section">
                <div className="section-title">
                  <b>05</b>
                  <div>
                    <h2>Photos</h2>
                    <p>
                      Add photos that help customers trust
                      your listing.
                    </p>
                  </div>
                </div>

                <div className="grid">
                  <Field
                    label="Main image URL"
                    value={form.image}
                    onChange={(v) =>
                      updateField("image", v)
                    }
                    placeholder="https://..."
                    full
                  />

                  <Field
                    label="Additional image URLs"
                    value={form.images}
                    onChange={(v) =>
                      updateField("images", v)
                    }
                    placeholder="https://..., https://..."
                    full
                  />
                </div>
              </section>
            )}

            {error && (
              <div className="alert error">
                <b>!</b>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="alert success">
                <b>✓</b>
                <span>{message}</span>
              </div>
            )}

            {category && offering && (
              <div className="submit-box">
                <div>
                  <strong>
                    Ready to submit your listing?
                  </strong>
                  <p>
                    MetroVybe will review it before it
                    appears publicly.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit for Review"}
                  {!submitting && <span>→</span>}
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {locationPickerOpen && (
        <div className="location-overlay">
          <div className="location-modal">
            <div className="location-modal-header">
              <div>
                <strong>
                  Select business location
                </strong>
                <span>
                  Search your address or move the pin
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setLocationPickerOpen(false)
                }
              >
                ×
              </button>
            </div>

            <div className="picker-map">
              <LocationPicker
                initialLocation={
                  selectedLocation
                    ? {
                        latitude:
                          selectedLocation.latitude,
                        longitude:
                          selectedLocation.longitude,
                      }
                    : undefined
                }
                onConfirm={handleLocationConfirm}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .listing-page {
          min-height: 100vh;
          background: #f5f7f6;
          padding: 28px 16px 110px;
          color: #151918;
        }

        .listing-container {
          max-width: 900px;
          margin: auto;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 32px;
          color: #202523;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
        }

        .page-header span {
          color: #176b55;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .page-header h1 {
          margin: 8px 0;
          font-size: clamp(36px, 6vw, 58px);
          line-height: 1;
          letter-spacing: -2.5px;
        }

        .page-header p {
          margin: 0 0 28px;
          color: #747d79;
          font-size: 17px;
          line-height: 1.5;
        }

        .business-card,
        .form-section,
        .verification-card {
          background: white;
          border: 1px solid #dfe7e3;
          border-radius: 24px;
          box-shadow: 0 8px 30px rgba(20, 45, 36, 0.035);
        }

        .business-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          margin-bottom: 20px;
        }

        .business-avatar {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: #176b55;
          color: white;
          font-size: 20px;
          font-weight: 900;
        }

        .business-details {
          flex: 1;
          display: grid;
          gap: 3px;
        }

        .business-details small {
          color: #9aa29f;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .business-details strong {
          font-size: 15px;
        }

        .verification {
          padding: 9px 13px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
        }

        .verification.verified {
          color: #176b55;
          background: #e5f5ef;
        }

        .verification.pending {
          color: #946516;
          background: #fff3d5;
        }

        .listing-form {
          display: grid;
          gap: 16px;
        }

        .form-section {
          padding: 26px;
        }

        .section-title {
          display: flex;
          gap: 13px;
          margin-bottom: 25px;
        }

        .section-title > b {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 13px;
          background: #e9f5f1;
          color: #176b55;
          font-size: 11px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 21px;
          letter-spacing: -0.4px;
        }

        .section-title p {
          margin: 5px 0 0;
          color: #7d8682;
          font-size: 13px;
          line-height: 1.4;
        }

        .category-label,
        .offering-wrap > label {
          display: block;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 850;
        }

        .category-label i,
        .offering-wrap i,
        .field label i {
          color: #d33d3d;
          font-style: normal;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .category-card {
          min-height: 175px;
          padding: 17px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          text-align: left;
          border: 1.5px solid #dce4e1;
          border-radius: 20px;
          background: #fff;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .category-card:hover {
          transform: translateY(-2px);
        }

        .category-card.active {
          border-color: #176b55;
          background: #edf8f4;
          box-shadow: 0 5px 18px rgba(23, 107, 85, 0.09);
        }

        .category-icon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: #edf2ef;
          font-size: 25px;
          margin-bottom: 20px;
        }

        .category-card.active .category-icon {
          background: #176b55;
        }

        .category-card strong {
          font-size: 15px;
          margin-bottom: 5px;
        }

        .category-card small {
          color: #7b8581;
          font-size: 11px;
          line-height: 1.35;
        }

        .offering-wrap {
          margin-top: 25px;
        }

        .offering-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .offering {
          border: 1px solid #d9e2de;
          background: white;
          border-radius: 999px;
          padding: 11px 15px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .offering.active {
          color: white;
          border-color: #176b55;
          background: #176b55;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 17px;
        }

        .field {
          display: grid;
          gap: 7px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          font-size: 13px;
          font-weight: 800;
        }

        .field input,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d8e1dd;
          border-radius: 13px;
          padding: 13px;
          font: inherit;
          font-size: 14px;
          outline: none;
          background: #fff;
        }

        .field input {
          height: 48px;
        }

        .field textarea {
          resize: vertical;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #176b55;
          box-shadow: 0 0 0 3px rgba(23, 107, 85, 0.09);
        }

        .location-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          border: 1px solid #cfe1da;
          border-radius: 17px;
          background: #f3faf7;
          text-align: left;
          cursor: pointer;
        }

        .location-pin {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #176b55;
          color: white;
          font-size: 22px;
        }

        .location-button span:nth-child(2) {
          flex: 1;
          display: grid;
          gap: 4px;
        }

        .location-button strong {
          font-size: 14px;
        }

        .location-button small {
          color: #77827d;
          font-size: 11px;
        }

        .location-button > b {
          color: #176b55;
          font-size: 20px;
        }

        .selected-location {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border: 1px solid #c8e2d8;
          border-radius: 17px;
          background: #f2faf7;
        }

        .selected-location-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #176b55;
          color: white;
          font-weight: 900;
        }

        .selected-location-info {
          flex: 1;
          min-width: 0;
          display: grid;
          gap: 3px;
        }

        .selected-location-info small {
          color: #176b55;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .selected-location-info strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
        }

        .selected-location-info span {
          color: #7b8581;
          font-size: 10px;
        }

        .selected-location button {
          border: 0;
          background: white;
          color: #176b55;
          font-weight: 800;
          padding: 9px 12px;
          border-radius: 9px;
          cursor: pointer;
        }

        .alert {
          display: flex;
          gap: 10px;
          padding: 14px;
          border-radius: 14px;
          font-size: 13px;
        }

        .alert b {
          width: 23px;
          height: 23px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: white;
          flex-shrink: 0;
        }

        .alert.error {
          background: #fff0f0;
          color: #8e2525;
        }

        .alert.error b {
          background: #c83c3c;
        }

        .alert.success {
          background: #eaf7f2;
          color: #176b55;
        }

        .alert.success b {
          background: #176b55;
        }

        .submit-box {
          position: sticky;
          bottom: 12px;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 20px;
          border-radius: 22px;
          background: #151918;
          color: white;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.18);
        }

        .submit-box strong {
          font-size: 15px;
        }

        .submit-box p {
          margin: 4px 0 0;
          color: #aab3af;
          font-size: 12px;
        }

        .submit-box button {
          border: 0;
          border-radius: 14px;
          padding: 15px 21px;
          background: #188366;
          color: white;
          font: inherit;
          font-weight: 850;
          cursor: pointer;
          white-space: nowrap;
        }

        .submit-box button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .verification-card {
          display: flex;
          gap: 15px;
          padding: 25px;
        }

        .verification-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #fff3d5;
          color: #946516;
          font-weight: 900;
        }

        .verification-card h2 {
          margin: 0 0 6px;
        }

        .verification-card p {
          color: #727b77;
          line-height: 1.5;
        }

        .dashboard-button {
          display: inline-block;
          margin-top: 5px;
          padding: 11px 15px;
          border-radius: 10px;
          background: #151918;
          color: white;
          text-decoration: none;
          font-weight: 800;
          font-size: 13px;
        }

        .loading {
          min-height: 70vh;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 10px;
          color: #707975;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #dce8e3;
          border-top-color: #176b55;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .location-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(10, 20, 17, 0.55);
          backdrop-filter: blur(8px);
        }

        .location-modal {
          width: min(900px, 100%);
          height: min(760px, 92vh);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 24px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
        }

        .location-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          border-bottom: 1px solid #e7ecea;
        }

        .location-modal-header div {
          display: grid;
          gap: 3px;
        }

        .location-modal-header strong {
          font-size: 15px;
        }

        .location-modal-header span {
          color: #78817d;
          font-size: 11px;
        }

        .location-modal-header button {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: #f1f4f3;
          font-size: 25px;
          cursor: pointer;
        }

        .picker-map {
          flex: 1;
          min-height: 0;
        }

        .picker-map :global(.leaflet-container) {
          width: 100%;
          height: 100%;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .listing-page {
            padding: 20px 12px 100px;
          }

          .page-header h1 {
            font-size: 39px;
          }

          .page-header p {
            font-size: 15px;
          }

          .business-card,
          .form-section,
          .verification-card {
            border-radius: 19px;
          }

          .form-section {
            padding: 19px;
          }

          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .category-card {
            min-height: 145px;
          }

          .category-card:last-child {
            grid-column: span 2;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .submit-box {
            padding: 15px;
          }

          .submit-box p {
            display: none;
          }

          .submit-box button {
            padding: 14px 16px;
          }

          .location-overlay {
            padding: 0;
          }

          .location-modal {
            width: 100%;
            height: 100%;
            max-height: none;
            border-radius: 0;
          }
        }
      `}</style>
    </main>
  );
}
