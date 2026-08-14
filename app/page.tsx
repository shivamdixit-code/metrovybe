import Link from "next/link";
import { ArrowRight, MapPin, PlayCircle } from "lucide-react";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { categories } from "@/lib/data";
import { getListings } from "@/lib/api";
import { ListingCard } from "@/components/ListingCard";

export default async function Home() {
  const listings = await getListings();

  return (
    <div className="page">
      <Header />

      <main>
        <section className="hero">
    <div className="shell hero-grid">
     <div className="hero-content">
      <span className="eyebrow">EVERYTHING YOU NEED</span>

      <h1 className="hero-title"><span>ONE APP.</span><span>ALL VYBES.</span></h1>

      <p className="hero-copy">
       PGs, tiffin, laundry, movers, parking & more.
       <br/>
       Discover trusted services near you.
      </p>

      <div className="hero-buttons">
       <Link href="/explore" className="btn btn-black">
        Explore Near You <MapPin size={19} strokeWidth={2.5} style={{verticalAlign:"-4px", color:"var(--green)", marginLeft:"4px"}} />
       </Link>

       <Link href="/how-it-works" className="btn">
        <PlayCircle size={18} style={{verticalAlign:"-4px"}}/>
        {" "}How it works
       </Link>
      </div>
     </div>

     <div className="hero-art-new">
      <img
       src="/hero-girl.png"
       alt="MetroVybe student"
       className="hero-girl"
      />

      <div className="hero-decoration hero-star star-one">✦</div>
      <div className="hero-decoration hero-star star-two">✦</div>
      <div className="hero-decoration hero-star star-three">✦</div>

      <div className="hero-decoration hero-arrow arrow-one">↗</div>
      <div className="hero-decoration hero-arrow arrow-two">↙</div>
     </div>
    </div>
   </section>

        <section className="shell">
          <div className="categories">
            {categories.map((c) => (
              <Link
                href={`/explore?category=${c.id}`}
                className="cat"
                key={c.id}
              >
                <div className={`cat-icon ${c.color}`}>
                  <img src={c.image} alt={c.name} />
                </div>

                <div>
                  <h3>{c.name}</h3>
                  <p>{c.desc}</p>
                </div>

                <span className={`cat-arrow ${c.color}`}>
                  ›
                </span>
              </Link>
            ))}
          </div>

          <div className="section-head">
            <h2>Popular Near You ✦</h2>

            <Link href="/explore">
              View all{" "}
              <ArrowRight
                size={16}
                style={{ verticalAlign: "-3px" }}
              />
            </Link>
          </div>

          <div className="cards">
            {listings.slice(0, 3).map((x) => (
              <ListingCard key={x.id} item={x} />
            ))}
          </div>

          <div
            className="section-head"
            style={{ marginTop: 38 }}
          >
            <h2>More services around you</h2>

            <Link href="/explore">
              Explore{" "}
              <ArrowRight
                size={16}
                style={{ verticalAlign: "-3px" }}
              />
            </Link>
          </div>

          <div className="cards">
            {listings.slice(3).map((x) => (
              <ListingCard key={x.id} item={x} />
            ))}
          </div>
        </section>
      </main>


      <BottomNav active="home" />
    </div>
  );
}
