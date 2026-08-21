import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Diamond Collective | Powered by Slugger Coin ($SLUG)",
  description:
    "Your digital clubhouse for deals, gear & access. Exclusively for college baseball players.",
  applicationName: "The Diamond Collective",
  appleWebApp: {
    capable: true,
    title: "Diamond Collective",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "The Diamond Collective | Powered by Slugger Coin ($SLUG)",
    description:
      "Your digital clubhouse for deals, gear & access. Exclusively for college baseball players.",
    url: "https://sluggercoin.com",
    siteName: "The Diamond Collective",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Diamond Collective | Powered by Slugger Coin ($SLUG)",
    description:
      "Your digital clubhouse for deals, gear & access. Exclusively for college baseball players.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ backgroundColor: "#000000" }}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Diamond Collective" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#000000" }}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
