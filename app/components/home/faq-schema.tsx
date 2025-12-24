export default function FAQSchema() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does JB's recruitment process work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We start by understanding your role, team, and expectations, then share carefully aligned profiles and stay involved through the hiring decision.",
        },
      },
      {
        "@type": "Question",
        name: "How do I get started?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Simply reach out or submit your details. We'll review them and get back to you with next steps.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it usually take to receive profiles?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Timelines depend on the role, but we prioritise thoughtful shortlisting over volume and keep you informed at every step.",
        },
      },
      {
        "@type": "Question",
        name: "What types of roles do you hire for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We support hiring across multiple functions and industries, focusing on quality, alignment, and long-term fit.",
        },
      },
      {
        "@type": "Question",
        name: "How can JB help me in my job search?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We support you with resume review, LinkedIn optimisation, interview guidance, and access to relevant opportunities.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to apply for every role separately?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Once you share your profile, we consider you for suitable roles and reach out when there's a strong match.",
        },
      },
      {
        "@type": "Question",
        name: "Will I receive feedback after interviews?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Whenever possible, we share feedback and next steps so you're never left guessing.",
        },
      },
      {
        "@type": "Question",
        name: "Will my information be kept confidential?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All personal and hiring information is handled with care and shared only with relevant parties.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema),
      }}
    />
  );
}
