"use client";

import { useState } from "react";
import { Building2, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AccountType = "customer" | "business" | "";

const CATEGORIES = [
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

export default function SignupPage() {
  const router = useRouter();

  const [accountType, setAccountType] =
    useState<AccountType>("");

  const [businessCategory, setBusinessCategory] =
    useState("");

  function selectAccountType(type: "customer" | "business") {
    setAccountType(type);
    setBusinessCategory("");
  }

  function goBack() {
    setAccountType("");
    setBusinessCategory("");
  }

  return (
    <main className="public-login-page">
      <div className="public-login-card">
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#111",
            display: "block",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 850,
              letterSpacing: "-1.2px",
              lineHeight: 1,
            }}
          >
            metro
            <span style={{ color: "#29AB87" }}>
              vybe
            </span>
            <span
              style={{
                fontSize: "11px",
                position: "relative",
                top: "-10px",
                color: "#D9AA32",
                marginLeft: "3px",
              }}
            >
              ✦
            </span>
          </div>

          <div
            style={{
              fontSize: "9px",
              letterSpacing: "1.7px",
              color: "#8A9097",
              marginTop: "6px",
              fontWeight: 700,
            }}
          >
            YOUR CITY. YOUR VYBE.
          </div>
        </Link>

        {!accountType ? (
          <>
            <h1
              style={{
                fontSize: "28px",
                lineHeight: 1.1,
                letterSpacing: "-0.7px",
                margin: "0 0 7px",
                color: "#111318",
              }}
            >
              How will you sign up?
            </h1>

            <p
              style={{
                color: "#747A82",
                fontSize: "14px",
                margin: "0 0 22px",
              }}
            >
              Select your MetroVybe account type.
            </p>

            <div
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => router.push("/signup/customer")}
                style={accountButtonStyle}
              >
                <span
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#EAF8F3",
                    color: "#29AB87",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <UserRound size={19} strokeWidth={2} color="#29AB87" />
                </span>

                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  <span style={accountTitleStyle}>
                    Customer
                  </span>

                  <span style={accountDescriptionStyle}>
                    Find places, services & local experiences
                  </span>
                </span>

                <span style={arrowStyle}>›</span>
              </button>

              <button
                type="button"
                onClick={() => selectAccountType("business")}
                style={accountButtonStyle}
              >
                <span
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#FFF7DF",
                    color: "#D9AA32",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={19} strokeWidth={2} color="#D9AA32" />
                </span>

                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  <span style={accountTitleStyle}>
                    Business
                  </span>

                  <span style={accountDescriptionStyle}>
                    Manage your business and listings
                  </span>
                </span>

                <span style={arrowStyle}>›</span>
              </button>
            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: "24px",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                style={{
                  color: "#111",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Log in
              </Link>
            </div>
          </>
        ) : accountType === "business" && !businessCategory ? (
          <>
            <div
              style={{
                marginBottom: "19px",
              }}
            >
              <button
                type="button"
                onClick={goBack}
                style={{
                  width: "auto",
                  height: "34px",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#2563EB",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <img
                  src="/icons/back-arrow.png"
                  alt=""
                  width={20}
                  height={20}
                  style={{
                    display: "block",
                    width: "20px",
                    height: "20px",
                    objectFit: "contain",
                    transform: "translateY(-2px)",
                    flexShrink: 0,
                    filter:
                      "brightness(0) saturate(100%) invert(36%) sepia(45%) saturate(1050%) hue-rotate(183deg) brightness(88%)",
                  }}
                />
                <span>Change Account Type</span>
              </button>
            </div>

            <h2
              style={{
                fontSize: "24px",
                lineHeight: 1.15,
                fontWeight: 850,
                letterSpacing: "-0.5px",
                color: "#111318",
                margin: "0 0 6px",
              }}
            >
              What type of business do you have?
            </h2>

            <p
              style={{
                color: "#747A82",
                fontSize: "14px",
                margin: "0 0 22px",
              }}
            >
              Select a category to get started.
            </p>

            <div
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setBusinessCategory(category.id)
                  }
                  style={accountButtonStyle}
                >
                  <span style={accountIconStyle}>
                    {category.icon}
                  </span>

                  <span
                    style={{
                      flex: 1,
                      textAlign: "left",
                    }}
                  >
                    <span style={accountTitleStyle}>
                      {category.name}
                    </span>

                    <span style={accountDescriptionStyle}>
                      {category.description}
                    </span>
                  </span>

                  <span style={arrowStyle}>›</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: "19px" }}>
              <button
                type="button"
                onClick={() =>
                  setBusinessCategory("")
                }
                style={{
                  width: "auto",
                  height: "34px",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#2563EB",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <img
                  src="/icons/back-arrow.png"
                  alt=""
                  width={20}
                  height={20}
                  style={{
                    display: "block",
                    width: "20px",
                    height: "20px",
                    objectFit: "contain",
                    transform: "translateY(-2px)",
                    flexShrink: 0,
                    filter:
                      "brightness(0) saturate(100%) invert(36%) sepia(45%) saturate(1050%) hue-rotate(183deg) brightness(88%)",
                  }}
                />
                <span>Change Category</span>
              </button>
            </div>

            <h2
              style={{
                fontSize: "24px",
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "#111318",
                margin: "0 0 6px",
              }}
            >
              Create your business account
            </h2>

            <p
              style={{
                color: "#747A82",
                fontSize: "14px",
                margin: "0 0 22px",
              }}
            >
              Your category will be used to set up your business listing.
            </p>

            <div
              style={{
                padding: "14px",
                border: "1px solid #E1E5EA",
                borderRadius: "11px",
                marginBottom: "16px",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Category:{" "}
              {CATEGORIES.find(
                (item) => item.id === businessCategory
              )?.name}
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/signup/business?category=${businessCategory}`
                )
              }
              style={{
                width: "100%",
                height: "46px",
                border: "none",
                borderRadius: "11px",
                background: "#111",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </>
        )}
      </div>
    </main>
  );
}

const accountButtonStyle = {
  width: "100%",
  minHeight: "70px",
  padding: "13px 14px",
  border: "1px solid #E1E5EA",
  borderRadius: "12px",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  boxSizing: "border-box" as const,
  textAlign: "left" as const,
};

const accountIconStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  background: "#F3F8F6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2563EB",
  flexShrink: 0,
};

const accountTitleStyle = {
  display: "block",
  color: "#111318",
  fontSize: "14px",
  fontWeight: 800,
  marginBottom: "2px",
};

const accountDescriptionStyle = {
  display: "block",
  color: "#8A9097",
  fontSize: "11px",
  lineHeight: 1.35,
};

const arrowStyle = {
  color: "#B3B9C1",
  fontSize: "20px",
  flexShrink: 0,
};
