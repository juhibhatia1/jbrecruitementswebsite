export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://jbrecruitments.com/#organization",
    name: "JB Recruitments",
    alternateName: "JB Solutions",
    url: "https://jbrecruitments.com",
    image: "https://jbrecruitments.com/logo.avif",
    description: "A recruitment brand by Juhi Bhatia",
    slogan: "Connecting Talent with Opportunity",
    founder: {
      "@type": "Person",
      name: "Juhi Bhatia",
      jobTitle: "Founder & CEO",
      image: "https://jbrecruitments.com/home/profile-pic.jpg",
      sameAs: ["https://www.linkedin.com/in/juhiibhatia/"],
    },
    foundingDate: "2020",
    serviceType: [
      "HR Consulting",
      "Talent Acquisition",
      "Executive Search",
      "Recruitment Services",
      "Workforce Solutions",
      "Career Consulting",
    ],
    areaServed: {
      "@type": "Country",
      name: "Global",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@jbrecruitments.com",
      availableLanguage: "English",
    },
    sameAs: [
      "https://www.linkedin.com/in/juhiibhatia/",
      "https://www.instagram.com/juhibhatia_globalrecruiter/",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "JB Recruitment Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Resume Review & Rewriting",
            url: "https://jbrecruitments.com/job-seekers",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "LinkedIn Optimization",
            url: "https://jbrecruitments.com/job-seekers",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Mock Interview",
            url: "https://jbrecruitments.com/mock-interview",
          },
        },
      ],
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://jbrecruitments.com/#website",
    url: "https://jbrecruitments.com",
    name: "JB Recruitments",
    publisher: {
      "@id": "https://jbrecruitments.com/#organization",
    },
  };

  const servicePageSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "JB Recruitment Solutions Core Services",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Job Seekers",
        item: "https://jbrecruitments.com/job-seekers",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Companies",
        item: "https://jbrecruitments.com/companies",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Mock Interview",
        item: "https://jbrecruitments.com/mock-interview",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicePageSchema),
        }}
      />
    </>
  );
}
