"use client";

import Link from "next/link";

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const ListingLocationPicker = dynamic(
  () => import("@/components/ListingLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "420px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F7F8F7",
          color: "#747A82",
          fontSize: "11px",
        }}
      >
        Loading location map...
      </div>
    ),
  }
);

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const PHONE_COUNTRIES = {
  IN: { code: "+91", label: "🇮🇳 +91", placeholder: "9876543210" },
  GB: { code: "+44", label: "🇬🇧 +44", placeholder: "7911123456" },
  US: { code: "+1", label: "🇺🇸 +1", placeholder: "2015550123" },
  CA: { code: "+1", label: "🇨🇦 +1", placeholder: "4165550123" },
  AU: { code: "+61", label: "🇦🇺 +61", placeholder: "412345678" },
  NZ: { code: "+64", label: "🇳🇿 +64", placeholder: "211234567" },
  SG: { code: "+65", label: "🇸🇬 +65", placeholder: "81234567" },
  MY: { code: "+60", label: "🇲🇾 +60", placeholder: "123456789" },
  AE: { code: "+971", label: "🇦🇪 +971", placeholder: "501234567" },
} as const;

type PhoneCountry = keyof typeof PHONE_COUNTRIES;
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const COUNTRY_NAMES: Record<PhoneCountry, string> = {
  IN: "India",
  GB: "United Kingdom",
  US: "United States",
  CA: "Canada",
  AU: "Australia",
  NZ: "New Zealand",
  SG: "Singapore",
  MY: "Malaysia",
  AE: "United Arab Emirates",
};

const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
];

const CATEGORY_DOCUMENTS: Record<string, string[]> = {
  pg: ["Business registration / ownership proof", "Address proof"],
  tiffin: ["Business registration / food-related licence", "Address proof"],
  laundry: ["Business registration / ownership proof", "Address proof"],
  movers: ["Business registration / transport-related proof", "Address proof"],
  travel: ["Business registration / travel-related licence", "Address proof"],
};

function getInternationalPhone(country: PhoneCountry, phone: string) {
  const codes: Record<PhoneCountry, string> = {
    IN: "91",
    GB: "44",
    US: "1",
    CA: "1",
    AU: "61",
    NZ: "64",
    SG: "65",
    MY: "60",
    AE: "971",
  };

  return `+${codes[country]}${phone.replace(/\D/g, "")}`;
}

function BusinessSignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "";

  const [step, setStep] = useState<Step>(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<PhoneCountry>("IN");

  const [otp, setOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  useEffect(() => {
    const updateViewport = () => {
      const vv = window.visualViewport;
      if (!vv) return;

      document.documentElement.style.setProperty(
        "--mv-business-visible-height",
        `${vv.height}px`
      );
      document.documentElement.style.setProperty(
        "--mv-business-visible-top",
        `${vv.offsetTop}px`
      );

    };

    updateViewport();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateViewport);
    vv?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);

    return () => {
      vv?.removeEventListener("resize", updateViewport);
      vv?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResendSeconds, setOtpResendSeconds] = useState(0);

  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState(category);

  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [indiaDistricts, setIndiaDistricts] = useState<string[]>([]);
  const [indiaPins, setIndiaPins] = useState<{ name: string; pincode: string }[]>([]);

  useEffect(() => {
    if (country !== "IN" || !state) {
      setIndiaDistricts([]);
      setIndiaPins([]);
      return;
    }

    fetch(`/api/india-location?state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then((data) => setIndiaDistricts(data.districts || []))
      .catch(() => setIndiaDistricts([]));
  }, [country, state]);

  useEffect(() => {
    if (country !== "IN" || !state || !city) {
      setIndiaPins([]);
      return;
    }

    fetch(
      `/api/india-location?state=${encodeURIComponent(state)}&district=${encodeURIComponent(city)}`
    )
      .then((r) => r.json())
      .then((data) => setIndiaPins(data.locations || []))
      .catch(() => setIndiaPins([]));
  }, [country, state, city]);

  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const listingLocationPickerRef = useRef<{
    confirmLocation: () => void;
  } | null>(null);

  const [documents, setDocuments] = useState<
    {
      name: string;
      file: File;
      fileUrl?: string;
      publicId?: string;
      documentType?: string;
      uploading?: boolean;
    }[]
  >([]);

  const [documentsUploading, setDocumentsUploading] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const businessSignupDraftKey = `metrovybe-business-signup-draft-${category || "default"}`;
  const businessSignupDraftRestored = useRef(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(businessSignupDraftKey);
      if (!saved) {
        businessSignupDraftRestored.current = true;
        return;
      }

      const draft = JSON.parse(saved);

      if (draft.step >= 1 && draft.step <= 9) setStep(draft.step);
      if (typeof draft.name === "string") setName(draft.name);
      if (typeof draft.email === "string") setEmail(draft.email);
      if (typeof draft.phone === "string") setPhone(draft.phone);
      if (draft.country && PHONE_COUNTRIES[draft.country as PhoneCountry]) {
        setCountry(draft.country);
      }

      if (typeof draft.businessName === "string") setBusinessName(draft.businessName);
      if (typeof draft.businessCategory === "string") setBusinessCategory(draft.businessCategory);

      if (typeof draft.address === "string") setAddress(draft.address);
      if (typeof draft.state === "string") setState(draft.state);
      if (typeof draft.city === "string") setCity(draft.city);
      if (typeof draft.postalCode === "string") setPostalCode(draft.postalCode);

      if (typeof draft.latitude === "number") setLatitude(draft.latitude);
      if (typeof draft.longitude === "number") setLongitude(draft.longitude);
      if (typeof draft.locationConfirmed === "boolean") {
        setLocationConfirmed(draft.locationConfirmed);
      }

      if (typeof draft.phoneVerified === "boolean") {
        setPhoneVerified(draft.phoneVerified);
      }

      businessSignupDraftRestored.current = true;
    } catch {
      businessSignupDraftRestored.current = true;
    }
  }, [businessSignupDraftKey]);

  useEffect(() => {
    if (!businessSignupDraftRestored.current) return;

    try {
      sessionStorage.setItem(
        businessSignupDraftKey,
        JSON.stringify({
          step,
          name,
          email,
          phone,
          country,
          businessName,
          businessCategory,
          address,
          state,
          city,
          postalCode,
          latitude,
          longitude,
          locationConfirmed,
          phoneVerified,
        })
      );
    } catch {
      // Ignore storage errors and keep the signup form working normally.
    }
  }, [
    businessSignupDraftKey,
    step,
    name,
    email,
    phone,
    country,
    businessName,
    businessCategory,
    address,
    state,
    city,
    postalCode,
    latitude,
    longitude,
    locationConfirmed,
    phoneVerified,
  ]);

  const countryName = COUNTRY_NAMES[country];

  useEffect(() => {
    if (otpResendSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setOtpResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpResendSeconds]);

  useEffect(() => {
    if (!success && !error) return;

    const timer = window.setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [success, error]);

  function back() {
    setError("");
    setSuccess("");

    if (step === 1) {
      router.push("/signup");
      return;
    }

    if (step === 3) {
      setOtp("");
      setPhoneVerified(false);
    }

    setStep((step - 1) as Step);
  }

  function validateContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (cleanPhone.length < 7) {
      setError("Please enter a valid WhatsApp number.");
      return;
    }

    setName(cleanName);
    setEmail(cleanEmail);
    setPhone(cleanPhone);
    setPhoneVerified(false);
    setStep(2);
    sendOtp(getInternationalPhone(country, cleanPhone));
  }

  async function sendOtp(phoneNumber: string) {
    setOtpSending(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/send-signup-phone-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone: phoneNumber }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send WhatsApp verification code."
        );
      }

      setOtp("");
      setOtpResendSeconds(60);
      setSuccess("Verification code sent to your WhatsApp.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send OTP."
      );
    } finally {
      setOtpSending(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setOtpVerifying(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/verify-signup-phone-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: getInternationalPhone(country, phone),
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP.");
      }

      setPhoneVerified(true);
      setSuccess("WhatsApp number verified successfully!");

      window.setTimeout(() => {
        setSuccess("");
        setStep(3);
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Phone verification failed."
      );
    } finally {
      setOtpVerifying(false);
    }
  }

  function validateBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!businessName.trim()) {
      setError("Please enter your business name.");
      return;
    }

    if (!businessCategory.trim()) {
      setError("Please select your business category.");
      return;
    }

    setStep(4);
  }

  function validateLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!address.trim() || !state.trim() || !city.trim() || !postalCode.trim()) {
      setError("Please complete your business location.");
      return;
    }



    setStep(5);
  }

  async function uploadBusinessDocument(file: File) {
    const formData = new FormData();
    formData.append("document", file);

    const response = await fetch(`${API_URL}/api/upload/document`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.url) {
      throw new Error(data.message || "Document upload failed.");
    }

    return data;
  }

  function validateDocuments(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (documentsUploading) {
      setError("Please wait until all documents finish uploading.");
      return;
    }

    if (documents.length === 0) {
      setError("Please upload at least one business document.");
      return;
    }

    if (documents.some((document) => !document.fileUrl)) {
      setError("Please wait until all documents finish uploading.");
      return;
    }

    setStep(7);
  }

  function validatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStep(8);
  }

  async function createAccount() {
    setError("");

    if (!phoneVerified) {
      setError("Please verify your WhatsApp number first.");
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: getInternationalPhone(country, phone),
          password,
          role: "business",
          businessName,
          category: businessCategory,
          address,
          city,
          state,
          pincode: postalCode,
          businessLatitude: latitude,
          businessLongitude: longitude,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      const registrationToken = data.token;

      if (!registrationToken) {
        throw new Error(
          "Account was created, but authentication token was not returned."
        );
      }

      const uploadedDocuments = documents
        .filter((document) => document.fileUrl)
        .map((document) => ({
          documentType:
            document.documentType ||
            document.name
              .replace(/\.[^/.]+$/, "")
              .trim()
              .toLowerCase(),
          fileUrl: document.fileUrl,
          documentNumber: "",
        }));

      if (uploadedDocuments.length === 0) {
        throw new Error("Please upload at least one business document.");
      }

      const verificationResponse = await fetch(
        `${API_URL}/api/business/verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${registrationToken}`,
          },
          body: JSON.stringify({
            documents: uploadedDocuments,
          }),
        }
      );

      const verificationData = await verificationResponse.json();

      if (!verificationResponse.ok) {
        throw new Error(
          verificationData.message || "Business verification submission failed."
        );
      }

      setSuccess("Business account created successfully!");
      setStep(9);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedCategory = businessCategory
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const documentRequirements = (() => {
    if (selectedCategory === "Stay") {
      return [
        "Government ID",
        "Address/property proof",
        "Ownership proof or owner authorization/rent agreement",
        "Applicable business/registration proof",
      ];
    }

    if (selectedCategory === "Eat") {
      return [
        "Government ID",
        "FSSAI/food registration or license",
        "Business/registration proof",
        "Address proof",
      ];
    }

    if (selectedCategory === "Live") {
      return [
        "Government ID",
        "Business/registration proof",
        "Address proof",
        "Applicable local license",
      ];
    }

    if (selectedCategory === "Move") {
      return [
        "Government ID",
        "Business/registration proof",
        "Address proof",
        "Vehicle/transport documents if applicable",
      ];
    }

    if (selectedCategory === "Travel") {
      return [
        "Government ID",
        "Business/registration proof",
        "Address proof",
        "Applicable travel/tourism authorization or license",
      ];
    }

    return [
      "Government ID",
      "Business/registration proof",
      "Address proof",
    ];
  })();

  const stepTitle =
    step === 1
      ? "Contact details"
      : step === 2
        ? "Verify WhatsApp"
        : step === 3
          ? "Business basics"
          : step === 4
            ? "Business location"
            : step === 5
              ? "Choose map location"
              : step === 6
                ? "Business documents"
                : step === 7
                  ? "Create password"
                  : step === 8
                    ? "Review & create account"
                    : "";

  const stepDescription =
    step === 1
      ? "Tell us how we can reach you."
      : step === 2
        ? `Enter the verification code sent to ${PHONE_COUNTRIES[country].code}${phone}.`
        : step === 3
          ? "Tell us about your business."
          : step === 4
            ? "Tell our customers where is your business located"
            : step === 5
              ? "Choose the exact location of your business on the map."
              : step === 6
                ? "Upload the documents required for your business."
                : step === 7
                  ? "Choose a secure password."
                  : step === 8
                    ? "Check your details before creating your account."
                    : "";

  return (
    <main className="public-login-page mv-business-signup-page">
      <div className="public-login-card">
        <Link
          href="/"
          style={{
            display: "inline-block",
            textDecoration: "none",
            color: "#111318",
            fontWeight: 900,
            fontSize: "32px",
            lineHeight: 1,
            letterSpacing: "-1.5px",
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

        {step !== 9 && (
        <div style={{ marginBottom: "19px", marginTop: "18px" }}>
          <button
            type="button"
            onClick={back}
            style={{
              width: "auto",
              height: "16px",
              padding: 0,
              border: "none",
              background: "transparent",
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              color: "#2563EB",
              fontSize: "12px",
              fontWeight: 700,
              lineHeight: 1,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/back-arrow-9312237.png"
              alt=""
              width={16}
              height={16}
              style={{
                width: "16px",
                height: "20px",
                objectFit: "contain",
                filter: "brightness(0) saturate(100%) invert(36%) sepia(45%) saturate(1050%) hue-rotate(183deg) brightness(88%)",
                flexShrink: 0,
              }}
            />
            <span>Back</span>
          </button>
        </div>
        )}


        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
              marginBottom: "18px",
              minWidth: 0,
            }}
          >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#29AB87",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            Step {step} of 9
          </span>

          <span
            style={{
              fontSize: "11px",
              color: "#8A9199",
              fontWeight: 650,
            }}
          >
            Business signup
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "4px",
            borderRadius: "20px",
            background: "#E9ECEF",
            marginBottom: "22px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(step / 8) * 100}%`,
              height: "100%",
              background: "#29AB87",
              borderRadius: "20px",
              transition: "width 0.2s ease",
            }}
          />
        </div>

        <h1
          style={{
            fontSize: "16px",
            lineHeight: 1.1,
            letterSpacing: "-0.7px",
            margin: "0 0 7px",
            color: "#111318",
          }}
        >{stepTitle}</h1>

        <p
          style={{
            color: "#747A82",
            fontSize: "14px",
            lineHeight: 1.5,
            margin: "0 0 22px",
          }}
        >{stepDescription}</p>

        {step === 1 && (
          <form onSubmit={validateContact}>
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                autoFocus
                required
                style={inputStyle}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                style={inputStyle}
              />
            </Field>

            <Field label="WhatsApp number">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  minWidth: 0,
                  height: "52px",
                  border: "1px solid #DDE2E7",
                  borderRadius: "11px",
                  background: "#fff",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value as PhoneCountry);
                    setPhone("");
                  }}
                  style={{
                    flex: "0 0 104px",
                    width: "104px",
                    minWidth: "104px",
                    maxWidth: "104px",
                    height: "100%",
                    border: "none",
                    borderRight: "1px solid #E1E5EA",
                    outline: "none",
                    background: "#FFFFFF",
                    padding: "0 6px 0 10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#252A31",
                    cursor: "pointer",
                  }}
                >
                  {Object.entries(PHONE_COUNTRIES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder={PHONE_COUNTRIES[country].placeholder}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  style={{
                    flex: "1 1 0%",
                    width: "auto",
                    minWidth: 0,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    padding: "13px 12px",
                    fontSize: "16px",
                    color: "#111318",
                  }}
                />
              </div>
            </Field>

            <ErrorMessage error={error} />

            <button type="submit" style={continueButtonStyle}>
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <>
            {otpSending && (
              <div style={infoBoxStyle}>
                Sending OTP to your WhatsApp. Please wait...
              </div>
            )}

            {!otpSending && success && (
              <div style={successBoxStyle}>
                ✓ {success}
              </div>
            )}

            <form onSubmit={verifyOtp}>
              <Field label="WhatsApp OTP">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit OTP"
                  autoFocus
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    letterSpacing: "6px",
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                />
              </Field>

              <ErrorMessage error={error} />

              <button
                type="submit"
                disabled={otpVerifying || otpSending}
                style={{
                  ...continueButtonStyle,
                  opacity: otpVerifying || otpSending ? 0.7 : 1,
                }}
              >
                {otpVerifying ? "Verifying..." : "Verify WhatsApp"}
              </button>
            </form>

            <div
              style={{
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              {otpResendSeconds > 0 ? (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#747A82",
                    fontWeight: 600,
                  }}
                >
                  Resend available in {otpResendSeconds}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    sendOtp(getInternationalPhone(country, phone))
                  }
                  disabled={otpSending}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#0037FF",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: otpSending ? "default" : "pointer",
                    padding: "2px 6px",
                  }}
                >
                  ↻ Resend Verification OTP
                </button>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <form onSubmit={validateBusiness}>
            <Field label="Business name">
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name"
                autoComplete="organization"
                autoFocus
                required
                style={inputStyle}
              />
            </Field>

            <div
              style={{
                padding: "13px 14px",
                border: "1px solid #E1E5EA",
                borderRadius: "11px",
                background: "#F8FAFC",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  color: "#747A82",
                  fontSize: "11px",
                  marginBottom: "4px",
                }}
              >
                Business category
              </div>
              <strong style={{ color: "#111318", fontSize: "13px" }}>
                {selectedCategory || "Not selected"}
              </strong>
            </div>

            <ErrorMessage error={error} />

            <button type="submit" style={continueButtonStyle}>
              Continue
            </button>
          </form>
        )}

        {step === 4 && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              if (
                !address.trim() ||
                !state.trim() ||
                !city.trim() ||
                !postalCode.trim()
              ) {
                setError("Please complete your business location.");
                return;
              }
              setStep(5);
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 900,
                  color: "#454F4B",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                }}
              >
                Address details
              </div>

              <div
                style={{
                  padding: "4px 8px",
                  border: "1px solid #E0E8E4",
                  borderRadius: "7px",
                  background: "#FAFCFB",
                  color: "#65716C",
                  fontSize: "9px",
                  fontWeight: 800,
                }}
              >
                <span
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "18px",
                    minWidth: "18px",
                    height: "12px",
                    flexShrink: 0,
                    borderRadius: "2px",
                    border: "1px solid #E2E2E2",
                    boxSizing: "border-box",
                    marginRight: "6px",
                    verticalAlign: "middle",
                    background:
                      "linear-gradient(to bottom, #FF9933 0 33%, #FFFFFF 33% 66%, #138808 66% 100%)",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: "5px",
                      height: "5px",
                      transform: "translate(-50%, -50%)",
                      border: "1px solid #000080",
                      borderRadius: "50%",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: "7px",
                      height: "1px",
                      background: "#000080",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: "1px",
                      height: "7px",
                      background: "#000080",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </span>
                {countryName}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              <Field label="Business address">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter shop/house no., street & locality"
                  autoComplete="street-address"
                  required
                  style={{
                    ...inputStyle,
                    width: "100%",
                    height: "46px",
                    borderRadius: "12px",
                    border: "1px solid #D6E1DC",
                    background: "#FBFDFC",
                    padding: "0 13px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: "10px",
                  width: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                <Field label="State / Region">
                  {country === "IN" ? (
                    <select
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setCity("");
                      }}
                      required
                      style={{
                        ...inputStyle,
                        flex: 1,
                        width: "auto",
                        height: "46px",
                        borderRadius: "12px",
                        border: "1px solid #D6E1DC",
                        background: "#FBFDFC",
                        padding: "0 10px",
                        fontSize: "16px",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Select state</option>
                      {INDIA_STATES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State / Region"
                      required
                      style={{
                        ...inputStyle,
                        flex: 1,
                        width: "auto",
                        height: "46px",
                        borderRadius: "12px",
                        border: "1px solid #D6E1DC",
                        background: "#FBFDFC",
                        padding: "0 12px",
                        fontSize: "16px",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </Field>

                <Field label="City">
                  {country === "IN" ? (
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!state}
                      required
                      style={{
                        ...inputStyle,
                        flex: 1,
                        width: "auto",
                        height: "46px",
                        borderRadius: "12px",
                        border: "1px solid #D6E1DC",
                        background: state ? "#FBFDFC" : "#F1F4F2",
                        padding: "0 10px",
                        fontSize: "16px",
                        boxSizing: "border-box",
                        opacity: state ? 1 : .75,
                      }}
                    >
                      <option value="">
                        {state ? "Select city" : "Select state first"}
                      </option>
                      {indiaDistricts.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      required
                      style={{
                        ...inputStyle,
                        flex: 1,
                        width: "auto",
                        height: "46px",
                        borderRadius: "12px",
                        border: "1px solid #D6E1DC",
                        background: "#FBFDFC",
                        padding: "0 12px",
                        fontSize: "16px",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </Field>
              </div>

              <Field label="Postal code">
                <input
                  value={postalCode}
                  onChange={(e) =>
                    setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6-digit postal code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="postal-code"
                  required
                  style={{
                    ...inputStyle,
                    width: "100%",
                    height: "46px",
                    borderRadius: "12px",
                    border: "1px solid #D6E1DC",
                    background: "#FBFDFC",
                    padding: "0 13px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </Field>
            </div>

            <ErrorMessage error={error} />

            <button
              type="submit"
              style={{
                width: "100%",
                height: "48px",
                marginTop: "17px",
                border: "none",
                borderRadius: "13px",
                background: "#111318",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 900,
                letterSpacing: ".01em",
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(0,0,0,.17)",
              }}
            >
              Continue to Map →
            </button>

            <div
              style={{
                marginTop: "5px",
                textAlign: "center",
                fontSize: "9px",
                fontWeight: 650,
                color: "#8A9490",
              }}
            >
              You’ll confirm the exact location on the map next
            </div>
          </form>
        )}

        {step === 5 && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError("");

              listingLocationPickerRef.current?.confirmLocation();



              setStep(6);
            }}
          >
            <div
              style={{
                height: "auto",
                maxHeight: "560px",
                overflowY: "visible",
                overflowX: "hidden",
                paddingRight: "8px",
                boxSizing: "border-box",
                scrollbarWidth: "thin",
                scrollbarColor: "#29AB87 #EEF2F0",
              }}
            >
            <Field label="Map location">
              <div
                style={{
                  width: "100%",
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: "1px solid #DDE6E2",
                  background: "#fff",
                  boxShadow: "0 4px 16px rgba(20,40,32,.06)",
                }}
              >
                <ListingLocationPicker
                  ref={listingLocationPickerRef}
                  initialLocation={
                    latitude !== null && longitude !== null
                      ? { latitude, longitude }
                      : undefined
                  }
                  onConfirm={(location) => {
                    setLatitude(location.latitude);
                    setLongitude(location.longitude);
                    setLocationConfirmed(true);
                    setError("");
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  height: "46px",
                  marginTop: "12px",
                  border: "none",
                  borderRadius: "13px",
                  background: "#111318",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 5px 15px rgba(0,0,0,.14)",
                }}
              >
                Confirm Location & Continue
              </button>

              {latitude !== null && longitude !== null && (
                <div
                  style={{
                    marginTop: "8px",
                    color: "#176B51",
                    fontSize: "12px",
                    fontWeight: 650,
                  }}
                >
                  ✓ Map location confirmed
                </div>
              )}
            </Field>

            <ErrorMessage error={error} />
                                </div>
          </form>
        )}

        {step === 6 && (
          <form onSubmit={validateDocuments}>
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E7EAF0",
                borderRadius: "12px",
                padding: "10px 12px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#111318",
                  marginBottom: "3px",
                }}
              >
                Documents required
              </div>

              <div
                style={{
                  fontSize: "10px",
                  color: "#747A82",
                  lineHeight: 1.4,
                  marginBottom: "3px",
                }}
              >
                Based on your selected category:{" "}
                <strong style={{ color: "#30353B" }}>
                  {selectedCategory}
                </strong>{" "}
                · {countryName}
              </div>

              {documentRequirements.map((item) => (
                <div
                  key={item}
                  style={{
                    fontSize: "11px",
                    color: "#30353B",
                    marginTop: "4px",
                  }}
                >
                  ✓ {item}
                </div>
              ))}
            </div>

            <div
              style={{
                border: "1.5px dashed #C9D0D8",
                borderRadius: "12px",
                padding: "10px 12px",
                textAlign: "center",
                background: "#FFFFFF",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  marginBottom: "3px",
                }}
              >
                ↑
              </div>

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#111318",
                  marginBottom: "2px",
                }}
              >
                Upload business documents
              </div>

              <div
                style={{
                  fontSize: "9px",
                  color: "#747A82",
                  marginBottom: "7px",
                }}
              >
                PDF, JPG, JPEG or PNG · Multiple files allowed
              </div>

              <label
                htmlFor="business-documents-upload"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: "#111318",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Choose files
              </label>

              <input
                id="business-documents-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={documents.length >= 5}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  e.currentTarget.value = "";

                  if (!files.length) return;

                  setError("");

                  const currentNames = new Set(
                    documents.map((item) => item.name)
                  );

                  const uniqueFiles = files.filter(
                    (file) => !currentNames.has(file.name)
                  );

                  const remaining = 5 - documents.length;

                  if (remaining <= 0) {
                    setError("You can upload a maximum of 5 documents.");
                    return;
                  }

                  if (uniqueFiles.length > remaining) {
                    setError(
                      `You can upload a maximum of 5 documents. ${remaining} more can be added.`
                    );
                  }

                  const filesToUpload = uniqueFiles.slice(0, remaining);

                  if (!filesToUpload.length) return;

                  setDocumentsUploading(true);

                  const placeholders = filesToUpload.map((file) => ({
                    name: file.name,
                    file,
                    uploading: true,
                  }));

                  setDocuments((current) => [...current, ...placeholders]);

                  try {
                    for (const file of filesToUpload) {
                      try {
                        const uploaded = await uploadBusinessDocument(file);

                        setDocuments((current) =>
                          current.map((item) =>
                            item.name === file.name && item.file === file
                              ? {
                                  ...item,
                                  fileUrl: uploaded.url,
                                  publicId: uploaded.public_id,
                                  documentType: uploaded.format || file.type,
                                  uploading: false,
                                }
                              : item
                          )
                        );
                      } catch (uploadError) {
                        setDocuments((current) =>
                          current.filter(
                            (item) =>
                              !(item.name === file.name && item.file === file)
                          )
                        );

                        setError(
                          uploadError instanceof Error
                            ? uploadError.message
                            : `Failed to upload ${file.name}.`
                        );
                      }
                    }
                  } finally {
                    setDocumentsUploading(false);
                  }
                }}
                style={{ display: "none" }}
              />
            </div>

            {documents.length > 0 && (
              <div style={{ marginTop: "5px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "3px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#111318",
                    }}
                  >
                    Selected documents
                  </span>

                  <span
                    style={{
                      fontSize: "10px",
                      color: "#176B51",
                      fontWeight: 750,
                    }}
                  >
                    {documents.length} selected
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    maxHeight: "84px",
                    overflowY: "auto",
                    paddingRight: "4px",
                  }}
                >
                  {documents.map((document) => (
                    <div
                      key={document.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "4px 6px",
                        border: "1px solid #E7EAF0",
                        borderRadius: "9px",
                        background: "#FFFFFF",
                      }}
                    >
                      <div
                        style={{
                          width: "23px",
                          height: "23px",
                          borderRadius: "7px",
                          background: "#F1F5F9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          flexShrink: 0,
                        }}
                      >
                        📄
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 750,
                            color: "#20242A",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {document.name}
                        </div>

                        <div
                          style={{
                            fontSize: "9px",
                            color: "#176B51",
                            marginTop: "2px",
                            fontWeight: 700,
                          }}
                        >
                          {document.uploading
                            ? "Uploading..."
                            : document.fileUrl
                              ? "Uploaded successfully"
                              : "Upload failed"}
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label={`Remove ${document.name}`}
                        onClick={() =>
                          setDocuments((current) =>
                            current.filter(
                              (item) => item.name !== document.name
                            )
                          )
                        }
                        style={{
                          width: "23px",
                          minWidth: "23px",
                          maxWidth: "23px",
                          height: "23px",
                          minHeight: "23px",
                          maxHeight: "23px",
                          padding: 0,
                          margin: 0,
                          border: "1px solid #E7EAF0",
                          borderRadius: "50%",
                          background: "transparent",
                          color: "#D92D20",
                          fontSize: "15px",
                          fontWeight: 700,
                          lineHeight: 1,
                          cursor: "pointer",
                          flex: "0 0 23px",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxSizing: "border-box",
                          appearance: "none",
                          WebkitAppearance: "none",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ErrorMessage error={error} />

            <button
              type="submit"
              style={{
                ...continueButtonStyle,
                marginTop: "9px",
              }}
            >
              Continue to Password
            </button>
          </form>
        )}

        {step === 7 && (
          <div style={{ width: "100%", boxSizing: "border-box" }}>
            <div
              style={{
                marginBottom: "14px",
                fontSize: "12px",
                color: "#6B7280",
                lineHeight: 1.5,
              }}
            >
              Create a secure password for your business account.
            </div>

            <form onSubmit={validatePassword}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  width: "100%",
                }}
              >

                {/* PASSWORD */}
                <div style={{ width: "100%" }}>
                  <label
                    htmlFor="business-password"
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#252A31",
                    }}
                  >
                    Password
                  </label>

                  <div
                    className="mv-step7-password-field"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) 40px",
                      gridTemplateRows: "46px",
                      width: "100%",
                      maxWidth: "100%",
                      minWidth: 0,
                    }}
                  >
                    <input
                      id="business-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      inputMode="text"
                      style={{
                        gridColumn: "1 / 3",
                        gridRow: "1",
                        width: "100%",
                        minWidth: 0,
                        height: "46px",
                        boxSizing: "border-box",
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        color: "#111318",
                        padding: "0 48px 0 14px",
                        fontSize: "16px",
                        lineHeight: "46px",
                        outline: "none",
                        WebkitAppearance: "none",
                      }}
                    />

                    <button
                      className="mv-step7-password-eye"
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        gridColumn: "2",
                        gridRow: "1",
                        width: "40px",
                        minWidth: "40px",
                        maxWidth: "40px",
                        height: "46px",
                        margin: 0,
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#747A82",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        zIndex: 5,
                        WebkitTapHighlightColor: "transparent",
                        touchAction: "manipulation",
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={18} strokeWidth={2} />
                      ) : (
                        <Eye size={18} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div style={{ width: "100%" }}>
                  <label
                    htmlFor="business-confirm-password"
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#252A31",
                    }}
                  >
                    Confirm Password
                  </label>

                  <div
                    className="mv-step7-password-field"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) 40px",
                      gridTemplateRows: "46px",
                      width: "100%",
                      maxWidth: "100%",
                      minWidth: 0,
                    }}
                  >
                    <input
                      id="business-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      inputMode="text"
                      style={{
                        gridColumn: "1 / 3",
                        gridRow: "1",
                        width: "100%",
                        minWidth: 0,
                        height: "46px",
                        boxSizing: "border-box",
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        color: "#111318",
                        padding: "0 48px 0 14px",
                        fontSize: "16px",
                        lineHeight: "46px",
                        outline: "none",
                        WebkitAppearance: "none",
                      }}
                    />

                    <button
                      className="mv-step7-password-eye"
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      style={{
                        gridColumn: "2",
                        gridRow: "1",
                        width: "40px",
                        minWidth: "40px",
                        maxWidth: "40px",
                        height: "46px",
                        margin: 0,
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#747A82",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        zIndex: 5,
                        WebkitTapHighlightColor: "transparent",
                        touchAction: "manipulation",
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} strokeWidth={2} />
                      ) : (
                        <Eye size={18} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

              </div>

              <button
                type="submit"
                style={{
                  ...continueButtonStyle,
                  marginTop: "18px",
                }}
              >
                Continue to Review
              </button>
            </form>
          </div>
        )}

        {step === 8 && (
          <>
            <div
              style={{
                border: "1px solid #E4E7EC",
                borderRadius: "12px",
                background: "#FFFFFF",
                overflow: "hidden",
                boxShadow: "0 4px 14px rgba(17, 19, 24, 0.04)",
              }}
            >
              <div
                style={{
                  padding: "13px 14px 11px",
                  background: "#FAFBFC",
                  borderBottom: "1px solid #ECEEF1",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div>


        <div
                      style={{
                        fontSize: "10px",
                        color: "#747A82",
                        marginTop: "4px",
                      }}
                    >
                      Everything looks great!.
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 8px",
                      borderRadius: "999px",
                      background: "#ECF9F4",
                      color: "#176B51",
                      fontSize: "9px",
                      fontWeight: 850,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>✓</span>
                    Ready
                  </div>
                </div>

              </div>

              <div
                style={{
                  maxHeight: "215px",
                  overflowY: "auto",
                  padding: "4px 6px 5px",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 850,
                    color: "#8A9098",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    padding: "3px 4px 6px",
                  }}
                >
                  Contact
                </div>

                {[
                  ["Name", name],
                  ["Email", email],
                  [
                    "WhatsApp",
                    `${PHONE_COUNTRIES[country].code} ${phone}`,
                  ],
                  ["Country", countryName],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "5px 7px",
                      marginBottom: "3px",
                      border: "1px solid #ECEEF1",
                      borderRadius: "10px",
                      background: "#FFFFFF",
                    }}
                  >
                    <div
                      style={{
                        width: "23px",
                        height: "23px",
                        borderRadius: "8px",
                        background: "rgba(41, 171, 135, 0.08)",
                        color: "#69717C",
                        border: "1px solid rgba(41, 171, 135, 0.18)",
                        boxShadow: "inset 2px 0 0 #29AB87",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 850,
                        flexShrink: 0,
                      }}
                    >
                      {label === "Email"
                        ? "@"
                        : label === "WhatsApp"
                          ? "WA"
                          : label === "Country"
                            ? "IN"
                            : "A"}
                    </div>

                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#8A9098",
                          marginBottom: "2px",
                        }}
                      >
                        {label}
                      </div>

                      <div
                        style={{
                          fontSize: "10px",
                          lineHeight: 1.2,
                          fontWeight: 750,
                          color: "#20242A",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 850,
                    color: "#8A9098",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    padding: "7px 4px 6px",
                  }}
                >
                  Business
                </div>

                {[
                  ["Business name", businessName],
                  ["Category", selectedCategory],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "9px 10px",
                      marginBottom: "5px",
                      border: "1px solid #ECEEF1",
                      borderRadius: "10px",
                      background: "#FFFFFF",
                      boxShadow: "inset 2px 0 0 #E5E7EB",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#747A82",
                      }}
                    >
                      {label}
                    </span>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#20242A",
                        textAlign: "right",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 850,
                    color: "#8A9098",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    padding: "7px 4px 6px",
                  }}
                >
                  Location
                </div>

                {[
                  ["Address", address],
                  ["State / Region", state],
                  ["City", city],
                  ["Postal Code", postalCode],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "9px 10px",
                      marginBottom: "5px",
                      border: "1px solid #ECEEF1",
                      borderRadius: "10px",
                      background: "#FFFFFF",
                      boxShadow: "inset 2px 0 0 #E5E7EB",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#747A82",
                        flexShrink: 0,
                      }}
                    >
                      {label}
                    </span>

                    <span
                      style={{
                        fontSize: "11px",
                        lineHeight: 1.3,
                        fontWeight: 750,
                        color: "#20242A",
                        textAlign: "right",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px",
                    marginTop: "8px",
                  }}
                >
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      background: phoneVerified ? "#F0FBF7" : "#FFF7ED",
                      border: phoneVerified
                        ? "1px solid #C8E8DC"
                        : "1px solid #FED7AA",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#747A82",
                        marginBottom: "4px",
                      }}
                    >
                      WhatsApp
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "10px",
                        fontWeight: 850,
                        color: phoneVerified ? "#176B51" : "#9A3412",
                      }}
                    >
                      <span>{phoneVerified ? "✓" : "!"}</span>
                      {phoneVerified ? "Verified" : "Not verified"}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      background: "#F8FAFC",
                      border: "1px solid #E7EAF0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#747A82",
                        marginBottom: "4px",
                      }}
                    >
                      Documents
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "10px",
                        fontWeight: 850,
                        color: "#30353B",
                      }}
                    >
                      <span>📄</span>
                      {documents.length} uploaded
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ErrorMessage error={error} />

            <button
              type="button"
              onClick={createAccount}
              disabled={loading}
              style={{
                ...continueButtonStyle,
                marginTop: "9px",
                boxShadow: "0 5px 16px rgba(41, 171, 135, 0.20)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating account..." : "Create Business Account"}
            </button>
          </>
        )}

        {step === 9 && (
          <div
            style={{
              textAlign: "center",
              padding: "10px 0 4px",
            }}
          >
            <h2
              style={{
                margin: "0 0 9px",
                fontSize: "24px",
                lineHeight: 1.2,
                color: "#111318",
              }}
            >
              Account Created
            </h2>

            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#ECF9F4",
                color: "#176B51",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                fontWeight: 800,
                margin: "0 auto 18px",
              }}
            >
              ✓
            </div>

            <p
              style={{
                margin: "0 0 22px",
                color: "#747A82",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Your MetroVybe business account for{" "}
              <strong>{businessName}</strong> has been created successfully.
            </p>

            <div
              style={{
                margin: "0 0 20px",
                padding: "11px 14px",
                borderRadius: "8px",
                background: "#ECF9F4",
                color: "#176B51",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              ✓ Verification email sent to your email address.
              <div style={{ marginTop: "4px", fontWeight: 500 }}>
                Please verify your email address to activate your MetroVybe account.
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/business/dashboard")}
              style={continueButtonStyle}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={fieldGroupStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
        padding: "11px 0",
        borderBottom: "1px solid #ECEFF1",
        fontSize: "13px",
      }}
    >
      <span style={{ color: "#747A82", fontWeight: 650 }}>{label}</span>
      <strong
        style={{
          color: "#111318",
          textAlign: "right",
          maxWidth: "65%",
          wordBreak: "break-word",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  if (!error) return null;

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "15px",
        padding: "11px 12px",
        borderRadius: "10px",
        background: "#FFF5F5",
        border: "1px solid #F1CACA",
        color: "#B42318",
        fontSize: "12px",
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          width: "19px",
          height: "19px",
          minWidth: "19px",
          borderRadius: "50%",
          background: "#FDE2E2",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
        }}
      >
        !
      </span>
      <span>{error}</span>
    </div>
  );
}

const fieldGroupStyle = {
  marginBottom: "8px",
};

const labelStyle = {
  display: "block",
  color: "#30353B",
  fontSize: "12px",
  fontWeight: 750,
  marginBottom: "7px",
};


const mvBusinessPasswordStyles = `
.mv-business-password-wrap {
  position: relative;
  width: 100%;
}

.mv-business-password-wrap input {
  width: 100%;
  min-height: 46px;
  height: 46px;
  padding-right: 52px !important;
  box-sizing: border-box;
}

.mv-business-password-wrap button {
  position: absolute;
  right: 4px;
  top: 0;
  width: 40px;
  height: 46px;
  min-height: 46px;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #747A82;
  cursor: pointer;
  z-index: 3;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.mv-business-password-wrap button:hover {
  background: transparent;
  color: #252A31;
}

.mv-business-password-wrap button:focus-visible {
  outline: 2px solid rgba(41, 171, 135, 0.35);
  outline-offset: -2px;
}

@media (max-width: 640px) {
  .mv-business-password-wrap input {
    height: 46px;
    min-height: 46px;
    padding-right: 52px !important;
  }

  .mv-business-password-wrap button {
    right: 4px;
    width: 40px;
    height: 46px;
    min-height: 46px;
  }
}


.mv-step7-password-field {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 40px !important;
  grid-template-rows: 46px !important;
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

.mv-step7-password-field > input {
  grid-column: 1 / 3 !important;
  grid-row: 1 !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 46px !important;
  box-sizing: border-box !important;
  padding-right: 48px !important;
}

.mv-step7-password-field > .mv-step7-password-eye {
  grid-column: 2 !important;
  grid-row: 1 !important;
  position: static !important;
  inset: auto !important;
  transform: none !important;
  width: 40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
  height: 46px !important;
  margin: 0 !important;
  padding: 0 !important;
  align-self: stretch !important;
  justify-self: stretch !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 20 !important;
}
`;

const inputStyle = {
  width: "100%",
  height: "52px",
  padding: "0 14px",
  border: "1px solid #DDE2E7",
  borderRadius: "11px",
  background: "#fff",
  color: "#151918",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box" as const,
};




const continueButtonStyle = {
  width: "100%",
  height: "46px",
  border: "none",
  borderRadius: "11px",
  background: "#111",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};

const linkButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#2563EB",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
};

