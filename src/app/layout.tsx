import type { Metadata } from "next";

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
    <html lang="en" style={{ backgroundColor: "#000000" }}>
      <body style={{ backgroundColor: "#000000", color: "#ffffff", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
