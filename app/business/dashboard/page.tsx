"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { getToken } from "@/lib/auth";
import { getBusinessEnquiries, markEnquiryRead, replyToEnquiry } from "@/lib/api";
import type { Booking, Enquiry } from "@/lib/api";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

const ListingLocationPicker = dynamic(
  () => import("@/components/ListingLocationPicker"),
  { ssr: false }
);

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type Business = {
  _id?: string;
  businessName: string;
  description?: string;
  businessHours?: {
    monday?: { open?: string; close?: string; closed?: boolean };
    tuesday?: { open?: string; close?: string; closed?: boolean };
    wednesday?: { open?: string; close?: string; closed?: boolean };
    thursday?: { open?: string; close?: string; closed?: boolean };
    friday?: { open?: string; close?: string; closed?: boolean };
    saturday?: { open?: string; close?: string; closed?: boolean };
    sunday?: { open?: string; close?: string; closed?: boolean };
  };
  category?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  location?: {
    latitude?: number | null;
    longitude?: number | null;
  };
  logo?: string;
  images?: string[];
  verificationStatus?: string;
  rejectionReason?: string;
  verifiedAt?: string | null;
  status?: string;
  owner?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
  };
};

type Listing = {
  _id: string;
  title: string;
  category?: string;
  location?: string;
  price?: string;
  status?: string;
  image?: string;
};

function pretty(value?: string) {
  return (value || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (x) => x.toUpperCase());
}

function statusClass(value?: string) {
  const v = (value || "pending").toLowerCase();

  if (v === "published" || v === "verified" || v === "active") {
    return "mv-status mv-status-success";
  }

  if (v === "rejected" || v === "suspended" || v === "blocked") {
    return "mv-status mv-status-danger";
  }

  return "mv-status mv-status-warning";
}

