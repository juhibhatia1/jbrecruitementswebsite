import { Metadata } from "next";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jbrecruitments.com";
const ogImage = "/logo.avif";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "JB Recruitments - A recruitment brand by Juhi Bhatia",
    template: "%s | JB Recruitments",
  },
  description:
    "JB Recruitments is a brand focused on recruitment and talent acquisition, helping companies find the right people, faster.",
  keywords: [
    "resume review",
    "resume rewriting",
    "cover letter writing",
    "linkedin optimisation",
    "interview prep",
    "mock interview prep",
    "JB Recruitments",
    "JB recruitment",
    "JB Solutions",
    "Juhi Bhatia recruitment",
    "HR firms",
    "HR consulting",
    "recruitment firm",
    "recruitment brand",
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
  authors: [{ name: "JB Recruitments" }],
  creator: "JB Recruitments",
  publisher: "JB Recruitments",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "JB Recruitments",
    title: "JB Recruitments - A recruitment brand by Juhi Bhatia",
    description:
      "A brand focused on recruitment and talent acquisition, helping companies find the right people, faster.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "JB Recruitments - HR Consulting & Talent Acquisition by Juhi Bhatia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JB Recruitments - A recruitment brand by Juhi Bhatia",
    description:
      "A brand focused on recruitment and talent acquisition, helping companies find the right people, faster.",
    images: [ogImage],
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
  alternates: {
    canonical: siteUrl,
  },
};

export const contactMetadata: Metadata = {
  title: "Contact Us - JB Recruitments | A recruitment brand by Juhi Bhatia",
  description:
    "Get in touch with JB Recruitments. Whether you're looking to hire top talent or explore career opportunities, our JB recruitment experts and HR consultants are here to help.",
  keywords: [
    "contact JB Recruitments",
    "contact JB recruitment",
    "hire recruiters",
    "talk to HR consultants",
    "recruitment services contact",
    "talent acquisition help",
  ],
  openGraph: {
    title: "Contact Us - JB Recruitments | A recruitment brand by Juhi Bhatia",
    description:
      "Get in touch with our JB recruitment experts and HR consultants for talent acquisition and recruitment solutions.",
    url: `${siteUrl}/contact-us`,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Contact JB Recruitments - Top Recruitment Agency",
      },
    ],
  },
  alternates: {
    canonical: `${siteUrl}/contact-us`,
  },
};

export const aboutMetadata: Metadata = {
  title: "About Us - JB Recruitments | A recruitment brand by Juhi Bhatia",
  description:
    "Learn about JB Recruitments, our mission, vision, and the team dedicated to transforming your hiring process. We are committed to connecting businesses with exceptional talent.",
  keywords: [
    "about JB Recruitments",
    "about JB recruitment",
    "JB recruitment team",
    "recruitment firm story",
    "talent acquisition team",
    "HR consulting mission",
    "Juhi Bhatia recruiter",
  ],
  openGraph: {
    title: "About Us - JB Recruitments | A recruitment brand by Juhi Bhatia",
    description:
      "Discover our story, mission, and commitment to people-first recruitment. Meet the team behind JB Recruitments.",
    url: `${siteUrl}/about-us`,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "About JB Recruitments - Juhi Bhatia",
      },
    ],
  },
  alternates: {
    canonical: `${siteUrl}/about-us`,
  },
};

export const companiesMetadata: Metadata = {
  title: "For Companies - Hire with Confidence | JB Recruitments - A recruitment brand by Juhi Bhatia",
  description:
    "Complete JB recruitment support for businesses. From requirement-led hiring to quality-driven selection, we help you find candidates who fit your role, team, and culture.",
  keywords: [
    "JB recruitment for companies",
    "JB Recruitments enterprise hiring",
    "hire with confidence",
    "enterprise hiring partner",
    "outsourced recruiting",
    "executive search partner",
  ],
  openGraph: {
    title: "For Companies - Hire with Confidence | JB Recruitments",
    description:
      "Transform your hiring with our comprehensive JB recruitment solutions. We find candidates aligned with your goals and culture.",
    url: `${siteUrl}/companies`,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "JB Recruitments Services For Companies",
      },
    ],
  },
  alternates: {
    canonical: `${siteUrl}/companies`,
  },
};

export const jobSeekersMetadata: Metadata = {
  title: "Career Insights & Job Opportunities - JB Recruitments | A recruitment brand by Juhi Bhatia",
  description:
    "Explore career advice, resume services, and job opportunities with JB Recruitments. Connect with top employers and advance your career with JB recruitment expert guidance.",
  keywords: [
    "resume review",
    "resume rewriting",
    "cover letter writing",
    "linkedin optimisation",
    "interview prep",
    "job seekers JB Recruitments",
    "JB recruitment jobs",
    "career guidance",
    "resume support",
    "find jobs UAE",
    "international career opportunities",
  ],
  openGraph: {
    title: "Career Insights & Job Opportunities - JB Recruitments",
    description:
      "Explore career advice and connect with top employers through JB recruitment experts.",
    url: `${siteUrl}/job-seekers`,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Career Opportunities with JB Recruitments",
      },
    ],
  },
  alternates: {
    canonical: `${siteUrl}/job-seekers`,
  },
};

export const privacyMetadata: Metadata = {
  title: "Privacy Policy - JB Recruitments",
  description:
    "Read how JB Recruitments collects, uses, stores, and protects candidate resumes and personal information during the recruitment process.",
  keywords: [
    "privacy policy",
    "candidate data",
    "resume privacy",
    "data protection",
    "recruitment privacy policy",
  ],
  openGraph: {
    title: "Privacy Policy - JB Recruitments",
    description:
      "Learn how JB Recruitments handles candidate data, including collection, storage, access, retention, and security practices.",
    url: `${siteUrl}/privacy-policy`,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Privacy Policy - JB Recruitments",
      },
    ],
  },
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
};
