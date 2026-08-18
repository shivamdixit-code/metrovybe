"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const PHONE_COUNTRIES = {
  IN: {
    code: "+91",
    digits: 10,
    placeholder: "9876543210",
    label: "🇮🇳 +91",
  },
  GB: {
    code: "+44",
    digits: 10,
    placeholder: "7911123456",
    label: "🇬🇧 +44",
  },
  US: {
    code: "+1",
    digits: 10,
    placeholder: "2015550123",
    label: "🇺🇸 +1",
  },
  CA: {
    code: "+1",
    digits: 10,
    placeholder: "4165550123",
    label: "🇨🇦 +1",
  },
  AU: {
    code: "+61",
    digits: 9,
    placeholder: "412345678",
    label: "🇦🇺 +61",
  },
  NZ: {
    code: "+64",
    digits: 9,
    placeholder: "211234567",
    label: "🇳🇿 +64",
  },
  SG: {
    code: "+65",
    digits: 8,
    placeholder: "81234567",
    label: "🇸🇬 +65",
  },
  MY: {
    code: "+60",
    digits: 9,
    placeholder: "123456789",
    label: "🇲🇾 +60",
  },
  AE: {
    code: "+971",
    digits: 9,
    placeholder: "501234567",
    label: "🇦🇪 +971",
  },
} as const;

type PhoneCountry = keyof typeof PHONE_COUNTRIES;