export default function BusinessDashboard() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [showAllListings, setShowAllListings] = useState(false);
  const [businessBookings, setBusinessBookings] = useState<Booking[]>([]);
  const [businessEnquiries, setBusinessEnquiries] = useState<Enquiry[]>([]);
  const [showAllEnquiries, setShowAllEnquiries] = useState(false);
  const [enquiryReplyId, setEnquiryReplyId] = useState<string | null>(null);
  const [enquiryReplyText, setEnquiryReplyText] = useState("");
  const [enquiryActionLoading, setEnquiryActionLoading] = useState<string | null>(null);

  const [showAllBookings, setShowAllBookings] = useState(false);
  const [bookingActionLoading, setBookingActionLoading] = useState<string | null>(null);
  const [listingDeleteLoading, setListingDeleteLoading] = useState<string | null>(null);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactError, setContactError] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [profileForm, setProfileForm] = useState({
    businessName: "",
    category: "",
    description: "",
    logo: "",
    location: {
      latitude: "",
      longitude: "",
    },
    businessHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "09:00", close: "18:00", closed: false },
      sunday: { open: "", close: "", closed: true },
    },
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const startProfileEdit = () => {
    if (!business) return;

    setProfileSaveError("");

    setProfileForm({
      businessName: business.businessName || "",
      category: business.category || "",
      description: business.description || "",
      logo: business.logo || "",
      location: {
        latitude:
          business.location?.latitude !== null &&
          business.location?.latitude !== undefined
            ? String(business.location.latitude)
            : "",
        longitude:
          business.location?.longitude !== null &&
          business.location?.longitude !== undefined
            ? String(business.location.longitude)
            : "",
      },
      businessHours: {
        monday: {
          open: business.businessHours?.monday?.open || "09:00",
          close: business.businessHours?.monday?.close || "18:00",
          closed: Boolean(business.businessHours?.monday?.closed),
        },
        tuesday: {
          open: business.businessHours?.tuesday?.open || "09:00",
          close: business.businessHours?.tuesday?.close || "18:00",
          closed: Boolean(business.businessHours?.tuesday?.closed),
        },
        wednesday: {
          open: business.businessHours?.wednesday?.open || "09:00",
          close: business.businessHours?.wednesday?.close || "18:00",
          closed: Boolean(business.businessHours?.wednesday?.closed),
        },
        thursday: {
          open: business.businessHours?.thursday?.open || "09:00",
          close: business.businessHours?.thursday?.close || "18:00",
          closed: Boolean(business.businessHours?.thursday?.closed),
        },
        friday: {
          open: business.businessHours?.friday?.open || "09:00",
          close: business.businessHours?.friday?.close || "18:00",
          closed: Boolean(business.businessHours?.friday?.closed),
        },
        saturday: {
          open: business.businessHours?.saturday?.open || "09:00",
          close: business.businessHours?.saturday?.close || "18:00",
          closed: Boolean(business.businessHours?.saturday?.closed),
        },
        sunday: {
          open: business.businessHours?.sunday?.open || "",
          close: business.businessHours?.sunday?.close || "",
          closed:
            business.businessHours?.sunday?.closed !== undefined
              ? Boolean(business.businessHours.sunday.closed)
              : true,
        },
      },
      email: business.email || business.owner?.email || "",
      phone: business.phone || business.owner?.phone || "",
      address: business.address || "",
      city: business.city || "",
      state: business.state || "",
      pincode: business.pincode || "",
    });

    setEditingProfile(true);
  };

  const requestPhoneChange = async () => {
    try {
      setContactLoading(true);
      setContactError("");
      setContactMessage("");

      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/request-phone-change`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: profileForm.phone }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Unable to send OTP.");

      setPhoneOtpSent(true);
      setContactMessage(data?.message || "OTP sent to your WhatsApp number.");
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setContactLoading(false);
    }
  };

  const verifyPhoneChange = async () => {
    try {
      setContactLoading(true);
      setContactError("");
      setContactMessage("");

      const token = getToken();
      const response = await fetch(`${API_URL}/api/auth/verify-phone-change`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: phoneOtp }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Invalid OTP.");

      setPhoneOtpSent(false);
      setPhoneOtp("");
      setContactMessage("Phone number verified and updated successfully.");
      setBusiness((current) =>
        current ? { ...current, phone: profileForm.phone } : current
      );
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "Unable to verify OTP.");
    } finally {
      setContactLoading(false);
    }
  };

  const requestEmailChange = async () => {
    try {
      setContactLoading(true);
      setContactError("");
      setContactMessage("");

      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/request-email-change`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: profileForm.email }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Unable to send verification email.");
      }

      setContactMessage(
        data?.message || "Verification link sent to your new email address."
      );
    } catch (err) {
      setContactError(
        err instanceof Error ? err.message : "Unable to request email change."
      );
    } finally {
      setContactLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteAccountError("Please enter your password.");
      return;
    }

    if (!window.confirm("Are you sure? This will permanently delete your account and cannot be undone.")) {
      return;
    }

    try {
      setDeletingAccount(true);
      setDeleteAccountError("");

      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete account.");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      setDeleteAccountError(
        err instanceof Error ? err.message : "Unable to delete account."
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleLogoUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setLogoUploadError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setLogoUploadError("Please upload a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError("Image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingLogo(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/api/upload/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.url) {
        throw new Error(
          data?.message || "Unable to upload business DP."
        );
      }

      setProfileForm((current) => ({
        ...current,
        logo: data.url,
      }));
    } catch (err) {
      setLogoUploadError(
        err instanceof Error
          ? err.message
          : "Unable to upload business DP."
      );
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      setProfileSaveError("");

      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Validate all mandatory business profile fields before saving.
      const requiredFields = [
        ["Business name", profileForm.businessName],
        ["Business category", profileForm.category],
        ["Business description", profileForm.description],
        ["Address", profileForm.address],
        ["City", profileForm.city],
        ["State", profileForm.state],
        ["Pincode", profileForm.pincode],
        ["Logo", profileForm.logo],
      ];

      const missingField = requiredFields.find(
        ([, value]) => !String(value || "").trim()
      );

      if (missingField) {
        throw new Error(`${missingField[0]} is required.`);
      }

      const latitude = Number(profileForm.location.latitude);
      const longitude = Number(profileForm.location.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new Error("Valid map latitude and longitude are required.");
      }

      const openDays = Object.entries(profileForm.businessHours).filter(
        ([, day]) => !day.closed
      );

      const invalidHours = openDays.some(
        ([, day]) => !day.open || !day.close
      );

      if (invalidHours) {
        throw new Error(
          "Opening and closing times are required for every open day."
        );
      }

      // Contact details require separate verification and cannot be
      // changed directly through the business profile endpoint.
      const { email, phone, ...businessDetails } = profileForm;

      const payload = {
        ...businessDetails,
        location: {
          latitude,
          longitude,
        },
      };

      const response = await fetch(`${API_URL}/api/business/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update business details."
        );
      }

      setBusiness((current) =>
        current
          ? {
              ...current,
              ...businessDetails,
              location: payload.location,
            }
          : current
      );

      setEditingProfile(false);
      setLastUpdated(new Date());
    } catch (err) {
      setProfileSaveError(
        err instanceof Error
          ? err.message
          : "Unable to update business details."
      );
    } finally {
      setSavingProfile(false);
    }
  };


  const handleEnquiryRead = async (enquiryId: string) => {
    try {
      setEnquiryActionLoading(enquiryId);
      const result = await markEnquiryRead(enquiryId);

      setBusinessEnquiries((current) =>
        current.map((enquiry) =>
          enquiry._id === enquiryId
            ? { ...enquiry, status: result.enquiry.status }
            : enquiry
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark enquiry as read."
      );
    } finally {
      setEnquiryActionLoading(null);
    }
  };

  const handleEnquiryReply = async (enquiryId: string) => {
    const message = enquiryReplyText.trim();

    if (!message) {
      setError("Please enter a reply.");
      return;
    }

    try {
      setEnquiryActionLoading(enquiryId);

      const result = await replyToEnquiry(enquiryId, message);

      setBusinessEnquiries((current) =>
        current.map((enquiry) =>
          enquiry._id === enquiryId
            ? {
                ...enquiry,
                ...result.enquiry,
                status: "replied",
              }
            : enquiry
        )
      );

      setEnquiryReplyText("");
      setEnquiryReplyId(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send enquiry reply."
      );
    } finally {
      setEnquiryActionLoading(null);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: "confirmed" | "rejected" | "completed"
  ) => {
    try {
      setBookingActionLoading(bookingId);

      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update booking.");
      }

      setBusinessBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status }
            : booking
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    } finally {
      setBookingActionLoading(null);
    }
  };

  const loadDashboard = useCallback(async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const cacheBust = Date.now();

      const fetchWithTimeout = async (
        url: string,
        options: RequestInit,
        timeout = 10000
      ) => {
        const controller = new AbortController();
        const timer = window.setTimeout(
          () => controller.abort(),
          timeout
        );

        try {
          return await fetch(url, {
            ...options,
            signal: controller.signal,
          });
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            throw new Error("Dashboard request timed out. Please try again.");
          }
          throw err;
        } finally {
          window.clearTimeout(timer);
        }
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      };

      const [businessResponse, listingsResponse, bookingsResponse, enquiriesResponse] =
        await Promise.all([
        fetchWithTimeout(
          `${API_URL}/api/business/me?_t=${cacheBust}`,
          {
            cache: "no-store",
            headers,
          }
        ),

        fetchWithTimeout(
          `${API_URL}/api/listings/business/mine?_t=${cacheBust}`,
          {
            cache: "no-store",
            headers,
          }
        ),
        fetchWithTimeout(
          `${API_URL}/api/bookings/business?_t=${cacheBust}`,
          {
            cache: "no-store",
            headers,
          }
        ),

        fetchWithTimeout(
          `${API_URL}/api/enquiries/business?_t=${cacheBust}`,
          {
            cache: "no-store",
            headers,
          }
        ),
      ]);

      if (!businessResponse.ok) {
        throw new Error(
          `Unable to load business profile (${businessResponse.status})`
        );
      }

      if (!listingsResponse.ok) {
        throw new Error(
          `Unable to load listings (${listingsResponse.status})`
        );
      }

      if (!bookingsResponse.ok) {
        throw new Error(
          `Unable to load bookings (${bookingsResponse.status})`
        );
      }

      if (!enquiriesResponse.ok) {
        throw new Error(
          `Unable to load enquiries (${enquiriesResponse.status})`
        );
      }

      const businessData = await businessResponse.json();
      const listingsData = await listingsResponse.json();
      const bookingsData = await bookingsResponse.json();
      const enquiriesData = await enquiriesResponse.json();

      setBusinessBookings(
        Array.isArray(bookingsData)
          ? bookingsData
          : Array.isArray(bookingsData?.bookings)
            ? bookingsData.bookings
            : []
      );

      setBusinessEnquiries(
        Array.isArray(enquiriesData?.enquiries)
          ? enquiriesData.enquiries
          : []
      );

      setBusiness(businessData.business || null);
      setVerification(businessData.verification || null);

      setListings(
        Array.isArray(listingsData)
          ? listingsData
          : Array.isArray(listingsData?.listings)
            ? listingsData.listings
            : []
      );

      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load business dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setHydrated(true);
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const published = listings.filter(
      (x) => x.status?.toLowerCase() === "published"
    ).length;

    const pending = listings.filter(
      (x) => x.status?.toLowerCase() === "pending"
    ).length;

    const other = Math.max(
      listings.length - published - pending,
      0
    );

    return {
      total: listings.length,
      published,
      pending,
      other,
    };
  }, [listings]);

  const verificationStatus =
    business?.verificationStatus ||
    verification?.status ||
    "pending";


  const listingStats = {
    total: listings.length,
    published: listings.filter(
      (listing) => listing.status === "published"
    ).length,
    pending: listings.filter(
      (listing) => listing.status === "pending"
    ).length,
    other: listings.filter(
      (listing) =>
        listing.status !== "published" &&
        listing.status !== "pending"
    ).length,
  };

  const publishedCount = listingStats.published;
  const pendingCount = listingStats.pending;
  const otherCount = listingStats.other;


  const displayVerification =
    verificationStatus === "verified"
      ? "Verified"
      : verificationStatus === "rejected"
        ? "Rejected"
        : verificationStatus === "suspended"
          ? "Suspended"
          : "Pending";

  const verificationTone =
    verificationStatus === "verified"
      ? "verified"
      : verificationStatus === "rejected" ||
          verificationStatus === "suspended"
        ? "danger"
        : "pending";


  const locationText =
    [business?.city, business?.state]
      .filter(Boolean)
      .join(", ") || "Location not provided";

  const ownerName =
    business?.owner?.name ||
    business?.businessName ||
    "Business Owner";

  const initials = (business?.businessName || "B")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x.charAt(0).toUpperCase())
    .join("");

  function logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("metrovybe_token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("metrovybe_token");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("accessToken");
    } catch {}

    window.location.href = "/login";
  }

  function Icon({
    name,
    size = 22,
  }: {
    name:
      | "grid"
      | "list"
      | "check"
      | "clock"
      | "shield"
      | "phone"
      | "mail"
      | "pin"
      | "refresh"
      | "logout"
      | "plus"
      | "arrow"
      | "building"
      | "edit"
      | "external";
    size?: number;
  }) {
    const common = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.9,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      "aria-hidden": true,
    };

    if (name === "grid")
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );

    if (name === "list")
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 9h9M8 13h9M8 17h6" />
          <path d="M5.5 9h.01M5.5 13h.01M5.5 17h.01" />
        </svg>
      );

    if (name === "check")
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    if (name === "clock")
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    if (name === "shield")
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );

    if (name === "phone")
      return (
        <svg {...common}>
          <path d="M7 3h3l1.5 4-2 1.5a15 15 0 0 0 6 6L17 12l4 1.5v3c0 1.4-1.1 2.5-2.5 2.5C11 19 5 13 5 5.5 5 4.1 5.9 3 7 3Z" />
        </svg>
      );

    if (name === "mail")
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );

    if (name === "pin")
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    if (name === "refresh")
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
          <path d="M3 5v5h5" />
          <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
          <path d="M21 19v-5h-5" />
        </svg>
      );

    if (name === "logout")
      return (
        <svg {...common}>
          <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
          <path d="m14 8 4 4-4 4" />
          <path d="M18 12H9" />
        </svg>
      );

    if (name === "plus")
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    if (name === "arrow")
      return (
        <svg {...common}>
          <path d="M5 12h13" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    if (name === "building")
      return (
        <svg {...common}>
          <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
          <path d="M16 9h2a2 2 0 0 1 2 2v10" />
          <path d="M8 7h4M8 11h4M8 15h4M9 21v-3h2v3" />
        </svg>
      );

    if (name === "edit")
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      );

    return (
      <svg {...common}>
        <path d="M14 5h5v5" />
        <path d="M19 5 10 14" />
        <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
      </svg>
    );
  }

  if (!hydrated) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f8fa",
          visibility: "hidden",
        }}
      />
    );
  }

  if (loading) {
    return (
      <main className="mv-premium-dashboard loading-screen">
        <div className="loading-orb" />
        <div className="loading-content">
          <div className="loading-brand">
            metro<span>vybe</span><sup>✦</sup>
          </div>
          <div className="loading-spinner" />
          <strong>Preparing your Business Center</strong>
          <p>Fetching your latest business information...</p>
        </div>
        <BottomNav active="dashboard" />

      <style jsx>{styles}</style>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mv-premium-dashboard error-screen">
        <div className="error-card">
          <div className="error-symbol">!</div>
          <div className="eyebrow">BUSINESS CENTER</div>
          <h1>We couldn't load your dashboard</h1>
          <p>{error}</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => loadDashboard(true)}
          >
            <Icon name="refresh" size={18} />
            Try again
          </button>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  async function deleteListing(listingId: string, listingTitle: string) {
    const confirmed = window.confirm(
      `Delete "${listingTitle}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setListingDeleteLoading(listingId);

    try {
      const response = await fetch(
        `${API_URL}/api/listings/${listingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete listing");
      }

      setListings((current) =>
        current.filter((listing) => listing._id !== listingId)
      );
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to delete listing"
      );
    } finally {
      setListingDeleteLoading(null);
    }
  }

  return (
    <main className="mv-premium-dashboard">
      <Header />
      <div className="dashboard-shell">


        <div className="business-dashboard-toolbar">
          <div>
            <span className="business-dashboard-eyebrow">
              BUSINESS CENTER
            </span>
            <strong>Manage your business</strong>
          </div>

          <div className="business-dashboard-actions">
            <button
              type="button"
              className="icon-action refresh-action"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
            >
              <span className={refreshing ? "spin" : ""}>
                <Icon name="refresh" size={19} />
              </span>
            </button>

            <button
              type="button"
              className="logout-action"
              onClick={logout}
              aria-label="Log out"
              title="Log out"
            >
              <Icon name="logout" size={18} />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* INTRO */}
        <section className="dashboard-intro">
          <div>
            <h1>
              Welcome back
              {business?.owner?.name
                ? `, ${business.owner.name.split(" ")[0]}`
                : ""}
              .
            </h1>
            <p>
              Everything you need to manage your MetroVybe business presence.
            </p>
          </div>

          {lastUpdated && (
            <div className="updated-pill">
              <span className="live-dot" />
              Updated{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </section>

        {/* BUSINESS HERO */}
        {business && (
          <section className="business-hero">
            <div className="business-hero-main">

              <div className="business-avatar">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.businessName || "Business"}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="business-identity">
                <div className="business-title-line">
                  <h2>{business.businessName || "Your Business"}</h2>

                  <span className={`verification-badge ${verificationTone}`}>
                    <Icon
                      name={
                        verificationStatus === "verified"
                          ? "check"
                          : verificationStatus === "pending"
                            ? "clock"
                            : "shield"
                      }
                      size={14}
                    />
                    {displayVerification}
                  </span>
                </div>

                <div className="business-meta">
                  <span>
                    <Icon name="building" size={16} />
                    {business.category || "Business"}
                  </span>
                  <span>
                    <Icon name="pin" size={16} />
                    {locationText}
                  </span>
                </div>

                <p className="business-description">
                  {business.description ||
                    "Build your presence, manage your listings and connect with customers across MetroVybe."}
                </p>
              </div>
            </div>

            <div className="hero-status">
              <span>ACCOUNT STATUS</span>
              <strong>
                {(business.status || "active").replace(/_/g, " ")}
              </strong>
            </div>
          </section>
        )}

        {/* KPI STATS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon green">
              <Icon name="grid" size={23} />
            </div>
            <div className="stat-copy">
              <span>Total listings</span>
              <strong>{listingStats.total}</strong>
              <small>Your business inventory</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Icon name="check" size={23} />
            </div>
            <div className="stat-copy">
              <span>Published</span>
              <strong>{publishedCount}</strong>
              <small>Visible to customers</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">
              <Icon name="clock" size={23} />
            </div>
            <div className="stat-copy">
              <span>Pending review</span>
              <strong>{pendingCount}</strong>
              <small>Awaiting approval</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Icon name="shield" size={23} />
            </div>
            <div className="stat-copy">
              <span>Profile status</span>
              <strong className="stat-word">
                {displayVerification}
              </strong>
              <small>Business verification</small>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="dashboard-grid">

          {/* LISTINGS */}
          <section className="panel listings-panel">
            <div className="panel-header">
              <div>
                <div className="panel-kicker">YOUR INVENTORY</div>
                <h2>My Listings</h2>
                <p>
                  Manage everything your customers can discover.
                </p>
              </div>

              <Link
                href="/business/listings/new"
                className="add-listing-button"
              >
                <Icon name="plus" size={19} />
                <span>Add listing</span>
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="empty-listings">
                <div className="empty-icon">
                  <Icon name="building" size={30} />
                </div>
                <h3>No listings yet</h3>
                <p>
                  Create your first listing and start reaching customers
                  on MetroVybe.
                </p>
                <Link
                  href="/business/listings/new"
                  className="empty-cta"
                >
                  Create your first listing
                  <Icon name="arrow" size={17} />
                </Link>
              </div>
            ) : (
              <>
              <div className="listing-stack">
                {(showAllListings ? listings : listings.slice(0, 3)).map((listing) => {
                  const status =
                    (listing.status || "pending").toLowerCase();

                  const statusClass =
                    status === "published"
                      ? "published"
                      : status === "pending"
                        ? "pending"
                        : status === "rejected"
                          ? "rejected"
                          : "other";

                  return (
                    <article
                      key={listing._id}
                      className="listing-card"
                    >
                      <div className="listing-thumb">
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.title}
                          />
                        ) : (
                          <Icon name="building" size={27} />
                        )}
                      </div>

                      <div className="listing-content">
                        <div className="listing-topline">
                          <h3>{listing.title}</h3>
                          <span
                            className={`listing-status ${statusClass}`}
                          >
                            <i />
                            {status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="listing-details">
                          {listing.category && (
                            <span>{listing.category}</span>
                          )}

                          {listing.location && (
                            <span>
                              <Icon name="pin" size={14} />
                              {listing.location}
                            </span>
                          )}

                          {listing.price && (
                            <span>{listing.price}</span>
                          )}
                        </div>
                      </div>

                      <div className="listing-actions">
                <Link
                  href={`/business/listings/edit/${listing._id}`}
                  className="listing-edit-button"
                  aria-label={`Edit ${listing.title}`}
                  title="Edit listing"
                >
                  <span className="listing-edit-pencil" aria-hidden="true">✎</span>
                </Link>

                <button
                  type="button"
                  className="listing-delete-button"
                  onClick={() =>
                    deleteListing(listing._id, listing.title)
                  }
                  disabled={listingDeleteLoading === listing._id}
                  aria-label={`Delete ${listing.title}`}
                  title="Delete listing"
                >
                  {listingDeleteLoading === listing._id
                    ? "..."
                    : "×"}
                </button>
              </div>
                    </article>
                  );
                })}
              </div>

              {listings.length > 3 && (
                <div className="listings-expand-wrap">
                  <button
                    type="button"
                    className={`listings-show-more ${showAllListings ? "is-open" : ""}`}
                    onClick={() =>
                      setShowAllListings((current) => !current)
                    }
                    aria-label={
                      showAllListings
                        ? "Show fewer listings"
                        : "Show more listings"
                    }
                    title={showAllListings ? "Show less" : "Show more"}
                  >
                    <span className="listings-show-more-count">
                      {showAllListings
                        ? "−"
                        : `+${listings.length - 3}`}
                    </span>
                    <Icon name="arrow" size={15} />
                  </button>
                </div>
              )}

              </>
            )}

            {otherCount > 0 && (
              <div className="listing-note">
                {otherCount} additional listing
                {otherCount === 1 ? "" : "s"} with other status.
              </div>
            )}
          </section>

          {/* CUSTOMER BOOKINGS */}
          <section className="panel bookings-panel">
            <div className="panel-header">
              <div>
                <div className="panel-kicker">CUSTOMER ACTIVITY</div>
                <h2>Customer Bookings</h2>
                <p>
                  Manage booking requests from your customers.
                </p>
              </div>

              <span className="booking-count-badge">
                {businessBookings.length}{" "}
                {businessBookings.length === 1 ? "booking" : "bookings"}
              </span>
            </div>

            {businessBookings.length === 0 ? (
              <div className="empty-bookings">
                <div className="empty-booking-icon">
                  <Icon name="clock" size={28} />
                </div>
                <h3>No bookings yet</h3>
                <p>
                  Customer booking requests will appear here.
                </p>
              </div>
            ) : (
              <div className="booking-stack">
                {(showAllBookings
                  ? businessBookings
                  : businessBookings.slice(0, 3)
                ).map((booking) => {
                  const customer =
                    typeof booking.customer === "object" &&
                    booking.customer
                      ? booking.customer
                      : null;

                  const listing =
                    typeof booking.listing === "object" &&
                    booking.listing
                      ? booking.listing
                      : null;

                  const customerName =
                    customer?.name || "Customer";

                  const listingName =
                    listing?.title ||
                    booking.listingTitle ||
                    "Listing";

                  const bookingStatus =
                    (booking.status || "pending").toLowerCase();

                  const statusTone =
                    bookingStatus === "confirmed"
                      ? "confirmed"
                      : bookingStatus === "rejected" ||
                          bookingStatus === "cancelled"
                        ? "rejected"
                        : bookingStatus === "completed"
                          ? "completed"
                          : "pending";

                  return (
                    <article
                      key={booking._id}
                      className="booking-card"
                    >
                      <div className="booking-avatar">
                        {customerName.charAt(0).toUpperCase()}
                      </div>

                      <div className="booking-content">
                        <div className="booking-topline">
                          <div>
                            <h3>{customerName}</h3>
                            <span className="booking-listing-name">
                              {listingName}
                            </span>
                          </div>

                          <span
                            className={`booking-status ${statusTone}`}
                          >
                            <i />
                            {bookingStatus}
                          </span>
                        </div>

                        <div className="booking-details">
                          {booking.bookingDate && (
                            <span>
                              <Icon name="clock" size={13} />
                              {new Date(
                                booking.bookingDate
                              ).toLocaleDateString()}
                            </span>
                          )}

                          {customer?.email && (
                            <span>{customer.email}</span>
                          )}

                          {customer?.phone && (
                            <span>{customer.phone}</span>
                          )}
                        </div>

                        {booking.message && (
                          <div className="booking-message">
                            "{booking.message}"
                          </div>
                        )}

                        {bookingStatus === "pending" && (
                          <div className="booking-actions">
                            <button
                              type="button"
                              className="booking-action confirm"
                              disabled={
                                bookingActionLoading === booking._id
                              }
                              onClick={() =>
                                updateBookingStatus(
                                  booking._id,
                                  "confirmed"
                                )
                              }
                            >
                              {bookingActionLoading === booking._id
                                ? "Updating..."
                                : "Confirm"}
                            </button>

                            <button
                              type="button"
                              className="booking-action reject"
                              disabled={
                                bookingActionLoading === booking._id
                              }
                              onClick={() =>
                                updateBookingStatus(
                                  booking._id,
                                  "rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {bookingStatus === "confirmed" && (
                          <div className="booking-actions">
                            <button
                              type="button"
                              className="booking-action complete"
                              disabled={
                                bookingActionLoading === booking._id
                              }
                              onClick={() =>
                                updateBookingStatus(
                                  booking._id,
                                  "completed"
                                )
                              }
                            >
                              Mark completed
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>


            )}
            {businessBookings.length > 3 && (
              <div className="bookings-expand-wrap">
                <button
                  type="button"
                  className={`bookings-show-more ${showAllBookings ? "is-open" : ""}`}
                  onClick={() => setShowAllBookings((current) => !current)}
                  aria-label={showAllBookings ? "Show fewer bookings" : "Show more bookings"}
                  title={showAllBookings ? "Show less" : "Show more"}
                >
                  <span className="bookings-show-more-count">
                    {businessBookings.length}
                  </span>
                  <Icon name="arrow" size={16} />
                </button>
              </div>
            )}

</section>

          {/* RIGHT COLUMN */}
          <aside className="side-column">

            {/* VERIFICATION */}
            <section className="panel verification-panel">
              <div className="verification-top">
                <div className="large-panel-icon">
                  <Icon name="shield" size={25} />
                </div>

                <span
                  className={`mini-status ${verificationTone}`}
                >
                  {displayVerification}
                </span>
              </div>

              <h2>Business verification</h2>

              <p>
                Keep your business profile verified to build trust with
                customers.
              </p>

              <div className="verification-line">
                <div>
                  <span>Current status</span>
                  <strong>{displayVerification}</strong>
                </div>

                {business?.verifiedAt && (
                  <div>
                    <span>Verified on</span>
                    <strong>
                      {new Date(
                        business.verifiedAt
                      ).toLocaleDateString()}
                    </strong>
                  </div>
                )}
              </div>

              {business?.rejectionReason && (
                <div className="rejection-box">
                  <strong>Review note</strong>
                  <span>{business.rejectionReason}</span>
                </div>
              )}
            </section>

            {/* PROFILE */}
            {business && (
              <section className="panel profile-panel">
                <div className="panel-small-header">
                  <div>
                    <div className="panel-kicker">PROFILE</div>
                    <h2>Business details</h2>
                  </div>

                  {!editingProfile ? (
                    <button
                      type="button"
                      className="small-icon"
                      onClick={startProfileEdit}
                      aria-label="Edit business details"
                      title="Edit business details"
                    >
                      <Icon name="edit" size={17} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="small-icon"
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileSaveError("");
                      }}
                      aria-label="Cancel editing"
                      title="Cancel"
                    >
                      <span aria-hidden="true" style={{ fontSize: "20px", lineHeight: 1 }}>×</span>
                    </button>
                  )}
                </div>

                {editingProfile ? (
                  <div className="profile-inline-editor">
            {(contactMessage || contactError) && (
              <div
                className={
                  contactError
                    ? "profile-contact-message profile-contact-error"
                    : "profile-contact-message profile-contact-success"
                }
              >
                {contactError || contactMessage}
              </div>
            )}

                    <div className="profile-business-name-row">
                      <div className="profile-logo-upload-field">
                        <div className="profile-logo-upload-preview">
                        {profileForm.logo ? (
                          <img
                            src={profileForm.logo}
                            alt="Business DP"
                            className="profile-logo-upload-image"
                          />
                        ) : (
                          <div className="profile-logo-upload-placeholder">
                            {profileForm.businessName?.charAt(0)?.toUpperCase() || "B"}
                          </div>
                        )}

                        <div className="profile-logo-overlay-actions">
                          <label
                            htmlFor="business-dp-upload"
                            className="profile-logo-upload-button"
                            title="Upload photo"
                            aria-label="Upload photo"
                          >
                            {uploadingLogo ? "…" : "↑"}
                          </label>

                          {profileForm.logo && (
                            <button
                              type="button"
                              className="profile-logo-remove-button"
                              title="Remove photo"
                              aria-label="Remove photo"
                              onClick={() => {
                                setProfileForm((current) => ({
                                  ...current,
                                  logo: "",
                                }));
                                setLogoUploadError("");
                              }}
                              disabled={uploadingLogo}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        id="business-dp-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        hidden
                      />

                      {logoUploadError && (
                        <p className="profile-logo-upload-error">
                          {logoUploadError}
                        </p>
                      )}
                      </div>

                      <label className="profile-inline-field profile-business-name-field">
                        <span>Business name</span>
                        <input
                          value={profileForm.businessName}
                          onChange={(e) =>
                            setProfileForm((current) => ({
                              ...current,
                              businessName: e.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="profile-inline-grid">

                      <label className="profile-inline-field profile-business-name-hidden">
                        <span>Business name</span>
                        <input
                          value={profileForm.businessName}
                          onChange={(e) =>
                            setProfileForm((current) => ({
                              ...current,
                              businessName: e.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className="profile-inline-field">
                <span>Business category *</span>
                <select
                  value={profileForm.category}
                  onChange={(e) =>
                    setProfileForm((current) => ({
                      ...current,
                      category: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Stay">Stay</option>
                  <option value="Eat">Eat</option>
                  <option value="Live">Live</option>
                  <option value="Move">Move</option>
                  <option value="Travel">Travel</option>
                </select>
              </label>

              <label className="profile-inline-field profile-description-field">
                <span>Business description</span>
                <textarea
                  value={profileForm.description}
                  onChange={(e) =>
                    setProfileForm((current) => ({
                      ...current,
                      description: e.target.value.slice(0, 500),
                    }))
                  }
                  placeholder="Tell customers about your business..."
                  maxLength={500}
                  rows={4}
                />
                <small>{profileForm.description.length}/500</small>
              </label>

              <div className="profile-inline-field profile-location-fields" style={{ gridColumn: "1 / -1" }}>
                <span>Business map location *</span>

                <div className="profile-business-map-picker">
                  <ListingLocationPicker
                    initialLocation={{
                      latitude:
                        Number(profileForm.location.latitude) || 28.6139,
                      longitude:
                        Number(profileForm.location.longitude) || 77.209,
                    }}
                    onConfirm={(location) => {
                      setProfileForm((current) => ({
                        ...current,
                        location: {
                          latitude: String(location.latitude),
                          longitude: String(location.longitude),
                        },
                        address:
                          location.address || current.address,
                        city:
                          location.city || current.city,
                        state:
                          location.state || current.state,
                        pincode:
                          location.pincode || current.pincode,
                      }));
                    }}
                  />
                </div>

                <small>
                  Search your business address, tap the map, or drag the pin to set the exact location.
                </small>
              </div>

              <div className="profile-inline-field profile-hours-field">
                <div className="profile-hours-heading">
                  <span className="profile-hours-title">
                    <span className="profile-hours-clock" aria-hidden="true">◷</span>
                    Business hours
                  </span>
                  <small>Set your opening hours for each day</small>
                </div>

                <div className="profile-week-hours">
                  {[
                    ["monday", "Monday"],
                    ["tuesday", "Tuesday"],
                    ["wednesday", "Wednesday"],
                    ["thursday", "Thursday"],
                    ["friday", "Friday"],
                    ["saturday", "Saturday"],
                    ["sunday", "Sunday"],
                  ].map(([dayKey, dayLabel]) => {
                    const day = profileForm.businessHours[dayKey as keyof typeof profileForm.businessHours];

                    return (
                      <div className="profile-day-hours" key={dayKey}>
                        <strong>{dayLabel}</strong>

                        <label className="profile-day-closed">
                          <input
                            type="checkbox"
                            checked={Boolean(day?.closed)}
                            onChange={(e) =>
                              setProfileForm((current) => ({
                                ...current,
                                businessHours: {
                                  ...current.businessHours,
                                  [dayKey]: {
                                    ...(current.businessHours[
                                      dayKey as keyof typeof current.businessHours
                                    ] as { open?: string; close?: string; closed?: boolean }),
                                    closed: e.target.checked,
                                  },
                                },
                              }))
                            }
                          />
                          <span>Closed</span>
                        </label>

                        {!day?.closed && (
                          <div className="profile-day-times">
                            <input
                              type="time"
                              aria-label={`${dayLabel} opening time`}
                              value={day?.open || ""}
                              onChange={(e) =>
                                setProfileForm((current) => ({
                                  ...current,
                                  businessHours: {
                                    ...current.businessHours,
                                    [dayKey]: {
                                      ...(current.businessHours[
                                        dayKey as keyof typeof current.businessHours
                                      ] as object),
                                      open: e.target.value,
                                    },
                                  },
                                }))
                              }
                            />
                            <span>to</span>
                            <input
                              type="time"
                              aria-label={`${dayLabel} closing time`}
                              value={day?.close || ""}
                              onChange={(e) =>
                                setProfileForm((current) => ({
                                  ...current,
                                  businessHours: {
                                    ...current.businessHours,
                                    [dayKey]: {
                                      ...(current.businessHours[
                                        dayKey as keyof typeof current.businessHours
                                      ] as object),
                                      close: e.target.value,
                                    },
                                  },
                                }))
                              }
                            />
                          </div>
                        )}

                        {day?.closed && (
                          <span className="profile-day-closed-text">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="profile-contact-grid">
                <div className="profile-contact-column profile-email-column">
                  <label className="profile-inline-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((current) => ({
                          ...current,
                          email: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <div className="profile-contact-action">
                    <button
                      type="button"
                      className="profile-contact-verify"
                      onClick={requestEmailChange}
                      disabled={contactLoading}
                    >
                      Verify new email
                    </button>
                  </div>
                </div>

                <div className="profile-contact-column profile-phone-column">
                  <label className="profile-inline-field">
                    <span>Phone</span>
                    <div className="profile-phone-input">
                      <select
                        className="profile-phone-code"
                        value={
                          profileForm.phone.match(/^\+(91|1|44|61|65|64|971)/)?.[0] ||
                          "+91"
                        }
                        aria-label="Country code"
                        onChange={(e) => {
                          const newCode = e.target.value;
                          const number = (profileForm.phone || "")
                            .replace(/^\+(91|1|44|61|65|64|971)/, "")
                            .replace(/\D/g, "")
                            .slice(0, 10);

                          setProfileForm((current) => ({
                            ...current,
                            phone: `${newCode}${number}`,
                          }));
                        }}
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+64">🇳🇿 +64</option>
                        <option value="+971">🇦🇪 +971</option>
                      </select>

                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={(profileForm.phone || "")
                          .replace(/^\+(91|1|44|61|65|64|971)/, "")
                          .replace(/\D/g, "")
                          .slice(0, 10)}
                        onChange={(e) => {
                          const digits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                          const code =
                            profileForm.phone.match(
                              /^\+(91|1|44|61|65|64|971)/
                            )?.[0] || "+91";

                          setProfileForm((current) => ({
                            ...current,
                            phone: `${code}${digits}`,
                          }));
                        }}
                      />
                    </div>
                  </label>

                  <div className="profile-contact-action profile-phone-verify">
                    <button
                      type="button"
                      className="profile-contact-verify"
                      onClick={requestPhoneChange}
                      disabled={contactLoading || !profileForm.phone}
                    >
                      {contactLoading ? "Sending..." : "Send OTP"}
                    </button>

                    {phoneOtpSent && (
                      <div className="profile-otp-row">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={phoneOtp}
                          onChange={(e) =>
                            setPhoneOtp(
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                        />
                        <button
                          type="button"
                          className="profile-contact-verify"
                          onClick={verifyPhoneChange}
                          disabled={contactLoading || phoneOtp.length !== 6}
                        >
                          {contactLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <label className="profile-inline-field">
                        <span>Address</span>
                        <input
                          value={profileForm.address}
                          onChange={(e) =>
                            setProfileForm((current) => ({
                              ...current,
                              address: e.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className="profile-inline-field">
                        <span>City</span>
                        <input
                          value={profileForm.city}
                          onChange={(e) =>
                            setProfileForm((current) => ({
                              ...current,
                              city: e.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className="profile-inline-field">
                        <span>State</span>
                        <input
                          value={profileForm.state}
                          onChange={(e) =>
                            setProfileForm((current) => ({
                              ...current,
                              state: e.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className="profile-inline-field">
                        <span>Pincode</span>
                        <input
                          value={profileForm.pincode}
                          onChange={(e) =>
                            setProfileForm((current) => ({
                              ...current,
                              pincode: e.target.value,
                            }))
                          }
                        />
                      </label>

                    </div>

                    {profileSaveError && (
                      <div className="profile-inline-error">
                        {profileSaveError}
                      </div>
                    )}

                    <div className="profile-inline-actions">
                      <button
                        type="button"
                        className="profile-inline-cancel"
                        onClick={() => {
                          setEditingProfile(false);
                          setProfileSaveError("");
                        }}
                        disabled={savingProfile}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="profile-inline-save"
                        onClick={saveProfile}
                        disabled={savingProfile}
                      >
                        {savingProfile ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-details">

                    <div className="detail-row">
                      <div className="detail-icon">
                        <Icon name="mail" size={17} />
                      </div>
                      <div>
                        <span>Email</span>
                        <strong>
                          {business.email ||
                            business.owner?.email ||
                            "Not provided"}
                        </strong>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-icon">
                        <Icon name="phone" size={17} />
                      </div>
                      <div>
                        <span>Phone</span>
                        <strong>
                          {business.phone ||
                            business.owner?.phone ||
                            "Not provided"}
                        </strong>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-icon">
                        <Icon name="pin" size={17} />
                      </div>
                      <div>
                        <span>Location</span>
                        <strong>{locationText}</strong>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-icon">
                        <Icon name="building" size={17} />
                      </div>
                      <div>
                        <span>Address</span>
                        <strong>
                          {business.address || "Address not provided"}
                        </strong>
                      </div>
                    </div>

                  </div>
                )}
              </section>


            )}

          
            {/* DELETE ACCOUNT */}
            <section className="panel profile-delete-panel">
              <div className="profile-delete-content">
                <div>
                  <div className="panel-kicker profile-delete-kicker">DANGER ZONE</div>
                  <h2>Delete account</h2>
                  <p>
                    Permanently delete your MetroVybe account and associated data.
                    This action cannot be undone.
                  </p>
                </div>

                <div className="profile-delete-confirm">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteAccountError("");
                    }}
                    placeholder="Enter your password to confirm"
                    autoComplete="current-password"
                  />

                  {deleteAccountError && (
                    <p className="profile-delete-error">{deleteAccountError}</p>
                  )}

                  <button
                    type="button"
                    className="profile-delete-button"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                  >
                    {deletingAccount ? "Deleting account..." : "Delete account"}
                  </button>
                </div>
              </div>
            </section>

</aside>
        </div>


      </div>

      <BottomNav active="dashboard" />
      <style jsx>{styles}


</style>
    </main>
  );
}

const styles = `
  .profile-delete-panel {
    border: 1.5px solid #f1c7c7 !important;
    background: #fffafa !important;
  }

  .profile-delete-content {
    display: grid;
    gap: 18px;
  }

  .profile-delete-kicker {
    color: #c62828 !important;
  }

  .profile-delete-content h2 {
    margin: 5px 0 7px;
    color: #7f1d1d;
  }

  .profile-delete-content p {
    margin: 0;
    color: #7a5a5a;
    font-size: 13px;
    line-height: 1.55;
  }

  .profile-delete-confirm {
    display: grid;
    gap: 10px;
  }

  .profile-delete-confirm input {
    width: 100%;
    height: 46px;
    padding: 0 14px;
    border: 1px solid #e5baba;
    border-radius: 10px;
    background: #fff;
    font: inherit;
    outline: none;
  }

  .profile-delete-confirm input:focus {
    border-color: #c62828;
    box-shadow: 0 0 0 3px rgba(198, 40, 40, .08);
  }

  .profile-delete-button {
    width: fit-content;
    min-height: 42px;
    padding: 0 16px;
    border: 0;
    border-radius: 10px;
    background: #c62828;
    color: #fff;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  .profile-delete-button:disabled {
    opacity: .6;
    cursor: not-allowed;
  }

  .profile-delete-error {
    color: #b42318 !important;
    font-size: 12px !important;
    font-weight: 700;
  }


  /* Compact Business Hours day slider */
  .profile-hours-field {
    grid-column: 1 / -1;
    min-width: 0;
  }

  .profile-week-hours {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(155px, 190px);
    grid-template-columns: none;
    gap: 10px;
    overflow-x: auto;
    padding: 4px 2px 12px;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }

  .profile-day-hours {
    scroll-snap-align: start;
    min-height: 132px;
    padding: 13px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 9px;
    border: 1px solid #dce7e3;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 4px 14px rgba(16, 24, 21, .04);
  }

  .profile-day-hours > strong {
    font-size: 13px;
    line-height: 1;
  }

  .profile-day-closed {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    cursor: pointer;
  }

  .profile-day-closed input {
    width: 14px;
    height: 14px;
    margin: 0;
    accent-color: #29ab87;
  }

  .profile-day-times {
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .profile-day-times input {
    width: 100%;
    height: 32px;
    padding: 4px 7px;
    font-size: 11px;
  }

  .profile-day-times span {
    display: none;
  }

  .profile-day-closed-text {
    margin-top: auto;
    padding: 8px;
    border-radius: 8px;
    background: #f4f6f5;
    color: #6b7470;
    text-align: center;
    font-size: 11px;
    font-weight: 700;
  }

  @media (max-width: 700px) {
    .profile-week-hours {
      grid-auto-columns: minmax(145px, 78vw);
      gap: 9px;
      padding-bottom: 10px;
    }

    .profile-day-hours {
      min-height: 125px;
      padding: 12px;
    }
  }

  @media (max-width: 700px) {
    .profile-delete-button {
      width: 100%;
    }
  }


  * {
    box-sizing: border-box;
  }

  .business-dashboard-toolbar {
    min-height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 28px;
    padding: 0 2px;
  }

  .business-dashboard-eyebrow {
    display: block;
    margin-bottom: 4px;
    color: #188a6e;
    font-size: 9px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: 1px;
  }

  .business-dashboard-toolbar strong {
    display: block;
    color: #171b19;
    font-size: 15px;
    line-height: 1.2;
    font-weight: 900;
  }

  .business-dashboard-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  .business-dashboard-actions .logout-action {
    gap: 7px;
    padding: 0 13px;
  }

  .mv-premium-dashboard .dashboard-shell {
    padding-bottom: 70px;
  }

  @media (max-width: 700px) {
    .mv-premium-dashboard .dashboard-shell {
      width: calc(100% - 20px);
      padding-top: 12px;
      padding-bottom: 118px;
    }

    .business-dashboard-toolbar {
      min-height: 48px;
      margin-bottom: 20px;
      gap: 10px;
    }

    .business-dashboard-eyebrow {
      font-size: 8px;
      letter-spacing: .8px;
    }

    .business-dashboard-toolbar strong {
      font-size: 13px;
    }

    .business-dashboard-actions {
      gap: 6px;
    }

    .business-dashboard-actions .icon-action,
    .business-dashboard-actions .logout-action {
      width: 40px;
      height: 40px;
      min-width: 40px;
      padding: 0;
      border-radius: 12px;
    }

    .business-dashboard-actions .logout-action span {
      display: none;
    }

    .mv-premium-dashboard .site-footer {
      padding-bottom: 105px !important;
    }
  }

  @media (max-width: 420px) {
    .mv-premium-dashboard .dashboard-shell {
      width: calc(100% - 16px);
      padding-bottom: 112px;
    }

    .business-dashboard-toolbar {
      margin-bottom: 17px;
    }

    .business-dashboard-toolbar strong {
      font-size: 12px;
    }
  }

  .profile-inline-editor {
    width: 100%;
    margin-top: 18px;
  }

  .profile-inline-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 15px 16px;
  }

  .profile-inline-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .profile-inline-field span {
    display: block;
    color: #66716d;
    font-size: 10px;
    line-height: 1;
    font-weight: 850;
    letter-spacing: .75px;
    text-transform: uppercase;
  }

  .profile-phone-input {
    width: 100%;
    height: 43px;
    display: flex;
    align-items: center;
    border: 1.5px solid #dfe5e2;
    border-radius: 11px;
    background: #f9fbfa;
    overflow: hidden;
    box-sizing: border-box;
    transition:
      border-color .16s ease,
      background .16s ease,
      box-shadow .16s ease;
  }

  .profile-phone-input:focus-within {
    border-color: #29ab87;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(41,171,135,.10);
  }

  .profile-phone-code {
    height: 100%;
    display: block;
    flex: 0 0 70px;
    width: 70px;
    min-width: 0;
    max-width: 70px;
    box-sizing: border-box;
    align-items: center;
    padding: 0 6px;
    border: 0 !important;
    border-right: 0 !important;
    outline: none !important;
    color: #39413e;
    background: transparent !important;
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
    box-shadow: none !important;
  }

  .profile-phone-input input {
    flex: 1;
    width: 100%;
    min-width: 0;
    height: 100%;
    padding: 0 11px;
    border: 0 !important;
    border-radius: 0 !important;
    outline: none !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .profile-inline-field input {
    width: 100%;
    height: 43px;
    min-width: 0;
    padding: 0 12px;
    border: 1.5px solid #dfe5e2;
    border-radius: 11px;
    outline: none;
    background: #f9fbfa;
    color: #151817;
    font-family: inherit;
    font-size: 13px;
    line-height: 1;
    font-weight: 650;
    box-sizing: border-box;
    transition:
      border-color .16s ease,
      background .16s ease,
      box-shadow .16s ease;
  }

  .profile-inline-field input:hover {
    border-color: #cbd5d1;
    background: #fff;
  }

  .profile-inline-field input:focus {
    border-color: #29ab87;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(41,171,135,.10);
  }

  .profile-inline-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 9px;
    margin-top: 18px;
    padding-top: 15px;
    border-top: 1px solid #edf0ef;
  }

  .profile-inline-cancel,
  .profile-inline-save {
    height: 38px;
    padding: 0 16px;
    border-radius: 10px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
    transition: all .16s ease;
  }

  .profile-inline-cancel {
    border: 1.5px solid #dfe5e2;
    background: #fff;
    color: #59625f;
  }

  .profile-inline-cancel:hover {
    border-color: #c7d0cc;
    background: #f7f9f8;
  }

  .profile-inline-save {
    border: 1.5px solid #29ab87;
    background: #29ab87;
    color: #fff;
    box-shadow: 0 5px 14px rgba(41,171,135,.16);
  }

  .profile-inline-save:hover {
    background: #218f72;
    border-color: #218f72;
    transform: translateY(-1px);
    box-shadow: 0 7px 18px rgba(41,171,135,.22);
  }

  .profile-inline-cancel:disabled,
  .profile-inline-save:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .profile-inline-error {
    margin-top: 12px;
    padding: 9px 11px;
    border: 1px solid #f0cccc;
    border-radius: 9px;
    background: #fff6f6;
    color: #b42318;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 700;
  }

  .profile-panel .small-icon {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    padding: 0;
    border: 1.5px solid #aeb5b2;
    border-radius: 16px;
    background: #fff;
    color: #68716e;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all .18s ease;
  }

  .profile-panel .small-icon:hover {
    color: #29ab87;
    border-color: #29ab87;
    background: #f4fbf8;
    transform: translateY(-1px);
    box-shadow: 0 7px 18px rgba(0,0,0,.07);
  }

  @media (max-width: 700px) {
    .profile-inline-editor {
      margin-top: 14px;
    }

    .profile-inline-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .profile-inline-field input {
      height: 44px;
    }

    .profile-inline-actions {
      justify-content: stretch;
    }

    .profile-inline-cancel,
    .profile-inline-save {
      flex: 1;
    }

    .profile-panel .small-icon {
      width: 42px;
      height: 42px;
      flex-basis: 42px;
      border-radius: 13px;
    }
  }

  .mv-premium-dashboard {
    min-height: 100vh;
    background:
      radial-gradient(circle at 85% 0%, rgba(41,171,135,.08), transparent 28%),
      #f5f7f8;
    color: #101312;
  }

  .dashboard-shell {
    width: min(1380px, calc(100% - 48px));
    margin: 0 auto;
    padding: 24px 0 42px;
  }

  .premium-header {
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 44px;
  }

  .brand {
    text-decoration: none;
    color: #101312;
    font-size: 30px;
    font-weight: 950;
    letter-spacing: -1.7px;
  }

  .brand span,
  .dashboard-footer span span {
    color: #29ab87;
  }

  .brand sup {
    color: #d4a72c;
    font-size: 14px;
    margin-left: 3px;
    top: -11px;
    position: relative;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon-action,
  .logout-action {
    height: 44px;
    border: 1px solid #e1e6e4;
    background: rgba(255,255,255,.9);
    color: #151817;
    border-radius: 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: .18s ease;
  }

  .icon-action {
    width: 44px;
  }

  .logout-action {
    gap: 8px;
    padding: 0 15px;
    font-weight: 800;
    font-size: 13px;
  }

  .icon-action:hover,
  .logout-action:hover {
    border-color: #cfd8d4;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0,0,0,.06);
  }

  .spin {
    display: inline-flex;
    animation: dashboardSpin .8s linear infinite;
  }

  @keyframes dashboardSpin {
    to { transform: rotate(360deg); }
  }

  .dashboard-intro {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 30px;
    margin-bottom: 26px;
  }

  .eyebrow,
  .panel-kicker {
    font-size: 11px;
    letter-spacing: 1.7px;
    font-weight: 950;
    color: #29ab87;
  }

  .dashboard-intro h1 {
    margin: 8px 0 8px;
    font-size: clamp(32px, 4vw, 50px);
    line-height: .98;
    letter-spacing: -2.4px;
    font-weight: 950;
  }

  .dashboard-intro p {
    margin: 0;
    color: #707875;
    font-size: 15px;
    font-weight: 600;
  }

  .updated-pill {
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 13px;
    background: #fff;
    border: 1px solid #e5eae8;
    border-radius: 999px;
    color: #59625f;
    font-size: 12px;
    font-weight: 800;
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #29ab87;
    box-shadow: 0 0 0 4px rgba(41,171,135,.12);
  }

  .business-hero {
    background: #111514;
    color: #fff;
    border-radius: 28px;
    padding: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    box-shadow: 0 20px 50px rgba(16,22,20,.13);
    margin-bottom: 20px;
    overflow: hidden;
    position: relative;
  }

  .business-hero::after {
    content: "";
    position: absolute;
    width: 330px;
    height: 330px;
    right: -120px;
    top: -180px;
    border-radius: 50%;
    border: 70px solid rgba(41,171,135,.09);
  }

  .business-hero-main {
    display: flex;
    align-items: center;
    gap: 23px;
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  .business-avatar {
    width: 108px !important;
    height: 108px !important;
    min-width: 108px !important;
    border-radius: 27px !important;
    background: linear-gradient(135deg,#29ab87,#11735a);
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 4px solid rgba(255,255,255,.12);
    box-shadow: 0 14px 35px rgba(0,0,0,.28);
  }

  .business-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .business-avatar span {
    font-size: 38px;
    font-weight: 950;
    letter-spacing: -2px;
  }

  .business-identity {
    min-width: 0;
  }

  .business-title-line {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .business-title-line h2 {
    margin: 0;
    font-size: clamp(25px, 3vw, 36px);
    letter-spacing: -1.4px;
    font-weight: 950;
  }

  .verification-badge,
  .mini-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 999px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .verification-badge {
    padding: 7px 10px;
    font-size: 11px;
  }

  .verification-badge.verified,
  .mini-status.verified {
    background: rgba(41,171,135,.16);
    color: #68e4be;
  }

  .verification-badge.pending,
  .mini-status.pending {
    background: rgba(224,166,50,.15);
    color: #f0c76a;
  }

  .verification-badge.danger,
  .mini-status.danger {
    background: rgba(239,68,68,.14);
    color: #ff9999;
  }

  .business-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 10px;
    color: #aab5b1;
    font-size: 13px;
    font-weight: 700;
  }

  .business-meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .business-description {
    max-width: 670px;
    color: #89938f;
    margin: 13px 0 0;
    line-height: 1.55;
    font-size: 13px;
  }

  .hero-status {
    min-width: 145px;
    padding: 16px 18px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 17px;
    position: relative;
    z-index: 1;
  }

  .hero-status span {
    display: block;
    color: #7e8985;
    font-size: 9px;
    letter-spacing: 1.3px;
    font-weight: 950;
    margin-bottom: 5px;
  }

  .hero-status strong {
    text-transform: capitalize;
    font-size: 14px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 14px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: #fff;
    border: 1px solid #e7ebe9;
    border-radius: 20px;
    padding: 20px;
    display: flex;
    gap: 15px;
    align-items: center;
    min-height: 122px;
    box-shadow: 0 5px 18px rgba(0,0,0,.025);
  }

  .stat-icon {
    width: 49px;
    height: 49px;
    min-width: 49px;
    border-radius: 15px;
    display: grid;
    place-items: center;
  }

  .stat-icon.green {
    background: #e4f7f1;
    color: #15946f;
  }

  .stat-icon.blue {
    background: #e9f1ff;
    color: #3675d5;
  }

  .stat-icon.amber {
    background: #fff5dd;
    color: #c78a13;
  }

  .stat-icon.purple {
    background: #f0eaff;
    color: #7853c9;
  }

  .stat-copy span,
  .stat-copy small {
    display: block;
  }

  .stat-copy span {
    color: #747d79;
    font-size: 11px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: .7px;
  }

  .stat-copy strong {
    display: block;
    margin: 2px 0;
    font-size: 29px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -1px;
  }

  .stat-copy .stat-word {
    font-size: 20px;
    margin-top: 6px;
  }

  .stat-copy small {
    color: #a0a7a4;
    font-size: 10px;
    font-weight: 650;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: minmax(0,1.55fr) minmax(330px,.85fr);
    gap: 20px;
  }

  .side-column {
    display: grid;
    gap: 20px;
    align-content: start;
  }

  .panel {
    background: #fff;
    border: 1px solid #e6ebe9;
    border-radius: 24px;
    box-shadow: 0 5px 22px rgba(0,0,0,.025);
  }

  .listings-panel {
    padding: 26px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 22px;
  }

  .panel-header h2,
  .verification-panel h2,
  .profile-panel h2 {
    margin: 5px 0 4px;
    font-size: 22px;
    letter-spacing: -.8px;
    font-weight: 950;
  }

  .panel-header p,
  .verification-panel > p {
    margin: 0;
    color: #858d8a;
    font-size: 12px;
    font-weight: 600;
  }

  .add-listing-button,
  .empty-cta,
  .primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    text-decoration: none;
    border: 0;
    cursor: pointer;
    background: #29ab87;
    color: #fff;
    padding: 12px 16px;
    border-radius: 13px;
    font-size: 12px;
    font-weight: 900;
    box-shadow: 0 8px 18px rgba(41,171,135,.18);
  }

  .add-listing-button:hover,
  .empty-cta:hover,
  .primary-button:hover {
    background: #218d70;
  }

  .bookings-panel {
    margin-top: 18px;
  }

  .booking-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    padding: 7px 11px;
    border-radius: 999px;
    background: #e3f7f0;
    color: #178764;
    font-size: 10px;
    font-weight: 900;
  }

  .booking-stack {
    display: grid;
    gap: 10px;
  }

  .booking-card {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    padding: 14px;
    border: 1px solid #e8ecea;
    border-radius: 17px;
  }

  .booking-avatar {
    width: 43px;
    height: 43px;
    min-width: 43px;
    border-radius: 13px;
    background: #edf5f2;
    color: #239b78;
    display: grid;
    place-items: center;
    font-size: 15px;
    font-weight: 900;
  }

  .booking-content {
    min-width: 0;
    flex: 1;
  }

  .booking-topline {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .booking-topline h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 900;
  }

  .booking-listing-name {
    display: block;
    margin-top: 3px;
    color: #69736f;
    font-size: 11px;
    font-weight: 700;
  }

  .booking-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 8px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 900;
    text-transform: capitalize;
    flex-shrink: 0;
  }

  .booking-status i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
  }

  .booking-status.pending {
    background: #fff3d9;
    color: #b77a0b;
  }

  .booking-status.confirmed {
    background: #e3f7f0;
    color: #178764;
  }

  .booking-status.rejected {
    background: #fee8e8;
    color: #c34242;
  }

  .booking-status.completed {
    background: #eeeafd;
    color: #6855b8;
  }

  .booking-details {
    display: flex;
    flex-wrap: wrap;
    gap: 7px 13px;
    margin-top: 8px;
    color: #707975;
    font-size: 10px;
    font-weight: 700;
  }

  .booking-details span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .booking-message {
    margin-top: 9px;
    padding: 9px 10px;
    border-radius: 10px;
    background: #f7f9f8;
    color: #555f5b;
    font-size: 10px;
    line-height: 1.5;
  }

  .booking-actions {
    display: flex;
    gap: 7px;
    margin-top: 10px;
  }

  .booking-action {
    border: 0;
    border-radius: 9px;
    padding: 7px 11px;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .booking-action:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .booking-action.confirm,
  .booking-action.complete {
    background: #29ab87;
    color: #fff;
  }

  .booking-action.reject {
    background: #fee8e8;
    color: #c34242;
  }

  .empty-bookings {
    padding: 26px 16px;
    text-align: center;
    border: 1px dashed #dfe7e3;
    border-radius: 16px;
  }

  .empty-booking-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 10px;
    border-radius: 14px;
    background: #edf5f2;
    color: #239b78;
    display: grid;
    place-items: center;
  }

  .empty-bookings h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 900;
  }

  .empty-bookings p {
    margin: 5px 0 0;
    color: #737c78;
    font-size: 11px;
  }

  .listing-stack {
    display: grid;
    gap: 10px;
  }

  .listing-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px;
    border: 1px solid #e8ecea;
    border-radius: 17px;
    transition: .18s ease;
  }

  .listing-card:hover {
    border-color: #cfe2db;
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(0,0,0,.045);
  }

  .listing-thumb {
    width: 61px;
    height: 61px;
    min-width: 61px;
    border-radius: 14px;
    background: #edf5f2;
    color: #239b78;
    display: grid;
    place-items: center;
    overflow: hidden;
  }

  .listing-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .listing-content {
    min-width: 0;
    flex: 1;
  }

  .listing-topline {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }

  .listing-topline h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 900;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .listing-status {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 8px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .listing-status i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
  }

  .listing-status.published {
    background: #e3f7f0;
    color: #178764;
  }

  .listing-status.pending {
    background: #fff3d9;
    color: #b77a0b;
  }

  .listing-status.rejected {
    background: #fee8e8;
    color: #c34242;
  }

  .listing-status.other {
    background: #edf0f0;
    color: #69716e;
  }

  .listing-details {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
    color: #8b9490;
    font-size: 10px;
    font-weight: 650;
  }

  .listing-details span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .listing-arrow {
    width: 32px;
    height: 32px;
    min-width: 32px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    color: #8b9490;
    background: #f5f7f6;
  }

  .listing-note {
    margin-top: 14px;
    color: #9a9f9d;
    font-size: 10px;
    font-weight: 650;
  }

  .empty-listings {
    padding: 65px 20px 58px;
    text-align: center;
    border: 1px dashed #dce4e0;
    border-radius: 18px;
    background: #fbfcfc;
  }

  .empty-icon {
    width: 68px;
    height: 68px;
    margin: 0 auto 15px;
    border-radius: 20px;
    background: #e7f7f2;
    color: #239b78;
    display: grid;
    place-items: center;
  }

  .empty-listings h3 {
    margin: 0 0 7px;
    font-size: 17px;
    font-weight: 900;
  }

  .empty-listings p {
    max-width: 380px;
    margin: 0 auto 18px;
    color: #8a928f;
    font-size: 12px;
    line-height: 1.55;
  }

  .verification-panel,
  .profile-panel {
    padding: 23px;
  }

  .verification-top,
  .panel-small-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .large-panel-icon {
    width: 51px;
    height: 51px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background: #e6f7f1;
    color: #218d70;
  }

  .mini-status {
    padding: 6px 9px;
    font-size: 9px;
  }

  .verification-panel h2 {
    margin-top: 18px;
  }

  .verification-line {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 18px;
  }

  .verification-line > div {
    padding: 12px;
    border-radius: 13px;
    background: #f6f8f7;
  }

  .verification-line span,
  .verification-line strong {
    display: block;
  }

  .verification-line span {
    color: #8d9592;
    font-size: 9px;
    font-weight: 800;
    margin-bottom: 4px;
  }

  .verification-line strong {
    font-size: 12px;
    text-transform: capitalize;
  }

  .rejection-box {
    margin-top: 13px;
    padding: 12px;
    border-radius: 13px;
    background: #fff2f2;
    color: #9b4444;
  }

  .rejection-box strong,
  .rejection-box span {
    display: block;
  }

  .rejection-box strong {
    font-size: 10px;
    margin-bottom: 3px;
  }

  .rejection-box span {
    font-size: 11px;
    line-height: 1.45;
  }

  .panel-small-header h2 {
    margin-bottom: 0;
  }

  .small-icon {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    color: #6c7672;
    background: #f4f6f5;
    border-radius: 10px;
  }

  .profile-details {
    margin-top: 20px;
    display: grid;
    gap: 2px;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 0;
    border-bottom: 1px solid #edf0ef;
  }

  .detail-row:last-child {
    border-bottom: 0;
  }

  .detail-icon {
    width: 34px;
    height: 34px;
    min-width: 34px;
    display: grid;
    place-items: center;
    color: #299b7a;
    background: #edf8f4;
    border-radius: 10px;
  }

  .detail-row div:last-child {
    min-width: 0;
  }

  .detail-row span,
  .detail-row strong {
    display: block;
  }

  .detail-row span {
    color: #929996;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .5px;
    margin-bottom: 2px;
  }

  .detail-row strong {
    color: #222725;
    font-size: 11px;
    line-height: 1.4;
    word-break: break-word;
  }

  .dashboard-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px 3px 0;
    color: #939a97;
    font-size: 10px;
    font-weight: 650;
  }

  .dashboard-footer strong {
    color: #252a28;
    font-weight: 900;
  }

  .loading-screen,
  .error-screen {
    display: grid;
    place-items: center;
    padding: 30px;
    position: relative;
    overflow: hidden;
  }

  .loading-orb {
    position: absolute;
    width: 430px;
    height: 430px;
    border-radius: 50%;
    background: rgba(41,171,135,.07);
    filter: blur(2px);
  }

  .loading-content,
  .error-card {
    position: relative;
    z-index: 1;
    text-align: center;
    background: rgba(255,255,255,.88);
    border: 1px solid #e4eae7;
    border-radius: 26px;
    padding: 42px 38px;
    box-shadow: 0 20px 60px rgba(0,0,0,.07);
  }

  .loading-brand {
    font-size: 29px;
    font-weight: 950;
    letter-spacing: -1.5px;
    margin-bottom: 27px;
  }

  .loading-brand span {
    color: #29ab87;
  }

  .loading-brand sup {
    color: #d4a72c;
  }

  .loading-spinner {
    width: 38px;
    height: 38px;
    border: 3px solid #dce7e3;
    border-top-color: #29ab87;
    border-radius: 50%;
    margin: 0 auto 17px;
    animation: dashboardSpin .75s linear infinite;
  }

  .loading-content strong {
    display: block;
    font-size: 15px;
    margin-bottom: 6px;
  }

  .loading-content p,
  .error-card p {
    margin: 0;
    color: #7c8581;
    font-size: 12px;
  }

  .error-symbol {
    width: 56px;
    height: 56px;
    margin: 0 auto 17px;
    display: grid;
    place-items: center;
    border-radius: 17px;
    background: #fee9e9;
    color: #c74c4c;
    font-size: 25px;
    font-weight: 950;
  }

  .error-card h1 {
    margin: 8px 0 8px;
    font-size: 25px;
    letter-spacing: -1px;
  }

  .primary-button {
    margin-top: 22px;
  }

  @media (max-width: 1050px) {
    .stats-grid {
      grid-template-columns: repeat(2,1fr);
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .side-column {
      grid-template-columns: repeat(2,1fr);
    }
  }

  @media (max-width: 720px) {
    .dashboard-shell {
      width: min(100% - 28px, 1380px);
      padding-top: 12px;
    }

    .premium-header {
      margin-bottom: 30px;
    }

    .brand {
      font-size: 25px;
    }

    .logout-action {
      width: 44px;
      padding: 0;
    }

    .logout-action span {
      display: none;
    }

    .dashboard-intro {
      display: block;
    }

    .dashboard-intro h1 {
      font-size: 35px;
      letter-spacing: -1.8px;
    }

    .updated-pill {
      margin-top: 16px;
    }

    .business-hero {
      padding: 21px;
      border-radius: 22px;
      display: block;
    }

    .business-hero-main {
      align-items: flex-start;
      gap: 15px;
    }

    .business-avatar {
      width: 82px !important;
      height: 82px !important;
      min-width: 82px !important;
      border-radius: 21px !important;
    }

    .business-avatar span {
      font-size: 29px;
    }

    .business-title-line h2 {
      font-size: 22px;
    }

    .business-description {
      font-size: 12px;
    }

    .hero-status {
      margin-top: 18px;
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .stat-card {
      min-height: 108px;
      padding: 14px;
      border-radius: 17px;
      gap: 10px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 12px;
    }

    .stat-copy strong {
      font-size: 24px;
    }

    .stat-copy .stat-word {
      font-size: 16px;
    }

    .listings-panel,
    .verification-panel,
    .profile-panel {
      padding: 18px;
      border-radius: 20px;
    }

    .panel-header {
      align-items: flex-start;
    }

    .add-listing-button {
      width: 44px;
      height: 44px;
      padding: 0;
    }

    .add-listing-button span {
      display: none;
    }

    .listing-card {
      padding: 10px;
      gap: 10px;
    }

    .listing-thumb {
      width: 52px;
      height: 52px;
      min-width: 52px;
    }

    .listing-topline {
      display: block;
    }

    .listing-status {
      margin-top: 6px;
    }

    .listing-arrow {
      display: none;
    }

    .side-column {
      grid-template-columns: 1fr;
    }

    .dashboard-footer {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.5;
      gap: 4px;
    }

    .dashboard-footer > span {
      display: inline-flex;
      align-items: center;
      flex-wrap: nowrap;
      white-space: nowrap;
    }

    .dashboard-footer > span:last-child {
      display: block;
      margin-top: 0;
      white-space: nowrap;
    }

    .dashboard-footer .brand-lockup,
    .dashboard-footer .brand-lockup span,
    .dashboard-footer .brand-lockup sup {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
    }
  }

  @media (max-width: 420px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .business-meta {
      display: grid;
      gap: 7px;
    }

    .business-title-line {
      display: block;
    }

    .verification-badge {
      margin-top: 8px;
    }
  }

      .brand-lockup {
        display: flex;
        align-items: center;
        gap: 13px;
        min-width: 0;
      }

      .business-center-label {
        color: #1677ff;
        font-size: 12px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: 1.15px;
        white-space: nowrap;
        padding-left: 13px;
        border-left: 1px solid #d9e2ef;
      }

      @media (max-width: 640px) {
        .brand-lockup {
          gap: 9px;
        }

        .business-center-label {
          font-size: 8px;
          letter-spacing: 0.65px;
          padding-left: 9px;
        }
      }

/* ===== FOOTER MOBILE NO-WRAP FIX ===== */

.mv-dashboard-footer,
.dashboard-footer,
.premium-dashboard-footer {
  white-space: nowrap !important;
}

.mv-dashboard-footer > span,
.dashboard-footer > span,
.premium-dashboard-footer > span {
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  flex-wrap: nowrap !important;
}

@media (max-width: 600px) {
  .mv-dashboard-footer,
  .dashboard-footer,
  .premium-dashboard-footer {
    white-space: nowrap !important;
    flex-wrap: nowrap !important;
    font-size: 11px !important;
  }

  .mv-dashboard-footer > span,
  .dashboard-footer > span,
  .premium-dashboard-footer > span {
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }

  .mv-dashboard-footer > a,
  .dashboard-footer > a,
  .premium-dashboard-footer > a {
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }
}

@media (max-width: 380px) {
  .mv-dashboard-footer,
  .dashboard-footer,
  .premium-dashboard-footer {
    font-size: 10px !important;
  }
}



/* ===== CLEAN BUSINESS FOOTER ===== */

.dashboard-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  min-width: 0;
}

.footer-brand-line {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 14px;
  white-space: nowrap;
  width: max-content;
  max-width: 100%;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  font-weight: 900;
}

.footer-brand > span {
  display: inline !important;
  white-space: nowrap !important;
}

.footer-brand sup {
  display: inline !important;
  white-space: nowrap !important;
  margin-left: 2px;
}

.footer-business {
  display: inline-block;
  white-space: nowrap;
  color: #1677ff;
  font-weight: 800;
}

.footer-tagline {
  display: block;
  white-space: nowrap;
  margin: 0;
  color: #8a8f93;
  font-weight: 700;
}

@media (max-width: 600px) {
  .dashboard-footer {
    width: 100%;
    overflow: visible;
  }

  .footer-brand-line {
    gap: 10px;
    width: max-content;
    max-width: none;
  }

  .footer-brand,
  .footer-brand > span,
  .footer-brand sup,
  .footer-business,
  .footer-tagline {
    white-space: nowrap !important;
  }

  .footer-tagline {
    margin-top: 1px;
  }
}

  /* =========================================================
     BUSINESS DASHBOARD — RESPONSIVE MASTER PATCH
     ========================================================= */

  .mv-premium-dashboard {
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .mv-premium-dashboard > .dashboard-shell {
    width: min(1380px, calc(100% - 48px));
    margin: 0 auto;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.65fr) minmax(300px, .75fr);
    gap: 20px;
    align-items: start;
  }

  .listings-panel,
  .side-column,
  .panel,
  .listing-card,
  .listing-content {
    min-width: 0;
  }

  .listing-topline h3,
  .listing-details span,
  .detail-row strong {
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .business-dashboard-actions {
    flex-shrink: 0;
  }

  /* TABLET */
  @media (max-width: 1100px) {

    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .side-column {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }

  }

  /* MOBILE */
  @media (max-width: 800px) {

    .mv-premium-dashboard > .dashboard-shell {
      width: calc(100% - 24px);
      padding-top: 12px;
      padding-bottom: 120px;
    }

    .business-hero {
      padding: 22px;
      border-radius: 22px;
      flex-direction: column;
      align-items: stretch;
    }

    .business-hero-main {
      gap: 16px;
    }

    .business-avatar {
      width: 82px !important;
      height: 82px !important;
      min-width: 82px !important;
      border-radius: 21px !important;
    }

    .business-avatar span {
      font-size: 29px;
    }

    .hero-status {
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .side-column {
      grid-template-columns: 1fr;
    }

    .dashboard-intro {
      align-items: flex-start;
      flex-direction: column;
      gap: 12px;
    }

  }

  @media (max-width: 600px) {

    .mv-premium-dashboard > .dashboard-shell {
      width: calc(100% - 16px);
      padding-top: 8px;
      padding-bottom: 125px;
    }

    .business-dashboard-toolbar {
      min-height: 44px;
      margin-bottom: 16px;
      gap: 8px;
    }

    .business-dashboard-toolbar strong {
      font-size: 12px;
    }

    .business-dashboard-actions {
      gap: 6px;
    }

    .business-dashboard-actions .icon-action,
    .business-dashboard-actions .logout-action {
      width: 38px;
      height: 38px;
      min-width: 38px;
      padding: 0;
      border-radius: 11px;
    }

    .business-dashboard-actions .logout-action span {
      display: none;
    }

    .dashboard-intro h1 {
      font-size: 31px;
      letter-spacing: -1.6px;
    }

    .dashboard-intro p {
      font-size: 13px;
    }

    .business-hero {
      padding: 18px;
      gap: 16px;
      border-radius: 20px;
    }

    .business-title-line h2 {
      font-size: 24px;
    }

    .business-meta {
      gap: 7px 11px;
      font-size: 12px;
    }

    .business-description {
      font-size: 12px;
    }

    .stats-grid {
      gap: 8px;
    }

    .stat-card {
      min-height: 100px;
      padding: 14px;
      gap: 10px;
      border-radius: 16px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 12px;
    }

    .stat-copy strong {
      font-size: 20px;
    }

    .stat-copy span {
      font-size: 11px;
    }

    .stat-copy small {
      font-size: 9px;
    }

    .panel {
      border-radius: 18px;
    }

    .listing-card {
      grid-template-columns: 52px minmax(0, 1fr) 22px;
      gap: 10px;
      padding: 12px;
    }

    .listing-thumb {
      width: 52px;
      height: 52px;
      min-width: 52px;
    }

    .listing-topline {
      gap: 6px;
      align-items: flex-start;
      flex-direction: column;
    }

    .listing-status {
      align-self: flex-start;
    }

  }

  @media (max-width: 420px) {

    .mv-premium-dashboard > .dashboard-shell {
      width: calc(100% - 12px);
      padding-bottom: 125px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stat-card {
      min-height: 88px;
    }

    .business-avatar {
      width: 68px !important;
      height: 68px !important;
      min-width: 68px !important;
      border-radius: 18px !important;
    }

    .business-avatar span {
      font-size: 24px;
    }

    .business-title-line h2 {
      font-size: 21px;
    }

    .panel-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .add-listing-button {
      width: 100%;
      justify-content: center;
    }

  }

  /* MOBILE BOTTOM NAV / SAFE AREA */

  @media (max-width: 700px) {

    .mv-premium-dashboard {
      padding-bottom: env(safe-area-inset-bottom);
    }

    .mv-premium-dashboard .site-footer {
      margin-bottom: 8px;
    }

    .mv-premium-dashboard .bottom-nav {
      padding-bottom: max(8px, env(safe-area-inset-bottom));
    }

    .mv-premium-dashboard button,
    .mv-premium-dashboard select,
    .mv-premium-dashboard input {
      font-size: 16px;
    }

    .mv-premium-dashboard img {
      max-width: 100%;
    }

  }


  /* Secure contact verification UI */
  .profile-contact-action {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: -8px;
    margin-bottom: 4px;
  }

  .profile-contact-verify {
    appearance: none;
    border: 1.5px solid #29ab87;
    background: #f1fbf7;
    color: #168064;
    border-radius: 9px;
    padding: 8px 13px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .profile-contact-verify:hover:not(:disabled) {
    background: #29ab87;
    color: #fff;
  }

  .profile-contact-verify:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .profile-phone-verify {
    margin-top: -6px;
  }

  .profile-otp-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .profile-otp-row input {
    width: 155px;
    height: 36px;
    padding: 0 11px;
    border: 1.5px solid #d7dfda;
    border-radius: 9px;
    outline: none;
    font-size: 13px;
    font-weight: 600;
    background: #fff;
  }

  .profile-otp-row input:focus {
    border-color: #29ab87;
    box-shadow: 0 0 0 3px rgba(41,171,135,.10);
  }

  @media (max-width: 640px) {
    .profile-contact-action {
      margin-top: -4px;
    }

    .profile-otp-row {
      width: 100%;
    }

    .profile-otp-row input {
      flex: 1;
      min-width: 140px;
    }
  }


  /* Business description & hours */
  .profile-description-field {
    grid-column: 1 / -1;
  }

  .profile-description-field textarea {
    width: 100%;
    min-height: 105px;
    resize: vertical;
    padding: 13px 14px;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    font: inherit;
    color: inherit;
    outline: none;
    background: #fff;
  }

  .profile-description-field textarea:focus {
    border-color: #29ab87;
    box-shadow: 0 0 0 3px rgba(41, 171, 135, 0.12);
  }

  .profile-hours-field {
    grid-column: 1 / -1;
    padding: 15px;
    border: 1px solid #e8ecef;
    border-radius: 14px;
    background: #fafcfb;
  }

  .profile-hours-field > span {
    display: block;
    margin-bottom: 12px;
    font-weight: 700;
  }

  .profile-hours-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .profile-hours-row input[type="time"] {
    flex: 1;
    min-width: 0;
  }

  .profile-hours-separator {
    color: #6b7280;
    font-weight: 600;
  }

  .profile-hours-24 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 13px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  }

  @media (max-width: 600px) {
    .profile-hours-row {
      gap: 8px;
    }

    .profile-hours-field {
      padding: 13px;
    }
  }

  /* ===== PREMIUM DAILY BUSINESS HOURS ===== */
  .profile-hours-field {
    grid-column: 1 / -1;
    padding: 20px !important;
    border: 1px solid #e6ece9 !important;
    border-radius: 18px !important;
    background: linear-gradient(145deg, #ffffff, #f7fbf9) !important;
  }

  .profile-hours-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .profile-hours-heading > span {
    font-size: 16px !important;
    font-weight: 750 !important;
    color: #17211d !important;
  }

  .profile-hours-heading small {
    color: #78847f;
    font-size: 12px;
  }

  .profile-week-hours {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .profile-day-hours {
    display: grid;
    grid-template-columns: 110px minmax(210px, 1fr) auto;
    align-items: center;
    gap: 14px;
    min-height: 54px;
    padding: 7px 12px;
    border: 1px solid #edf1ef;
    border-radius: 12px;
    background: #fff;
    transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;
  }

  .profile-day-hours:hover {
    border-color: rgba(41, 171, 135, .35);
    box-shadow: 0 5px 16px rgba(22, 45, 35, .05);
    transform: translateY(-1px);
  }

  .profile-day-hours > strong {
    font-size: 14px;
    font-weight: 700;
    color: #26332d;
  }

  .profile-day-times {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .profile-day-times input[type="time"] {
    width: 130px;
    height: 38px;
    padding: 0 10px;
    border: 1px solid #e2e8e5;
    border-radius: 9px;
    background: #fbfdfc;
    font: inherit;
    font-size: 13px;
    color: #26332d;
    outline: none;
  }

  .profile-day-times input[type="time"]:focus {
    border-color: #29ab87;
    box-shadow: 0 0 0 3px rgba(41, 171, 135, .1);
    background: #fff;
  }

  .profile-day-times > span {
    color: #9aa49f;
    font-size: 12px;
    font-weight: 600;
  }

  .profile-day-closed {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 0 !important;
    padding: 7px 10px;
    border: 1px solid #e5e9e7;
    border-radius: 999px;
    background: #fafbfb;
    color: #68736e;
    font-size: 12px !important;
    font-weight: 650 !important;
    cursor: pointer;
    white-space: nowrap;
    transition: all .15s ease;
  }

  .profile-day-closed:has(input:checked) {
    border-color: #f0caca;
    background: #fff7f7;
    color: #b45353;
  }

  .profile-day-closed input {
    width: 14px !important;
    height: 14px !important;
    margin: 0 !important;
    accent-color: #b45353;
  }

  .profile-day-closed-text {
    grid-column: 2;
    color: #b45353;
    font-size: 13px;
    font-weight: 650;
  }

  @media (max-width: 700px) {
    .profile-hours-field {
      padding: 15px !important;
      border-radius: 15px !important;
    }

    .profile-hours-heading {
      display: block;
      margin-bottom: 14px;
    }

    .profile-hours-heading small {
      display: block;
      margin-top: 4px;
    }

    .profile-day-hours {
      grid-template-columns: 1fr auto;
      gap: 9px;
      padding: 10px;
    }

    .profile-day-times {
      grid-column: 1 / -1;
      grid-row: 2;
    }

    .profile-day-times input[type="time"] {
      flex: 1;
      width: auto;
    }

    .profile-day-closed-text {
      grid-column: 1;
      grid-row: 2;
    }
  }

  /* ===== BUSINESS HOURS CLEAN PREMIUM LAYOUT ===== */
  .profile-hours-field {
    grid-column: 1 / -1;
    width: 100%;
    padding: 22px !important;
    border: 1px solid rgba(41, 171, 135, 0.18);
    border-radius: 22px;
    background: linear-gradient(135deg, #ffffff 0%, #f7fbfa 100%);
  }

  .profile-hours-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .profile-hours-heading > span {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .profile-hours-heading small {
    color: #74807d;
    font-size: 13px;
  }

  .profile-week-hours {
    display: flex !important;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .profile-day-hours {
    display: grid !important;
    grid-template-columns: 135px minmax(0, 1fr) auto !important;
    align-items: center;
    gap: 14px !important;
    width: 100%;
    min-width: 0;
    padding: 12px 14px !important;
    border: 1px solid #e7ecea;
    border-radius: 14px;
    background: #fff;
    transition: border-color .2s ease, box-shadow .2s ease;
  }

  .profile-day-hours:hover {
    border-color: rgba(41, 171, 135, 0.4);
    box-shadow: 0 5px 16px rgba(20, 50, 43, 0.05);
  }

  .profile-day-hours > strong {
    font-size: 15px;
    font-weight: 700;
    color: #26312f;
  }

  .profile-day-times {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    min-width: 0;
    width: 100%;
  }

  .profile-day-times input[type="time"] {
    width: 100% !important;
    min-width: 0 !important;
    height: 42px;
    padding: 0 10px;
    border: 1px solid #dfe6e3;
    border-radius: 10px;
    background: #fafcfb;
    color: #26312f;
    font-size: 14px;
    box-sizing: border-box;
  }

  .profile-day-times > span {
    color: #9aa5a1;
    font-size: 13px;
    white-space: nowrap;
  }

  .profile-day-closed {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-width: auto !important;
    width: auto !important;
    padding: 8px 11px !important;
    margin: 0 !important;
    border: 1px solid #e0e6e3;
    border-radius: 10px;
    background: #fafcfb;
    cursor: pointer;
    white-space: nowrap;
  }

  .profile-day-closed input {
    width: 17px !important;
    height: 17px !important;
    margin: 0 !important;
    accent-color: #29ab87;
  }

  .profile-day-closed span {
    font-size: 12px !important;
    font-weight: 700 !important;
    letter-spacing: 0.05em;
    color: #65706d !important;
  }

  /* The row already shows the Closed control, so don't show it twice */
  .profile-day-closed-text {
    display: none !important;
  }

  @media (max-width: 700px) {
    .profile-hours-field {
      padding: 16px !important;
      border-radius: 18px;
    }

    .profile-hours-heading {
      display: block;
      margin-bottom: 14px;
    }

    .profile-hours-heading small {
      display: block;
      margin-top: 5px;
    }

    .profile-day-hours {
      grid-template-columns: 1fr auto !important;
      gap: 10px !important;
      padding: 12px !important;
    }

    .profile-day-times {
      grid-column: 1 / -1;
      grid-row: 2;
    }

    .profile-day-closed {
      grid-column: 2;
      grid-row: 1;
    }
  }

  /* ===== BUSINESS HOURS FINAL LAYOUT FIX ===== */
  .profile-week-hours {
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
  }

  .profile-day-hours {
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
    min-width: 0 !important;
    gap: 16px !important;
    padding: 14px 18px !important;
  }

  .profile-day-hours > strong {
    flex: 0 0 150px !important;
    min-width: 120px !important;
  }

  .profile-day-times {
    display: flex !important;
    align-items: center !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
    gap: 8px !important;
  }

  .profile-day-times input[type="time"] {
    flex: 1 1 0 !important;
    width: auto !important;
    min-width: 105px !important;
    max-width: 145px !important;
    height: 44px !important;
    padding: 0 10px !important;
    font-size: 14px !important;
  }

  .profile-day-times > span {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
  }

  .profile-day-closed {
    flex: 0 0 auto !important;
    display: inline-flex !important;
    align-items: center !important;
    width: auto !important;
    min-width: 92px !important;
    padding: 9px 12px !important;
    position: static !important;
  }

  .profile-day-closed span {
    display: inline !important;
    white-space: nowrap !important;
  }

  @media (max-width: 760px) {
    .booking-card {
      gap: 10px;
      padding: 12px;
    }

    .booking-topline {
      display: block;
    }

    .booking-status {
      margin-top: 7px;
    }

    .booking-actions {
      flex-wrap: wrap;
    }


    .profile-day-hours {
      display: grid !important;
      grid-template-columns: 1fr auto !important;
      gap: 12px !important;
    }

    .profile-day-hours > strong {
      min-width: 0 !important;
    }

    .profile-day-times {
      grid-column: 1 / -1 !important;
      width: 100% !important;
    }

    .profile-day-times input[type="time"] {
      max-width: none !important;
    }

    .profile-day-closed {
      grid-column: 2 !important;
      grid-row: 1 !important;
    }
  }

  /* COMPACT BUSINESS HOURS OVERRIDE */
  .profile-hours-field {
    grid-column: 1 / -1;
    padding: 20px !important;
    border-radius: 22px !important;
  }

  .profile-hours-heading {
    display: flex !important;
    align-items: baseline !important;
    gap: 14px !important;
    margin-bottom: 14px !important;
  }

  .profile-hours-heading > span {
    font-size: 18px !important;
    letter-spacing: 0.04em !important;
  }

  .profile-hours-heading small {
    font-size: 13px !important;
  }

  .profile-week-hours {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
  }

  .profile-day-hours {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    min-height: 64px !important;
    padding: 10px 14px !important;
    border-radius: 16px !important;
  }

  .profile-day-hours strong {
    width: 130px !important;
    flex: 0 0 130px !important;
    font-size: 16px !important;
  }

  .profile-day-closed {
    width: 112px !important;
    min-height: 38px !important;
    padding: 7px 11px !important;
    border-radius: 12px !important;
    font-size: 12px !important;
    letter-spacing: 0.08em !important;
    flex: 0 0 112px !important;
    margin: 0 !important;
  }

  .profile-day-closed input {
    width: 17px !important;
    height: 17px !important;
  }

  .profile-day-times {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    flex: 1 !important;
    min-width: 0 !important;
  }

  .profile-day-times input {
    width: 112px !important;
    min-width: 0 !important;
    height: 40px !important;
    padding: 6px 10px !important;
    border-radius: 11px !important;
    font-size: 14px !important;
  }

  .profile-day-times span {
    font-size: 12px !important;
    padding: 0 2px !important;
  }

  .profile-day-closed-text {
    font-size: 12px !important;
    margin-left: auto !important;
  }

  @media (max-width: 760px) {
    .profile-hours-field {
      padding: 16px !important;
    }

    .profile-hours-heading {
      display: block !important;
    }

    .profile-hours-heading small {
      display: block !important;
      margin-top: 4px !important;
    }

    .profile-day-hours {
      flex-wrap: wrap !important;
      padding: 12px !important;
    }

    .profile-day-hours strong {
      width: calc(100% - 124px) !important;
      flex: 1 !important;
    }

    .profile-day-closed {
      flex: 0 0 112px !important;
    }

    .profile-day-times {
      width: 100% !important;
      flex-basis: 100% !important;
      margin-top: 2px !important;
    }

    .profile-day-times input {
      flex: 1 !important;
      width: auto !important;
    }
  }


  /* ===== COMPACT BUSINESS HOURS OVERRIDE ===== */
  .profile-hours-field {
    grid-column: 1 / -1 !important;
    padding: 20px !important;
    border-radius: 18px !important;
  }

  .profile-hours-heading {
    display: flex !important;
    align-items: baseline !important;
    gap: 12px !important;
    margin-bottom: 14px !important;
  }

  .profile-hours-heading > span {
    font-size: 17px !important;
    line-height: 1.1 !important;
    letter-spacing: .08em !important;
  }

  .profile-hours-heading small {
    font-size: 13px !important;
  }

  .profile-week-hours {
    display: flex !important;
    flex-direction: column !important;
    gap: 7px !important;
  }

  .profile-day-hours {
    display: grid !important;
    grid-template-columns: 120px 135px minmax(0, 1fr) !important;
    align-items: center !important;
    gap: 10px !important;
    min-height: 58px !important;
    padding: 8px 12px !important;
    border-radius: 13px !important;
  }

  .profile-day-hours strong {
    font-size: 15px !important;
    white-space: nowrap !important;
  }

  .profile-day-closed {
    height: 38px !important;
    padding: 0 10px !important;
    margin: 0 !important;
    border-radius: 10px !important;
    font-size: 11px !important;
    letter-spacing: .08em !important;
    gap: 7px !important;
    justify-content: center !important;
    white-space: nowrap !important;
  }

  .profile-day-closed input {
    width: 17px !important;
    height: 17px !important;
    margin: 0 !important;
  }

  .profile-day-times {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) 18px minmax(0, 1fr) !important;
    align-items: center !important;
    gap: 5px !important;
    min-width: 0 !important;
  }

  .profile-day-times input[type="time"] {
    width: 100% !important;
    min-width: 0 !important;
    height: 38px !important;
    padding: 0 7px !important;
    font-size: 13px !important;
    border-radius: 10px !important;
  }

  .profile-day-times > span {
    font-size: 11px !important;
    text-align: center !important;
  }

  .profile-day-closed-text {
    font-size: 11px !important;
  }

  @media (max-width: 700px) {
    .profile-hours-field {
      padding: 15px !important;
    }

    .profile-hours-heading {
      display: block !important;
    }

    .profile-hours-heading > span {
      display: block !important;
      margin-bottom: 4px !important;
    }

    .profile-day-hours {
      grid-template-columns: 1fr auto !important;
      gap: 8px !important;
      padding: 10px !important;
    }

    .profile-day-times {
      grid-column: 1 / -1 !important;
      width: 100% !important;
    }

    .profile-day-closed {
      width: auto !important;
    }
  }

  


  /* ===== SMALL DAY & CLOSED LABELS ONLY ===== */
  .profile-day-hours strong {
    font-size: 12px !important;
    line-height: 1.1 !important;
  }

  .profile-day-closed span,
  .profile-day-closed-text {
    font-size: 9px !important;
    letter-spacing: 0.06em !important;
  }

  .profile-day-closed {
    padding: 0 10px !important;
  }

  /* ===== DAY → CLOSED → OPEN → TO → CLOSE ===== */
  .profile-day-hours {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
  }

  .profile-day-hours strong {
    flex: 0 0 105px !important;
  }

  .profile-day-closed {
    flex: 0 0 auto !important;
    order: 2 !important;
  }

  .profile-day-times {
    flex: 0 1 auto !important;
    order: 3 !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }

  .profile-day-times input[type="time"] {
    width: 125px !important;
  }

  .profile-day-closed-text {
    order: 3 !important;
  }

  
/* ===== BUSINESS HOURS GREEN CLOCK ===== */
.profile-hours-title {
  display: inline-flex !important;
  align-items: center !important;
  gap: 7px !important;
}

.profile-hours-clock {
  width: 26px !important;
  height: 26px !important;
  min-width: 26px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 8px !important;
  background: #e8f8f2 !important;
  color: #29ab87 !important;
  border: 1px solid #bdebd9 !important;
  font-size: 17px !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  flex-shrink: 0 !important;
}


/* ===== BUSINESS HOURS: DAY ON TOP, CONTROLS BELOW ===== */
  .profile-day-hours {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 7px !important;
    align-items: start !important;
    padding: 10px 14px !important;
  }

  .profile-day-hours strong {
    display: block !important;
    font-size: 13px !important;
    line-height: 1.1 !important;
    margin: 0 !important;
  }

  .profile-day-closed {
    display: inline-flex !important;
    width: fit-content !important;
    height: 30px !important;
    padding: 0 9px !important;
    margin: 0 !important;
    border-radius: 8px !important;
    font-size: 10px !important;
  }

  .profile-day-closed input {
    width: 14px !important;
    height: 14px !important;
    margin: 0 !important;
  }

  .profile-day-closed span {
    font-size: 9px !important;
  }

  .profile-day-times {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    width: fit-content !important;
    max-width: 100% !important;
  }

  .profile-day-times input[type="time"] {
    width: 115px !important;
    height: 30px !important;
    padding: 0 7px !important;
    font-size: 12px !important;
    border-radius: 8px !important;
  }

  .profile-day-times > span {
    font-size: 10px !important;
  }

  /* Keep CLOSED + timings together below the day */
  .profile-day-hours .profile-day-closed,
  .profile-day-hours .profile-day-times {
    align-self: start !important;
  }

  @media (max-width: 600px) {
    .profile-day-hours {
      padding: 9px 10px !important;
    }

    .profile-day-times {
      width: 100% !important;
    }

    .profile-day-times input[type="time"] {
      flex: 1 !important;
      width: 100% !important;
      min-width: 0 !important;
    }
  }


  /* ===== FINAL BUSINESS HOURS HORIZONTAL DAY SLIDER ===== */
  .profile-week-hours {
    display: grid !important;
    grid-auto-flow: column !important;
    grid-auto-columns: minmax(170px, 210px) !important;
    grid-template-columns: none !important;
    flex-direction: unset !important;
    gap: 12px !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    width: 100% !important;
    padding: 4px 2px 14px !important;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .profile-day-hours {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: flex-start !important;
    min-width: 0 !important;
    min-height: 145px !important;
    padding: 14px !important;
    gap: 10px !important;
    scroll-snap-align: start;
  }

  .profile-day-hours strong {
    flex: none !important;
    width: auto !important;
    font-size: 14px !important;
  }

  .profile-day-closed {
    order: 2 !important;
    flex: none !important;
    width: fit-content !important;
    height: auto !important;
    padding: 6px 9px !important;
  }

  .profile-day-times {
    order: 3 !important;
    display: grid !important;
    grid-template-columns: 1fr !important;
    width: 100% !important;
    gap: 5px !important;
  }

  .profile-day-times input[type="time"] {
    width: 100% !important;
    min-width: 0 !important;
  }

  .profile-day-times > span {
    text-align: center;
  }

  .profile-day-closed-text {
    order: 3 !important;
    display: block !important;
  }

  @media (max-width: 700px) {
    .profile-week-hours {
      grid-auto-columns: minmax(150px, 78vw) !important;
      gap: 10px !important;
    }

    .profile-day-hours {
      min-height: 138px !important;
      padding: 12px !important;
    }
  }


  /* ===== EMAIL + PHONE CONTACT ROW ===== */
  .profile-contact-grid {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    align-items: start;
  }

  .profile-contact-column {
    min-width: 0;
  }

  .profile-contact-column .profile-inline-field {
    width: 100%;
  }

  .profile-contact-column .profile-contact-action {
    margin-top: 8px;
  }

  .profile-contact-column .profile-contact-verify {
    width: auto;
  }

  @media (max-width: 700px) {
    .profile-contact-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .profile-contact-column .profile-contact-verify {
      width: 100%;
    }
  }


  /* ===== EMAIL + PHONE SAME ROW — FALLBACK ===== */
  @media (min-width: 701px) {
    .profile-inline-grid > label:nth-of-type(n) {
      min-width: 0;
    }

    /* Email + its action and Phone + its action */
    .profile-contact-action {
      margin-top: -8px;
    }
  }

  .profile-contact-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  /* Keep phone input compact and prevent overflow */
  .profile-phone-input {
    min-width: 0;
  }

  @media (max-width: 700px) {
    .profile-contact-grid {
      grid-template-columns: 1fr;
    }
  }

`;

