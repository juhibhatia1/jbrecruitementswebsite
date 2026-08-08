export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://jbrecruitments.com/#organization",
    name: "JB Recruitments",
    alternateName: ["JB Solutions", "JB Recruitment", "JBrecruitments"],
    url: "https://jbrecruitments.com",
    logo: "https://jbrecruitments.com/logo.avif",
    image: [
      "https://jbrecruitments.com/logo.avif",
      "https://jbrecruitments.com/home/background-image.avif"
    ],
    description: "JB Recruitments is a premier recruitment agency and HR consulting brand by Juhi Bhatia",
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
      "JB Recruitment Services",
      "Workforce Solutions",
      "Career Consulting",
      "Resume Review",
      "Resume Rewriting",
      "Cover Letter Writing",
      "LinkedIn Optimization",
      "Interview Prep",
      "Mock Interviews",
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
            name: "JB Recruitments Resume Review & Rewriting",
            url: "https://jbrecruitments.com/job-seekers",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "JB Recruitments Cover Letter Writing",
            url: "https://jbrecruitments.com/job-seekers",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "JB Recruitments LinkedIn Optimization",
            url: "https://jbrecruitments.com/job-seekers",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "JB Recruitments Mock Interview",
            url: "https://jbrecruitments.com/mock-interviews",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "JB Recruitment HR Consulting for Companies",
            url: "https://jbrecruitments.com/companies",
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
        item: "https://jbrecruitments.com/mock-interviews",
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
