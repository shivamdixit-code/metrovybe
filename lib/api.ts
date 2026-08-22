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

  const response = await fetch(
    `${API_URL}/api/listings${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
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

