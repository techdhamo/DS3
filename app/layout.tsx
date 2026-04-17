import type { Metadata } from "next";
import './globals.css';
import { Cinzel, Inter } from 'next/font/google';
import { SessionProviderWrapper } from '../src/components/providers/session-provider';
import Script from 'next/script';

const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DS3 World & Store - Magical Treasures",
  description: "Enter a realm of mystery and magic - Explore DS3 World community and discover fantasy mystery boxes",
  manifest: "/manifest.json",
  themeColor: "#8b5cf6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DS3 World",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "DS3 World - Magical Treasures",
    description: "Discover mystical treasures and magical items from realms beyond imagination",
    url: "https://ds3.world",
    siteName: "DS3 World",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DS3 World - Magical Treasures",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DS3 World - Magical Treasures",
    description: "Discover mystical treasures and magical items from realms beyond imagination",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${cinzel.variable} ${inter.variable} font-body antialiased bg-midnight-900 text-midnight-100`}
      >
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
