"use client";

import dynamic from "next/dynamic";
import type { Listing } from "@/lib/api";

const ExploreMap = dynamic(
  () => import("./ExploreMap"),
  { ssr: false }
);

export default function ExploreMapClient({
  listings,
}: {
  listings: Listing[];
}) {
  return <ExploreMap listings={listings} />;
}
