import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NAMA, SITE } from "@/lib/config";

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#9b2450" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Toko Bunga Bandung – Fuji Florist", template: "%s | Fuji Florist" },
  description: "Fuji Florist, toko bunga di Bandung: papan bunga, buket, standing flower, dan parcel. Pesan mudah lewat WhatsApp.",
  applicationName: NAMA,
  openGraph: {
    siteName: NAMA,
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Fuji Florist – Toko Bunga Bandung" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
  other: { "geo.region": "ID-JB", "geo.placename": "Bandung" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
