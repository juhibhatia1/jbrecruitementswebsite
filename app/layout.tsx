import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Raleway, Crimson_Text } from "next/font/google";
import "./globals.css";
// import SmoothScroll from "./components/ui/smooth-scroll";
import StructuredData from "./components/structured-data";
import GoogleAnalytics from "./components/google-analytics";
import FloatingNavbar from "./components/floating-navbar";
import Footer from "./components/footer";
import ChatWidget from "./components/chatbot/chat-widget";
import { defaultMetadata, siteUrl } from "./lib/metadata";
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

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const crimson = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
          />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${raleway.variable} ${crimson.variable} antialiased`}
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
          <ChatWidget />
        </LenisProvider>
      </body>
    </html>
  );
}
