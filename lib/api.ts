export type Listing = {
  id: string;
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