const successBoxStyle = {
  marginBottom: "15px",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "#ECF9F4",
  border: "1px solid #C8E8DC",
  color: "#176B51",
  fontSize: "12px",
  fontWeight: 650,
};

const infoBoxStyle = {
  marginBottom: "15px",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "#F7F9FF",
  border: "1px solid #D7E0FF",
  color: "#3152B8",
  fontSize: "12px",
  fontWeight: 650,
};


<style jsx global>{`




  }


  .mv-business-signup-page {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      overflow-x: hidden !important;
      box-sizing: border-box !important;
    }

    .mv-business-signup-page .public-login-card {
      width: calc(100% - 24px) !important;
      max-width: 100% !important;
      min-width: 0 !important;
      margin-left: auto !important;
      margin-right: auto !important;
      padding-left: 16px !important;
      padding-right: 16px !important;
      box-sizing: border-box !important;
      overflow-x: hidden !important;
    }

    .mv-business-signup-page input,
    .mv-business-signup-page select,
    .mv-business-signup-page textarea {
      font-size: 16px !important;
    }
    .mv-business-signup-page input,
    .mv-business-signup-page select,
    .mv-business-signup-page textarea,
    .mv-business-signup-page button {
      max-width: 100% !important;
      box-sizing: border-box !important;
    }

    .mv-business-signup-page img {
      max-width: 100%;
    }

    .mv-business-signup-page h1,
    .mv-business-signup-page p {
      max-width: 100%;
      overflow-wrap: anywhere;
    }

    .mv-business-signup-page [style*="overflowY"],
    .mv-business-signup-page [style*="overflowX"] {
      max-width: 100% !important;
      box-sizing: border-box !important;
    }




    .business-doc-upload-card {
      padding: 10px 10px !important;
      border-radius: 12px !important;
    }

    .business-doc-upload-icon {
      width: 30px !important;
      height: 30px !important;
      margin-bottom: 4px !important;
      font-size: 15px !important;
    }

    .business-doc-upload-title {
      font-size: 12px !important;
      margin-bottom: 2px !important;
    }

    .business-doc-upload-help {
      font-size: 9px !important;
      margin-bottom: 7px !important;
    }

    .business-doc-upload-button {
      padding: 6px 11px !important;
      font-size: 11px !important;
    }

    .business-doc-row {
      padding: 6px 8px !important;
      border-radius: 9px !important;
    }

    .business-doc-file-icon {
      width: 27px !important;
      height: 27px !important;
      font-size: 12px !important;
    }

    .business-doc-remove {
      width: 26px !important;
      height: 26px !important;
    }
  }

`}

</style>

export default function BusinessSignupPage() {
  return (
    <Suspense fallback={null}>
      <BusinessSignupPageContent />
    </Suspense>
  );
}
