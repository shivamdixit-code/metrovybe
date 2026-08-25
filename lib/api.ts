import { authenticatedFetch } from "@/lib/auth";

export type Listing = {
  id: string;
  _id?: string;
  title: string;
  category?: string;
  description?: string;
  location?: string;
  price?: string;
  image?: string;
  images?: string[];
  tags?: string[];
  rating?: number;
  reviews?: number;
  featured?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function normalizeListing(item: any): Listing {
  return {
    ...item,
    id: String(item._id || item.id),
  };
}

export async function getListings(
  params: Record<string, string> = {}
): Promise<Listing[]> {
  const query = new URLSearchParams(params).toString();

  const headers = new Headers();

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("metrovybe_token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(
    `${API_URL}/api/listings${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }

  const data = await response.json();

  return data.map(normalizeListing);
}

export async function getListing(id: string): Promise<Listing> {
  const response = await fetch(`${API_URL}/api/listings/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch listing");
  }

  return normalizeListing(await response.json());
}

export type SavedListingResponse = {
  saved: Array<{
    _id: string;
    customer: string;
    listing: Listing | null;
    createdAt?: string;
    updatedAt?: string;
  }>;
  total: number;
};

export type Booking = {
  _id: string;
  customer: string | any;
  business: string | any;
  listing: Listing | null;
  listingTitle?: string;
  bookingDate?: string | null;
  message?: string;
  status:
    | "pending"
    | "confirmed"
    | "rejected"
    | "cancelled"
    | "completed";
  businessNote?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BookingResponse = {
  bookings: Booking[];
  total: number;
  pending?: number;
};

export async function getSavedListings(): Promise<SavedListingResponse> {
  const response = await authenticatedFetch("/api/saved");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch saved listings");
  }

  return data;
}

export async function checkSavedListing(
  listingId: string
): Promise<{ saved: boolean }> {
  const response = await authenticatedFetch(`/api/saved/${listingId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to check saved listing");
  }

  return data;
}

export async function saveListing(
  listingId: string
): Promise<{ saved: boolean; message: string }> {
  const response = await authenticatedFetch(`/api/saved/${listingId}`, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save listing");
  }

  return data;
}

export async function unsaveListing(
  listingId: string
): Promise<{ saved: boolean; message: string }> {
  const response = await authenticatedFetch(`/api/saved/${listingId}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove saved listing");
  }

  return data;
}

export async function createBooking(data: {
  listingId: string;
  bookingDate?: string;
  message?: string;
}): Promise<{ message: string; booking: Booking }> {
  const response = await authenticatedFetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create booking");
  }

  return result;
}

export async function getCustomerBookings(): Promise<BookingResponse> {
  const response = await authenticatedFetch("/api/bookings/customer");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch bookings");
  }

  return data;
}

export async function cancelBooking(
  bookingId: string
): Promise<{ message: string; booking: Booking }> {
  const response = await authenticatedFetch(
    `/api/bookings/${bookingId}/cancel`,
    {
      method: "PATCH",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to cancel booking");
  }

  return data;
}


/* ===== NOTIFICATIONS ===== */

export type AppNotification = {
  _id: string;
  recipient: string;
  type: "booking" | "saved" | "message" | "update" | "security" | "system";
  preferenceKey: "updates" | "saved" | "messages" | "security";
  title: string;
  body: string;
  link?: string;
  read: boolean;
  essential?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
};

export type NotificationPreferences = {
  updates: boolean;
  saved: boolean;
  messages: boolean;
  security: boolean;
};

export async function getNotificationPreferences(): Promise<{
  preferences: NotificationPreferences;
}> {
  const response = await authenticatedFetch("/api/notifications/preferences");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch notification preferences");
  }

  return data;
}

export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<{
  message: string;
  preferences: NotificationPreferences;
}> {
  const response = await authenticatedFetch("/api/notifications/preferences", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ preferences }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update notification preferences");
  }

  return data;
}

export async function getNotifications(): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> {
  const response = await authenticatedFetch("/api/notifications");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch notifications");
  }

  return data;
}

export async function markNotificationRead(
  notificationId: string
): Promise<{ message: string; notification: AppNotification }> {
  const response = await authenticatedFetch(
    `/api/notifications/${notificationId}/read`,
    { method: "PATCH" }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update notification");
  }

  return data;
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  const response = await authenticatedFetch("/api/notifications/read-all", {
    method: "PATCH",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update notifications");
  }

  return data;
}

/* ===== PROFILE SECURITY ===== */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const response = await authenticatedFetch("/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to update password");
  }

  return result;
}

/* ===== ACTIVE SESSIONS ===== */

export type ActiveSession = {
  sessionId: string;
  deviceName: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  lastActiveAt: string;
  current?: boolean;
};

export async function getActiveSessions(): Promise<ActiveSession[]> {
  const response = await authenticatedFetch("/api/auth/sessions");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load active sessions");
  }

  return data.sessions || [];
}

export async function removeActiveSession(
  sessionId: string
): Promise<{ message: string }> {
  const response = await authenticatedFetch(
    `/api/auth/sessions/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to remove session");
  }

  return data;
}

export async function removeOtherActiveSessions(): Promise<{ message: string }> {
  const response = await authenticatedFetch("/api/auth/sessions", {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to remove other sessions");
  }

  return data;
}

/* ===== REVIEWS & RATINGS ===== */

export type Review = {
  _id: string;
  customer: string | { _id: string; name?: string };
  business: string;
  listing: string | Listing;
  booking: string | Booking;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getListingReviews(
  listingId: string
): Promise<{ reviews: Review[] }> {
  const response = await fetch(
    `${API_URL}/api/reviews/listing/${encodeURIComponent(listingId)}`,
    { cache: "no-store" }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch reviews");
  }

  return data;
}

export async function getMyReviews(): Promise<{ reviews: Review[] }> {
  const response = await authenticatedFetch("/api/reviews/my");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch your reviews");
  }

  return data;
}

export async function createReview(data: {
  bookingId: string;
  rating: number;
  comment?: string;
}): Promise<{ message: string; review: Review }> {
  const response = await authenticatedFetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to submit review");
  }

  return result;
}

export async function updateReview(
  reviewId: string,
  data: { rating?: number; comment?: string }
): Promise<{ message: string; review: Review }> {
  const response = await authenticatedFetch(`/api/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update review");
  }

  return result;
}

export async function deleteReview(
  reviewId: string
): Promise<{ message: string }> {
  const response = await authenticatedFetch(`/api/reviews/${reviewId}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete review");
  }

  return result;
}
