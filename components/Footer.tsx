import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-brand">
        metro<span>vybe</span>
      </div>

      <p>
        Your city. Your vybe.
      </p>

      <div className="footer-links">
        <Link href="/explore">Explore</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/list">List a service</Link>
        <Link href="/profile">Profile</Link>
      </div>

      <div className="footer-copy">
        © {new Date().getFullYear()} MetroVybe. All rights reserved.
      </div>

    </footer>
  );
}
