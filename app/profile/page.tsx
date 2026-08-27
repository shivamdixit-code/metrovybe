"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronRight,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  MessageCircle,
  Star,
  CheckCircle2,
  Pencil,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getToken, getUser, logout, type AuthUser } from "@/lib/auth";
import {
  getCustomerBookings,
  getCustomerEnquiries,
  getMyReviews,
  type Enquiry,
  type Review,
} from "@/lib/api";

type ProfileActivity = {
  id: string;
  type: "booking" | "enquiry" | "enquiry_reply" | "review" | "review_reply";
  title: string;
  message: string;
  date?: string | null;
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [highlightedActivity, setHighlightedActivity] = useState<string | null>(null);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activityLoading, setActivityLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [activities, setActivities] = useState<ProfileActivity[]>([]);

  useEffect(() => {
    const activityId = searchParams.get("activity");
    if (!activityId || activityLoading) return;

    const timer = window.setTimeout(() => {
      const el = document.getElementById(`profile-activity-${activityId}`);
      if (!el) return;

      setHighlightedActivity(activityId);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => setHighlightedActivity(null), 2500);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [searchParams, activityLoading, activities]);

  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();

    if (!token || !currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.role !== "customer") {
      router.replace(
        currentUser.role === "business" ? "/business/dashboard" : "/login"
      );
      return;
    }

    setUser(currentUser);
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    let active = true;

    const loadActivity = async () => {
      try {
        setActivityLoading(true);

        const [enquiryResult, reviewResult, bookingResult] =
          await Promise.all([
            getCustomerEnquiries(),
            getMyReviews(),
            getCustomerBookings(),
          ]);

        const timeline: ProfileActivity[] = [];

        // Bookings made by the customer
        (bookingResult.bookings || []).forEach((booking: any) => {
          timeline.push({
            id: `booking-${booking._id}`,
            type: "booking",
            title: "Booking request sent",
            message: `You requested a booking for ${booking.listingTitle || booking.listing?.title || "a place"}.`,
            date: booking.createdAt || booking.bookingDate,
          });
        });

        // Enquiries sent + business replies
        (enquiryResult.enquiries || []).forEach((enquiry: Enquiry) => {
          const listingTitle =
            typeof enquiry.listing === "object" && enquiry.listing
              ? enquiry.listing.title
              : "a place";

          timeline.push({
            id: `enquiry-${enquiry._id}`,
            type: "enquiry",
            title: "Enquiry sent",
            message: `You asked about ${listingTitle || "a place"}.`,
            date: enquiry.createdAt,
          });

          if (enquiry.businessReply?.message) {
            timeline.push({
              id: `enquiry-reply-${enquiry._id}`,
              type: "enquiry_reply",
              title: "Business replied to your enquiry",
              message: enquiry.businessReply.message,
              date: enquiry.businessReply.repliedAt || enquiry.updatedAt,
            });
          }
        });

        // Reviews given + business replies
        (reviewResult.reviews || []).forEach((review: any) => {
          const listingTitle =
            typeof review.listing === "object" && review.listing
              ? review.listing.title
              : "a place";

          timeline.push({
            id: `review-${review._id}`,
            type: "review",
            title: "Feedback shared",
            message: `You shared your feedback for ${listingTitle || "your experience"}.`,
            date: review.createdAt,
          });

          if (review.businessReply?.message) {
            timeline.push({
              id: `review-reply-${review._id}`,
              type: "review_reply",
              title: "Business replied to your feedback",
              message: review.businessReply.message,
              date: review.businessReply.repliedAt || review.updatedAt,
            });
          }
        });

        timeline.sort(
          (a, b) =>
            new Date(b.date || 0).getTime() -
            new Date(a.date || 0).getTime()
        );

        if (active) setActivities(timeline);
      } catch (error) {
        console.error("Failed to load profile activity:", error);
        if (active) setActivities([]);
      } finally {
        if (active) setActivityLoading(false);
      }
    };

    loadActivity();

    return () => {
      active = false;
    };
  }, [user]);

  const handleLogout = () => {
    setLoggingOut(true);
    logout();
    window.dispatchEvent(new Event("metrovybe-auth-changed"));
    router.replace("/login");
  };

  if (checkingAuth || !user) {
    return (
      <div className="page">
        <Header />

        <main className="shell inner profile-page">
          <section
            className="profile-top"
            style={{
              minHeight: 240,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="profile-person-info">
              <strong>Loading your profile...</strong>
              <span>Please wait a moment.</span>
            </div>
          </section>
        </main>

        <BottomNav active="profile" />
      </div>
    );
  }

  const displayName = user.name?.trim() || "Customer";
  const firstName = displayName.split(/\s+/)[0] || "Customer";

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C";

  return (
    <div className="page">
      <Header />

      <main className="shell inner profile-page">
        {/* PREMIUM PROFILE HERO */}
        <section
          className="profile-top"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            padding: "34px 34px 30px",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              right: -80,
              top: -100,
              background: "rgba(0, 230, 118, 0.12)",
              filter: "blur(2px)",
              pointerEvents: "none",
            }}
          />

          <div className="profile-top-copy" style={{ position: "relative" }}>
            <span className="profile-kicker">MY METROVYBE</span>

            <h1 style={{ letterSpacing: "-0.055em" }}>
              Hey {firstName},
              <br />
              <em>your city awaits.</em>
            </h1>

            <p style={{ maxWidth: 560 }}>
              Your favourite places, bookings and everyday city discoveries —
              all in one space.
            </p>
          </div>

          <div
            className="profile-person"
            style={{
              position: "relative",
              marginTop: 28,
              paddingTop: 22,
              borderTop: "1px solid rgba(17,17,17,0.1)",
            }}
          >
            <div
              className="profile-avatar-large"
              aria-label={`${displayName} profile`}
            >
              {user.image ? (
                <img src={user.image} alt={`${displayName} profile`} />
              ) : (
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 25,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {initials}
                </span>
              )}
            </div>

            <div className="profile-person-info">
              <strong className="profile-display-name">{displayName}</strong>
              <span>{user.email}</span>
            </div>

            <button
              type="button"
              className="profile-settings-button"
              aria-label="Account settings"
              title="Account settings"
              onClick={() => router.push("/profile/settings")}
            >
              <Settings size={19} />
            </button>
          </div>

        </section>
        {/* ACTIVITY */}
        <section style={{ marginTop: 34 }}>
          <div className="profile-heading-row">
            <div>
              <span className="profile-kicker dark">YOUR ACTIVITY</span>
              <h2>Keep track of your vybe.</h2>
            </div>
          </div>

          <div
            className="profile-stats"
            style={{
              marginTop: 18,
              gap: 16,
            }}
          >
            <Link
              href="/bookings"
              className="profile-stat"
              style={{
                minHeight: 112,
                borderRadius: 22,
              }}
            >
              <div
                className="profile-stat-icon green"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                }}
              >
                <CalendarDays size={21} />
              </div>

              <div>
                <strong>Bookings</strong>
                <span>Upcoming & past plans</span>
              </div>

              <ChevronRight size={19} />
            </Link>

            <Link
              href="/saved"
              className="profile-stat"
              style={{
                minHeight: 112,
                borderRadius: 22,
              }}
            >
              <div
                className="profile-stat-icon yellow"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                }}
              >
                <Bookmark size={21} />
              </div>

              <div>
                <strong>Saved</strong>
                <span>Places worth coming back to</span>
              </div>

              <ChevronRight size={19} />
            </Link>
          </div>

        <div className="profile-activity-discover-layout">
          <div
            className="profile-my-activity-card"
            style={{
              marginTop: 16,
              borderRadius: 22,
              padding: 20,
            }}
          >
            <div className="profile-my-activity-header">
              <div className="profile-stat-icon purple">
                <Activity size={21} />
              </div>
              <div className="profile-my-activity-copy">
                <strong>My Activity</strong>
                <span>Enquiry replies & review responses</span>
              </div>
            </div>

            {activityLoading ? (
              <div className="profile-activity-empty">
                Loading your latest activity...
              </div>
            ) : activities.length === 0 ? (
              <div className="profile-activity-empty">
                No replies yet. Business responses to your enquiries and reviews
                will appear here.
              </div>
            ) : (
              <>
                <div className="profile-activity-list">
                {activities
                  .slice(0, showAllActivities ? activities.length : 5)
                  .map((activity) => (
                  <div
                    id={`profile-activity-${activity.id}`}
                    className={`profile-activity-item ${highlightedActivity === activity.id ? "is-highlighted" : ""}`}
                    key={activity.id}
                  >
                    <div
                      className={`profile-activity-item-icon activity-${activity.type}`}
                    >
                      {activity.type === "booking" ? (
                        <CalendarDays size={17} />
                      ) : activity.type === "enquiry" ? (
                        <MessageCircle size={17} />
                      ) : activity.type === "enquiry_reply" ? (
                        <MessageCircle size={17} />
                      ) : activity.type === "review" ? (
                        <Star size={17} />
                      ) : (
                        <Heart size={17} />
                      )}
                    </div>
                    <div className="profile-activity-item-copy">
                      <strong>{activity.title}</strong>
                      <p>{activity.message}</p>
                      {activity.date ? (
                        <span>
                          {new Date(activity.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {activities.length > 5 ? (
                <button
                  type="button"
                  className="profile-activity-show-more"
                  onClick={() => setShowAllActivities((current) => !current)}
                >
                  <span>
                    {showAllActivities
                      ? "Show less"
                      : `Show all ${activities.length} activities`}
                  </span>
                  <ChevronRight
                    size={17}
                    style={{
                      transform: showAllActivities
                        ? "rotate(-90deg)"
                        : "rotate(90deg)",
                    }}
                  />
                </button>
              ) : null}
              </>
            )}
          </div>

        {/* DISCOVER */}
        <section className="profile-discover" style={{ marginTop: 42 }}>
          <div className="profile-heading-row">
            <div>
              <span className="profile-kicker dark">DISCOVER</span>
              <h2>Find your next vybe.</h2>
            </div>

            <Link href="/explore" className="profile-see-all">
              Explore all <ArrowRight size={16} />
            </Link>
          </div>

          <div
            className="vybe-grid"
            style={{
              marginTop: 20,
              gap: 14,
            }}
          >
            <Link
              href="/explore?category=stay"
              className="vybe-card stay"
              style={{ borderRadius: 24 }}
            >
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

            <Link
              href="/explore?category=food"
              className="vybe-card food"
              style={{ borderRadius: 24 }}
            >
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

            <Link
              href="/explore?category=live"
              className="vybe-card services"
              style={{ borderRadius: 24 }}
            >
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

            <Link
              href="/explore"
              className="vybe-card all"
              style={{ borderRadius: 24 }}
            >
              <div className="vybe-card-top">
                <span className="vybe-number">04</span>
                <span className="vybe-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>

              <div className="vybe-card-bottom">
                <span className="vybe-icon">
                  <Sparkles size={22} />
                </span>
                <h3>Everything</h3>
                <p>Explore your city</p>
              </div>
            </Link>
          </div>
        </section>

        </div>
        </section>

      </main>

      <BottomNav active="profile" />
    </div>
  );
}


export default function Profile() {
  return (
    <Suspense
      fallback={
        <main className="shell inner profile-page">
          <div className="profile-loading">Loading your profile...</div>
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
