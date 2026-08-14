import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  ChevronRight,
  Heart,
  MapPin,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default function Profile() {
  return (
    <div className="page">
      <Header />

      <main className="shell inner profile-page">

        <section className="profile-top">
          <div className="profile-top-copy">
            <span className="profile-kicker">MY METROVYBE</span>
            <h1>Your city,<br /><em>your space.</em></h1>
            <p>
              Everything you love, book and discover around your city —
              all in one place.
            </p>
          </div>

          <div className="profile-person">
            <div className="profile-avatar-large">
              <UserRound size={38} />
            </div>

            <div className="profile-person-info">
              <strong>Welcome back</strong>
              <span>Customer account</span>
            </div>

            <button className="profile-settings-button" aria-label="Settings">
              <Settings size={19} />
            </button>
          </div>
        </section>

        <section className="profile-stats">
          <Link href="/bookings" className="profile-stat">
            <div className="profile-stat-icon green">
              <CalendarDays size={20} />
            </div>
            <div>
              <strong>Bookings</strong>
              <span>View your bookings</span>
            </div>
            <ChevronRight size={18} />
          </Link>

          <Link href="/saved" className="profile-stat">
            <div className="profile-stat-icon yellow">
              <Bookmark size={20} />
            </div>
            <div>
              <strong>Saved</strong>
              <span>Your favourite places</span>
            </div>
            <ChevronRight size={18} />
          </Link>
        </section>

        <section className="profile-discover">
          <div className="profile-heading-row">
            <div>
              <span className="profile-kicker dark">DISCOVER</span>
              <h2>What's your vybe?</h2>
            </div>

            <Link href="/explore" className="profile-see-all">
              Explore all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="vybe-grid">

            <Link href="/explore?category=stay" className="vybe-card stay">
              <div className="vybe-card-top">
                <span className="vybe-number">01</span>
                <span className="vybe-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>

              <div className="vybe-card-bottom">
                <span className="vybe-icon">⌂</span>
                <h3>Stay</h3>
                <p>PGs, rooms & student living</p>
              </div>
            </Link>

            <Link href="/explore?category=food" className="vybe-card food">
              <div className="vybe-card-top">
                <span className="vybe-number">02</span>
                <span className="vybe-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>

              <div className="vybe-card-bottom">
                <span className="vybe-icon">✦</span>
                <h3>Food</h3>
                <p>Tiffin, meals & everyday eats</p>
              </div>
            </Link>

            <Link href="/explore?category=live" className="vybe-card services">
              <div className="vybe-card-top">
                <span className="vybe-number">03</span>
                <span className="vybe-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>

              <div className="vybe-card-bottom">
                <span className="vybe-icon">◇</span>
                <h3>Services</h3>
                <p>Laundry, movers & daily help</p>
              </div>
            </Link>

            <Link href="/explore" className="vybe-card all">
              <div className="vybe-card-top">
                <span className="vybe-number">04</span>
                <span className="vybe-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>

              <div className="vybe-card-bottom">
                <span className="vybe-icon"><Sparkles size={22} /></span>
                <h3>Everything</h3>
                <p>Explore your city</p>
              </div>
            </Link>

          </div>
        </section>

        <section className="profile-bottom">

          <div className="profile-account">
            <div className="profile-heading-row compact">
              <div>
                <span className="profile-kicker dark">ACCOUNT</span>
                <h2>Manage your account</h2>
              </div>
            </div>

            <div className="account-menu">

              <Link href="/saved" className="account-menu-item">
                <span className="account-menu-icon">
                  <Heart size={19} />
                </span>
                <span className="account-menu-copy">
                  <strong>Favourite places</strong>
                  <small>Your saved listings</small>
                </span>
                <ChevronRight size={18} />
              </Link>

              <Link href="/bookings" className="account-menu-item">
                <span className="account-menu-icon">
                  <CalendarDays size={19} />
                </span>
                <span className="account-menu-copy">
                  <strong>Booking history</strong>
                  <small>Past and upcoming bookings</small>
                </span>
                <ChevronRight size={18} />
              </Link>

              <Link href="/explore" className="account-menu-item">
                <span className="account-menu-icon">
                  <MapPin size={19} />
                </span>
                <span className="account-menu-copy">
                  <strong>Explore nearby</strong>
                  <small>Discover services around you</small>
                </span>
                <ChevronRight size={18} />
              </Link>

            </div>
          </div>

          <div className="business-card">
            <div className="business-card-glow"></div>

            <div className="business-card-content">
              <span className="profile-kicker">FOR LOCAL BUSINESSES</span>
              <h2>Turn your service<br />into a <em>destination.</em></h2>
              <p>
                Get discovered by people searching for services around your
                neighbourhood.
              </p>

              <Link href="/list" className="business-button">
                List your service
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

        </section>

      </main>

      <BottomNav active="profile" />
    </div>
  );
}
