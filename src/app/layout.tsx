import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Diamond Collective | Slugger Coin",
  description: "Exclusive athlete rewards and brand access portal for college baseball players.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
