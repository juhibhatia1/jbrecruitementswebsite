import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import SmoothScroll from "./components/ui/smooth-scroll";
import StructuredData from "./components/structured-data";
import GoogleAnalytics from "./components/google-analytics";
import FloatingNavbar from "./components/floating-navbar";
import Footer from "./components/footer";
import { defaultMetadata } from "./lib/metadata";
import { Analytics } from "@vercel/analytics/next";
import LenisProvider from "./providers/lenis-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
        <meta
          name="google-site-verification"
          content="YOUR_VERIFICATION_CODE"
        />
        <link rel="canonical" href="https://jbrecruitment.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        {/* <SmoothScroll /> */}
        <LenisProvider>
          <FloatingNavbar />
          {children}
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
