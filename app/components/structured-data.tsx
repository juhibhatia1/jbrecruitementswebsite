export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RecruitmentBrand",
    "@id": "https://jbrecruitments.com/#organization",
    name: "JB Recruitments",
    alternateName: "JB Solutions",
    url: "https://jbrecruitments.com",
    // Uncomment after saving logo.png to public folder:
    // logo: 'https://jbrecruitments.com/logo.png',
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
    "@id": "https://jbrecruitments.com/#website",
    url: "https://jbrecruitments.com",
    name: "JB Recruitments",
    publisher: {
      "@id": "https://jbrecruitments.com/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://jbrecruitments.com/search?q={search_term_string}",
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
        item: "https://jbrecruitments.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact",
        item: "https://jbrecruitments.com/contact-us",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Job Seekers",
        item: "https://jbrecruitments.com/job-seekers",
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