const PHONE_DIAL_CODES: Record<PhoneCountry, string> = {
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

function getInternationalPhone(
  country: PhoneCountry,
  phone: string
) {
  return `+${PHONE_DIAL_CODES[country]}${phone.replace(/\D/g, "")}`;
}

type Step = 1 | 2 | 3 | 4 | 5;

function BusinessSignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "";

  const [step, setStep] = useState<Step>(1);

  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<PhoneCountry>("IN");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResendSeconds, setOtpResendSeconds] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (otpResendSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setOtpResendSeconds((seconds) =>
        seconds > 0 ? seconds - 1 : 0
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpResendSeconds]);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [step]);

  function handleBack() {
    setError("");
    setSuccess("");

    if (step === 1) {
      router.push("/signup");
      return;
    }

    if (step === 5) {
      setOtp("");
      setStep(4);
      return;
    }

    setStep((current) => (current - 1) as Step);
  }

  function continueStepOne(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!businessName.trim()) {
      setError("Please enter your business name.");
      return;
    }

    if (!category) {
      setError("Please select a business category.");
      return;
    }

    setStep(2);
  }

  function continueStepTwo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!address.trim()) {
      setError("Please enter your business address.");
      return;
    }

    if (!city.trim()) {
      setError("Please enter your city.");
      return;
    }

    setStep(3);
  }

  function continueStepThree(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (
      cleanPhone.length !==
      PHONE_COUNTRIES[country].digits
    ) {
      setError(
        `Please enter a valid ${PHONE_COUNTRIES[country].code} mobile number.`
      );
      return;
    }

    setName(name.trim());
    setEmail(cleanEmail);
    setPhone(cleanPhone);
    setError("");
    setSuccess("");
    setStep(4);
  }

  function continueStepFour(event: FormEvent<HTMLFormElement>) {
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

    const phoneNumber = getInternationalPhone(country, phone);

    setOtp("");
    setOtpResendSeconds(60);
    setStep(5);

    sendPhoneOtp(phoneNumber);
  }

  async function sendPhoneOtp(phoneNumber: string) {
    setError("");
    setSuccess("");
    setOtpSending(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/send-signup-phone-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phoneNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(
            data.message ||
              "Please wait before requesting another OTP."
          );
          setOtpResendSeconds(60);
          return;
        }

        throw new Error(
          data.message || "Unable to send OTP."
        );
      }

      setSuccess(
        "OTP sent successfully. Please check your WhatsApp."
      );
      setOtp("");
      setOtpResendSeconds(60);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send OTP."
      );
    } finally {
      setOtpSending(false);
    }
  }

  async function verifyPhoneOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanOtp = otp.replace(/\D/g, "");

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setOtpVerifying(true);

    try {
      const normalizedPhoneNumber = getInternationalPhone(
        country,
        phone
      );

      const response = await fetch(
        `${API_URL}/api/auth/verify-signup-phone-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: normalizedPhoneNumber,
            otp: cleanOtp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid OTP."
        );
      }

      setSuccess("WhatsApp number verified successfully.");

      await createBusinessAccount();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Phone verification failed."
      );
    } finally {
      setOtpVerifying(false);
    }
  }

  async function createBusinessAccount() {
    setLoading(true);
    setError("");

    try {
      const phoneNumber = getInternationalPhone(
        country,
        phone
      );

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phoneNumber,
            password,
            role: "business",
            businessName: businessName.trim(),
            category,
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed."
        );
      }

      setSuccess(
        `Business account created successfully. A verification link has been sent to ${
          data.user?.email || email
        }.`
      );

      window.setTimeout(() => {
        router.push("/business/dashboard");
      }, 2500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedCategory = category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

  return (
    <main className="public-login-page">
      <div className="public-login-card">
        <div style={{ marginBottom: "19px" }}>
          <button
            type="button"
            onClick={handleBack}
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
            <span style={{ fontSize: "20px" }}>‹</span>
            <span>
              {step === 1
                ? "Change Category"
                : "Back"}
            </span>
          </button>
        </div>

        <h1
          style={{
            fontSize: "28px",
            lineHeight: 1.1,
            letterSpacing: "-0.7px",
            margin: "0 0 7px",
            color: "#111318",
          }}
        >
          {step === 1
            ? "Create your business account"
            : step === 2
              ? "Where is your business?"
              : step === 3
                ? "How can we reach you?"
                : step === 4
                  ? "Create your password"
                  : "Verify your phone"}
        </h1>

        <p
          style={{
            color: "#747A82",
            fontSize: "14px",
            lineHeight: 1.5,
            margin: "0 0 22px",
          }}
        >
          {step === 1
            ? "Set up your business profile on MetroVybe."
            : step === 2
              ? "Add the location customers will see on your listing."
              : step === 3
                ? "We'll use these details to keep your account secure."
                : step === 4
                  ? "Choose a secure password for your business account."
                  : (
                    <>
                      We sent a 6-digit verification code to{" "}
                      <strong>
                        {PHONE_COUNTRIES[country].code}
                        {phone}
                      </strong>
                      .
                    </>
                  )}
        </p>

        {step === 1 && (
          <form onSubmit={continueStepOne}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Business name
              </label>

              <input
                type="text"
                value={businessName}
                onChange={(event) =>
                  setBusinessName(event.target.value)
                }
                placeholder="Enter your business name"
                autoComplete="organization"
                autoFocus
                required
                style={inputStyle}
              />
            </div>

            <div
              style={{
                padding: "13px 14px",
                border: "1px solid #E1E5EA",
                borderRadius: "11px",
                background: "#F8FAFC",
                marginBottom: "18px",
                fontSize: "13px",
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

              <strong style={{ color: "#111318" }}>
                {selectedCategory || "Not selected"}
              </strong>
            </div>

            <ErrorMessage error={error} />

            <button
              type="submit"
              style={continueButtonStyle}
            >
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={continueStepTwo}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Business address
              </label>

              <input
                type="text"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Street address"
                autoComplete="street-address"
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                City
              </label>

              <input
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                placeholder="Enter city"
                autoComplete="address-level2"
                required
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  State
                </label>

                <input
                  type="text"
                  value={state}
                  onChange={(event) =>
                    setState(event.target.value)
                  }
                  placeholder="State"
                  autoComplete="address-level1"
                  style={inputStyle}
                />
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  Pincode
                </label>

                <input
                  type="text"
                  value={pincode}
                  onChange={(event) =>
                    setPincode(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  placeholder="Pincode"
                  autoComplete="postal-code"
                  style={inputStyle}
                />
              </div>
            </div>

            <ErrorMessage error={error} />

            <button
              type="submit"
              style={continueButtonStyle}
            >
              Continue
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={continueStepThree}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Your name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your full name"
                autoComplete="name"
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                WhatsApp number
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "108px 1fr",
                  gap: "8px",
                }}
              >
                <select
                  value={country}
                  onChange={(event) =>
                    setCountry(
                      event.target.value as PhoneCountry
                    )
                  }
                  style={{
                    ...inputStyle,
                    padding: "0 8px",
                    fontSize: "13px",
                  }}
                >
                  {Object.entries(PHONE_COUNTRIES).map(
                    ([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(
                          0,
                          PHONE_COUNTRIES[country].digits
                        )
                    )
                  }
                  placeholder={
                    PHONE_COUNTRIES[country].placeholder
                  }
                  autoComplete="tel-national"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <ErrorMessage error={error} />

            <button
              type="submit"
              style={continueButtonStyle}
            >
              Continue
            </button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={continueStepFour}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Password
              </label>

              <div style={passwordWrapperStyle}>
                <input
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  style={passwordInputStyle}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (visible) => !visible
                    )
                  }
                  style={eyeButtonStyle}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Confirm password
              </label>

              <div style={passwordWrapperStyle}>
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  style={passwordInputStyle}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (visible) => !visible
                    )
                  }
                  style={eyeButtonStyle}
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <ErrorMessage error={error} />

            <button
              type="submit"
              disabled={otpSending}
              style={{
                ...continueButtonStyle,
                opacity: otpSending ? 0.7 : 1,
              }}
            >
              {otpSending
                ? "Sending OTP..."
                : "Continue"}
            </button>
          </form>
        )}

        {step === 5 && (
          <>
            {otpSending && (
              <div
                role="status"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  marginBottom: "15px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #F7F9FF 0%, #EEF3FF 100%)",
                  border: "1px solid #D7E0FF",
                }}
              >
                <div
                  style={{
                    width: "23px",
                    height: "23px",
                    minWidth: "23px",
                    borderRadius: "50%",
                    border: "2px solid #D5DEFF",
                    borderTopColor: "#315CFF",
                    animation:
                      "spin 0.8s linear infinite",
                  }}
                />

                <div
                  style={{
                    color: "#3152B8",
                    fontSize: "12px",
                    fontWeight: 650,
                  }}
                >
                  Sending OTP to your WhatsApp. Please wait...
                </div>
              </div>
            )}

            {!otpSending && success && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "#ECF9F4",
                  border: "1px solid #C8E8DC",
                  color: "#176B51",
                  fontSize: "12px",
                  fontWeight: 650,
                }}
              >
                ✓ {success}
              </div>
            )}

            {!otpSending && error && (
              <ErrorMessage error={error} />
            )}

            <form onSubmit={verifyPhoneOtp}>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  Verification code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    letterSpacing: "6px",
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={
                  otpVerifying ||
                  loading ||
                  otpSending
                }
                style={{
                  ...continueButtonStyle,
                  background:
                    otpVerifying || loading
                      ? "#555"
                      : "#111",
                  cursor:
                    otpVerifying || loading
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {otpVerifying
                  ? "Verifying..."
                  : loading
                    ? "Creating account..."
                    : "Verify phone & create account"}
              </button>
            </form>

            <div
              style={{
                width: "100%",
                marginTop: "15px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {otpResendSeconds > 0 ? (
                <div
                  style={{
                    color: "#6B7280",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Didn't get the code?{" "}
                  <span
                    style={{
                      color: "#2563EB",
                      fontWeight: 700,
                    }}
                  >
                    Available in {otpResendSeconds}s
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    sendPhoneOtp(
                      getInternationalPhone(
                        country,
                        phone
                      )
                    )
                  }
                  disabled={otpSending}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#2563EB",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ↻ Resend verification code
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ErrorMessage({
  error,
}: {
  error: string;
}) {
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
  marginBottom: "16px",
};

const labelStyle = {
  display: "block",
  color: "#30353B",
  fontSize: "12px",
  fontWeight: 750,
  marginBottom: "7px",
};

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

const passwordWrapperStyle = {
  position: "relative" as const,
  width: "100%",
};

const passwordInputStyle = {
  ...inputStyle,
  paddingRight: "48px",
};

const eyeButtonStyle = {
  position: "absolute" as const,
  right: "8px",
  top: "50%",
  transform: "translateY(-50%)",
  width: "36px",
  height: "36px",
  border: "none",
  background: "transparent",
  color: "#707780",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
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

export default function BusinessSignupPage() {
  return (
    <Suspense fallback={null}>
      <BusinessSignupPageContent />
    </Suspense>
  );
}
