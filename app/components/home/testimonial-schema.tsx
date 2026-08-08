export default function TestimonialSchema() {
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "JB Recruitments",
    image: "https://jbrecruitments.com/logo.avif",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "9",
    },
    review: [
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Delicia Pillay",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
        },
        reviewBody:
          "I wholeheartedly recommend Juhi Bhatia, who worked with us as a freelance talent mapper. She is reliable, assertive, and consistently delivers high-quality work on time.",
      },
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Mohammed Barakat",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
        },
        reviewBody:
          "I had the pleasure of working with Juhi as part of my team, where she led the talent acquisition department with professionalism and insight.",
      },
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Smitha Dasan",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
        },
        reviewBody:
          "Juhi is a dedicated, self-motivated and a smart recruiter; totally committed to the work assigned.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(reviewSchema),
      }}
    />
  );
}
