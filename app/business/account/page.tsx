"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, Phone, MapPin, ShieldCheck, Settings, LogOut } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { getToken, logout } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type Business = {
  businessName?: string;
  category?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  verificationStatus?: string;
};

export default function BusinessAccountPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBusiness = async () => {
      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/business/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load business profile");
        }

        const data = await response.json();
        setBusiness(data.business || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, []);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("metrovybe-auth-changed"));
    window.location.href = "/login";
  };

  const verification = (business?.verificationStatus || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="page">
      <main className="shell inner business-account-page">
        <div className="business-account-header">
          <Link href="/business/dashboard" className="business-account-back">
            <ArrowLeft size={18} />
            Dashboard
          </Link>

          <div>
            <div className="panel-kicker">BUSINESS ACCOUNT</div>
            <h1 className="page-title">ACCOUNT.</h1>
            <p className="subtle">
              Manage your business profile and account details.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="panel business-account-loading">
            Loading your business account...
          </div>
        ) : (
          <>
            <section className="panel business-account-card">
              <div className="business-account-profile">
                <div className="business-account-avatar">
                  <Building2 size={28} />
                </div>

                <div>
                  <h2>{business?.businessName || "Your Business"}</h2>
                  <p>{business?.category || "Business account"}</p>
                </div>
              </div>

              <div className="business-account-status">
                <ShieldCheck size={18} />
                <span>
                  Verification: <strong>{verification}</strong>
                </span>
              </div>
            </section>

            <section className="panel business-account-details">
              <div className="panel-kicker">BUSINESS DETAILS</div>
              <h2>Profile information</h2>

              <div className="business-account-detail-grid">
                <div className="business-account-detail">
                  <Mail size={18} />
                  <div>
                    <span>Email</span>
                    <strong>{business?.email || "Not available"}</strong>
                  </div>
                </div>

                <div className="business-account-detail">
                  <Phone size={18} />
                  <div>
                    <span>Phone</span>
                    <strong>{business?.phone || "Not available"}</strong>
                  </div>
                </div>

                <div className="business-account-detail">
                  <MapPin size={18} />
                  <div>
                    <span>Business address</span>
                    <strong>
                      {[
                        business?.address,
                        business?.city,
                        business?.state,
                        business?.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Not available"}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel business-account-actions">
              <Link href="/profile/settings" className="business-account-action">
                <Settings size={20} />
                <div>
                  <strong>Account settings</strong>
                  <span>Manage your account preferences</span>
                </div>
              </Link>

              <button
                type="button"
                className="business-account-action business-account-logout"
                onClick={handleLogout}
              >
                <LogOut size={20} />
                <div>
                  <strong>Log out</strong>
                  <span>Sign out of your business account</span>
                </div>
              </button>
            </section>
          </>
        )}
      </main>

      <BottomNav active="account" />
    </div>
  );
}
