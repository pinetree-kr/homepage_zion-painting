import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "시온 페인팅",
  description: "시온 페인팅 홈페이지 by HISTREE.",
  icons: {
    icon: [{
      url: "/icons/favicon.ico",
      sizes: "any"
    }, {
      url: "/logo-192.png",
      sizes: "192x192",
      type: "image/png"
    }, {
      url: "/logo-512.png",
      sizes: "512x512",
      type: "image/png"
    }],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: {
      rel: "icon",
      url: "/icons/favicon.ico",
    },
  },
  manifest: "/manifest.json",
};

import { Toaster } from './components/ui/Toaster';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
