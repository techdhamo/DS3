import type { Metadata } from "next";
import './globals.css';
import { Cinzel, Inter } from 'next/font/google';
import { SessionProviderWrapper } from '../components/providers/session-provider';

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
  title: "DS3 World & Store",
  description: "Enter a realm of mystery and magic - Explore DS3 World community and discover fantasy mystery boxes",
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
      </body>
    </html>
  );
}
