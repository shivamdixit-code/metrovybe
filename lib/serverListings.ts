import "server-only";

import { cookies } from "next/headers";
import type { Listing } from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export async function getServerListings(
  params: Record<string, string> = {}
): Promise<Listing[]> {
  const query = new URLSearchParams(params).toString();
  const cookieStore = await cookies();
  const token = cookieStore.get("metrovybe_token")?.value;

  const headers = new Headers();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${decodeURIComponent(token)}`
    );
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

  return data.map((item: any): Listing => ({
    ...item,
    id: String(item._id || item.id),
  }));
}
