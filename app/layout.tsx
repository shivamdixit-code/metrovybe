import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "MetroVybe — Your City. Your Vybe.",
  description: "Discover PGs, tiffin, laundry, movers, parking and everyday services around you."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}