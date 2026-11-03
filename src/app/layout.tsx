import type { Metadata } from "next";
import Script from "next/script";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const bodyFont = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-body" });
const displayFont = Barlow_Condensed({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display" });

const title = "The Diamond Collective | Built for College Ballplayers";
const description = "College ballplayers connect with brands, get in on gear drops, and post their numbers on a national scoreboard. Free to join.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sluggercoin.com"),
  title,
  description,
  icons: { icon: "/icon.png" },
  openGraph: { title, description, url: "/", siteName: "The Diamond Collective", images: ["/og.png"], type: "website" },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-QRBM2SC148"
          strategy="afterInteractive"
        />
        <Script id="google-tag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QRBM2SC148');
          `}
        </Script>
        {/* End Google tag */}

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1720292082960404');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1720292082960404&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body style={{ backgroundColor: "#000000", color: "#ffffff", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
