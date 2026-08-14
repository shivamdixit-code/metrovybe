"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type Business = {
  businessName: string;
  verificationStatus?: string;
};

export default function NewBusinessListing() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    price: "",
    image: "",
    images: "",
    tags: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    async function loadBusiness() {
      try {
        const token = getToken();

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const response = await fetch(`${API_URL}/api/business/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load business profile");
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim(),
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
        latitude: form.latitude.trim()
          ? Number(form.latitude)
          : null,
        longitude: form.longitude.trim()
          ? Number(form.longitude)
          : null,
      };

      const response = await fetch(`${API_URL}/api/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

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
        category: "",
        description: "",
        location: "",
        price: "",
        image: "",
        images: "",
        tags: "",
        latitude: "",
        longitude: "",
      });
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
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f8fa",
        }}
      >
        <p>Loading business profile...</p>
      </main>
    );
  }

  const verified =
    business?.verificationStatus === "verified";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f8fa",
        padding: "30px 16px 60px",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 25 }}>
          <Link
            href="/business/dashboard"
            style={{
              color: "#111",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Back to Business Dashboard
          </Link>

          <h1
            style={{
              margin: "18px 0 6px",
              fontSize: 38,
            }}
          >
            Add Listing
          </h1>

          <p style={{ margin: 0, color: "#666" }}>
            Add a service or place to your MetroVybe business.
          </p>
        </div>

        {business && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              border: "1px solid #e8e8e8",
            }}
          >
            <strong>{business.businessName}</strong>

            <div
              style={{
                marginTop: 8,
                color: verified ? "#176B55" : "#92400e",
                fontWeight: 700,
              }}
            >
              Verification:{" "}
              {business.verificationStatus || "pending"}
            </div>
          </div>
        )}

        {!verified ? (
          <section
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 30,
              border: "1px solid #eadfb8",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Verification required
            </h2>

            <p style={{ color: "#666", lineHeight: 1.6 }}>
              Your business must be verified by MetroVybe before
              you can create a listing.
            </p>

            <Link
              href="/business/dashboard"
              style={{
                display: "inline-block",
                marginTop: 10,
                background: "#111",
                color: "#fff",
                padding: "11px 18px",
                borderRadius: 9,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Back to Dashboard
            </Link>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 25,
              border: "1px solid #e8e8e8",
              display: "grid",
              gap: 18,
            }}
          >
            <Field
              label="Listing title"
              required
              value={form.title}
              onChange={(value) =>
                updateField("title", value)
              }
              placeholder="e.g. Premium Student PG"
            />

            <Field
              label="Category"
              required
              value={form.category}
              onChange={(value) =>
                updateField("category", value)
              }
              placeholder="e.g. PG, Tiffin, Laundry"
            />

            <Field
              label="Description"
              required
              textarea
              value={form.description}
              onChange={(value) =>
                updateField("description", value)
              }
              placeholder="Describe your service..."
            />

            <Field
              label="Location"
              required
              value={form.location}
              onChange={(value) =>
                updateField("location", value)
              }
              placeholder="e.g. Indirapuram, Ghaziabad"
            />

            <Field
              label="Price"
              value={form.price}
              onChange={(value) =>
                updateField("price", value)
              }
              placeholder="e.g. ₹8,500/month"
            />

            <Field
              label="Main image URL"
              value={form.image}
              onChange={(value) =>
                updateField("image", value)
              }
              placeholder="https://..."
            />

            <Field
              label="Additional image URLs"
              value={form.images}
              onChange={(value) =>
                updateField("images", value)
              }
              placeholder="https://..., https://..."
            />

            <Field
              label="Tags"
              value={form.tags}
              onChange={(value) =>
                updateField("tags", value)
              }
              placeholder="wifi, furnished, student-friendly"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 15,
              }}
            >
              <Field
                label="Latitude"
                value={form.latitude}
                onChange={(value) =>
                  updateField("latitude", value)
                }
                placeholder="28.6415"
              />

              <Field
                label="Longitude"
                value={form.longitude}
                onChange={(value) =>
                  updateField("longitude", value)
                }
                placeholder="77.3710"
              />
            </div>

            {error && (
              <div
                style={{
                  padding: 13,
                  borderRadius: 10,
                  background: "#fee2e2",
                  color: "#991b1b",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  padding: 13,
                  borderRadius: 10,
                  background: "#DDF5EE",
                  color: "#176B55",
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                border: 0,
                borderRadius: 10,
                padding: "14px 20px",
                background: "#111",
                color: "#fff",
                fontSize: 16,
                fontWeight: 800,
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
                opacity: submitting ? 0.65 : 1,
              }}
            >
              {submitting
                ? "Submitting..."
                : "Submit for Review"}
            </button>

            <p
              style={{
                margin: 0,
                color: "#777",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Business listings are reviewed by MetroVybe
              before they appear publicly. You cannot mark a
              listing as featured yourself.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const sharedStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "12px 13px",
    borderRadius: 9,
    border: "1px solid #d9d9d9",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    background: "#fff",
  };

  return (
    <label
      style={{
        display: "grid",
        gap: 7,
        fontWeight: 700,
      }}
    >
      <span>
        {label}
        {required && (
          <span style={{ color: "#c00" }}> *</span>
        )}
      </span>

      {textarea ? (
        <textarea
          required={required}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          rows={5}
          style={{
            ...sharedStyle,
            resize: "vertical",
          }}
        />
      ) : (
        <input
          required={required}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          style={sharedStyle}
        />
      )}
    </label>
  );
}
