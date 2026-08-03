import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      // Stripe JS + inline scripts (Next.js needs unsafe-inline for its runtime)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network https://app.cal.com https://cal.com",
      // Stripe payment iframes + same-origin blob: for in-app PDF resume preview
      "frame-src 'self' blob: https://js.stripe.com https://hooks.stripe.com https://m.stripe.network https://app.cal.com https://cal.com",
      // API calls: Stripe, OpenAI Realtime, self (WebSocket upgrades)
      "connect-src 'self' https://api.stripe.com https://m.stripe.network wss://api.openai.com https://api.openai.com https://upload.imagekit.io https://app.cal.com https://cal.com *.cal.com",
      // Images: Unsplash, ImageKit, data URIs
      "img-src 'self' data: blob: https://images.unsplash.com https://ik.imagekit.io",
      // Fonts: Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Audio/video (used in interview room)
      "media-src 'self' blob:",
      // Workers (used by Next.js internals)
      "worker-src 'self' blob:",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Enforce HTTPS — protects admin session cookie from plaintext transmission
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Prevent XSS scripts from stealing Stripe payment data
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.module.exprContextCritical = false;
    return config;
  },
  turbopack: {},
};

export default nextConfig;
