import { getListing } from "@/lib/api";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function Listing({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await getListing(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="page">
      <Header />

      <main className="shell inner">
        <Link href="/explore" style={{ fontWeight: 900 }}>
          ← Back to explore
        </Link>

        <div className="grid-2" style={{ marginTop: 20 }}>
          <div className="panel">
            <div
              style={{
                height: 450,
                overflow: "hidden",
                borderRadius: 24,
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </div>

          <div className="panel">
            <span
              className="badge"
              style={{
                position: "static",
                display: "inline-block",
              }}
            >
              FEATURED
            </span>

            <h1
              className="page-title"
              style={{
                fontSize: 52,
                marginTop: 18,
              }}
            >
              {item.title}
            </h1>

            <p>
              {item.location} · ⭐ {item.rating} ({item.reviews} reviews)
            </p>

            <h2 style={{ fontSize: 30 }}>
              {item.price}
            </h2>

            <div className="tags">
              {(item.tags || []).map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <p style={{ lineHeight: 1.6 }}>
              A trusted MetroVybe listing with verified details,
              transparent pricing, and useful services near you.
            </p>

            <Link
              href="/bookings"
              className="btn btn-black"
              style={{
                display: "inline-block",
                marginTop: 15,
              }}
            >
              Book / Contact
            </Link>
          </div>
        </div>
      </main>

      <BottomNav active="explore" />
    </div>
  );
}
