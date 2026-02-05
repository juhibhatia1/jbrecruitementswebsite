export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RecruitmentBrand",
    "@id": "https://jbrecruitment.com/#organization",
    name: "JB Recruitments",
    alternateName: "JB Solutions",
    url: "https://jbrecruitment.com",
    // Uncomment after saving logo.png to public folder:
    // logo: 'https://jbrecruitment.com/logo.png',
    image: "https://jbrecruitment.com/opengraph-image",
    description: "A recruitment brand by Juhi Bhatia",
    slogan: "Connecting Talent with Opportunity",
    founder: {
      "@type": "Person",
      name: "Juhi Bhatia",
      jobTitle: "Founder & CEO",
      image: "https://jbrecruitment.com/home/profile-pic.jpg",
      sameAs: ["https://www.linkedin.com/in/juhiibhatia/"],
    },
    foundingDate: "2020",
    serviceType: [
      "HR Consulting",
      "Talent Acquisition",
      "Executive Search",
      "Recruitment Services",
      "Workforce Solutions",
      "Staffing Services",
      "Career Consulting",
    ],
    areaServed: {
      "@type": "Country",
      name: "United States", // Update if Global or specific region
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "US", // Placeholder, update if real address is known or remove if fully remote
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-123-4567",
      contactType: "customer service",
      email: "contact@jbrecruitments.com",
      availableLanguage: "English",
    },
    sameAs: [
      "https://www.linkedin.com/in/juhiibhatia/",
      "https://www.facebook.com",
      "https://twitter.com",
      "https://www.instagram.com/juhibhatia_globalrecruiter/",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://jbrecruitment.com/#website",
    url: "https://jbrecruitment.com",
    name: "JB Recruitments",
    publisher: {
      "@id": "https://jbrecruitment.com/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://jbrecruitment.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://jbrecruitment.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact",
        item: "https://jbrecruitment.com/contact-us",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Job Seekers",
        item: "https://jbrecruitment.com/job-seekers",
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
    </>
  );
}
