import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jbrecruitment.com";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "JB Recruitment Solutions - Premier HR Consulting & Talent Acquisition Firm",
    template: "%s | JB Recruitment Solutions",
  },
  description:
    "JB Recruitment Solutions is a leading HR consulting firm specializing in talent acquisition, executive search, and workforce solutions. Connect with top talent and transform your hiring process with our expert recruitment services.",
  keywords: [
    "JB Solutions",
    "JB Recruitment Solutions",
    "HR firms",
    "HR consulting",
    "recruitment agency",
    "talent acquisition",
    "executive search",
    "headhunting services",
    "recruitment solutions",
    "staffing agency",
    "human resources consulting",
    "workforce solutions",
    "hiring services",
    "job placement",
    "career recruitment",
    "professional recruiting",
    "employment agency",
    "talent management",
    "recruitment consultants",
    "HR outsourcing",
    "global recruitment",
    "IT staffing",
    "healthcare recruitment",
    "finance recruitment",
    "engineering staffing",
    "c-suite executive search",
    "diversity hiring",
    "remote hiring solutions",
    "contract staffing",
    "permanent placement",
    "RPO services",
    "recruitment process outsourcing",
    "Juhi Bhatia",
    "top recruitment agencies",
    "best HR consultancy",
  ],
  authors: [{ name: "JB Recruitment Solutions" }],
  creator: "JB Recruitment Solutions",
  publisher: "JB Recruitment Solutions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "JB Recruitment Solutions",
    title:
      "JB Recruitment Solutions - Premier HR Consulting & Talent Acquisition Firm",
    description:
      "Leading HR consulting firm specializing in talent acquisition, executive search, and workforce solutions. Transform your hiring process with expert recruitment services.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JB Recruitment Solutions - HR Consulting & Talent Acquisition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "JB Recruitment Solutions - Premier HR Consulting & Talent Acquisition Firm",
    description:
      "Leading HR consulting firm specializing in talent acquisition, executive search, and workforce solutions.",
    images: ["/og-image.png"],
    creator: "@JBRecruitment",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    // Uncomment after saving logo.png to public folder:
    // apple: '/logo.png',
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
};

export const contactMetadata: Metadata = {
  title: "Contact Us - JB Recruitment Solutions",
  description:
    "Get in touch with JB Recruitment Solutions. Whether you're looking to hire top talent or explore career opportunities, our HR consulting experts are here to help.",
  openGraph: {
    title: "Contact Us - JB Recruitment Solutions",
    description:
      "Get in touch with our HR consulting experts for talent acquisition and recruitment solutions.",
    url: `${siteUrl}/contact`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact JB Recruitment Solutions",
      },
    ],
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};



export const aboutMetadata: Metadata = {
  title: "About Us - JB Recruitment Solutions",
  description:
    "Learn about JB Recruitment Solutions, our mission, vision, and the team dedicated to transforming your hiring process. We are committed to connecting businesses with exceptional talent.",
  openGraph: {
    title: "About Us - JB Recruitment Solutions",
    description:
      "Discover our story, mission, and commitment to people-first recruitment. Meet the team behind JB Recruitment Solutions.",
    url: `${siteUrl}/about-us`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "About JB Recruitment Solutions",
      },
    ],
  },
  alternates: {
    canonical: `${siteUrl}/about-us`,
  },
};

export const companiesMetadata: Metadata = {
  title: "For Companies - Hire with Confidence | JB Recruitment Solutions",
  description:
    "Complete recruitment support for businesses. From requirement-led hiring to quality-driven selection, we help you find candidates who fit your role, team, and culture.",
  openGraph: {
    title: "For Companies - Hire with Confidence | JB Recruitment Solutions",
    description:
      "Transform your hiring with our comprehensive recruitment solutions. We find candidates aligned with your goals and culture.",
    url: `${siteUrl}/companies`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JB Recruitment Solutions for Companies",
      },
    ],
  },
  alternates: {
    canonical: `${siteUrl}/companies`,
  },
};

export const jobSeekersMetadata: Metadata = {
  title: "Career Insights & Job Opportunities - JB Recruitment Solutions",
  description:
    "Explore career advice, industry insights, and job opportunities with JB Recruitment Solutions. Connect with top employers and advance your career with expert guidance.",
  openGraph: {
    title: "Career Insights & Job Opportunities - JB Recruitment Solutions",
    description:
      "Explore career advice and connect with top employers through our recruitment experts.",
    url: `${siteUrl}/job-seekers`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Career Opportunities - JB Recruitment Solutions",
      },
    ],
  },
  alternates: {
    canonical: `${siteUrl}/job-seekers`,
  },
};
