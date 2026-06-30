export type Currency = "USD" | "AED" | "INR";

export interface SystemService {
  title: string;
  amount: number;
  description: string;
  timeline: string;
  features: string[];
}

/** Per-currency pricing for all services */
export const MULTI_CURRENCY_PRICING: Record<string, Record<Currency, number>> = {
  "Resume Review & Rewriting":   { USD: 80,  AED: 300,  INR: 6000  },
  "Cover Letter Writing":        { USD: 50,  AED: 200,  INR: 3000  },
  "LinkedIn Optimization":       { USD: 80,  AED: 300,  INR: 6000  },
  "Superstar Shout-Out":         { USD: 160, AED: 600,  INR: 10000 },
  "Ask Me Anything":             { USD: 40,  AED: 150,  INR: 2500  },
  "Interview Prep":              { USD: 100, AED: 300,  INR: 7000  },
  "All Career Services Bundle":  { USD: 480, AED: 1600, INR: 30000 },
  "Job Opportunities":           { USD: 40,  AED: 150,  INR: 3500  },
};

export const SYSTEM_SERVICES: SystemService[] = [
  {
    title: "Resume Review & Rewriting",
    amount: 80,
    timeline: "5 days",
    description: "ATS-optimised resumes aligned with your target roles and recruiter search systems.",
    features: [
      "ATS-compliant, keyword-optimized resumes",
      "Strategic skills keywords for Boolean search visibility",
      "Strong achievement-focused bullet points",
      "Clear professional positioning and value proposition"
    ]
  },
  {
    title: "Cover Letter Writing",
    amount: 50,
    timeline: "5 days",
    description: "A master cover letter that communicates impact, motivation, and adaptability.",
    features: [
      "Strengths and achievements highlighted",
      "Motivation and role-fit are articulated strategically",
      "Easily customizable version for multiple applications",
      "Professional and persuasive"
    ]
  },
  {
    title: "LinkedIn Optimization",
    amount: 80,
    timeline: "5 days",
    description: "Strategic LinkedIn profiles designed to improve recruiter discovery and search ranking.",
    features: [
      "Keywords optimized content",
      "Skills-based profile structuring",
      "LinkedIn banner optimisation for stronger personal branding"
    ]
  },
  {
    title: "Superstar Shout-Out",
    amount: 160,
    timeline: "5 days",
    description: "Targeted LinkedIn announcement to decision-makers, published via Juhi Bhatia's personal LinkedIn profile.",
    features: [
      "Custom post showcasing your profile, skills & availability",
      "Strategic positioning to attract hiring managers",
      "Increased visibility with employers & key decision-makers",
      "Published via Juhi Bhatia's LinkedIn for wider reach & credibility"
    ]
  },
  {
    title: "Ask Me Anything",
    amount: 40,
    timeline: "48 hours",
    description: "Direct, practical guidance over email for real-world career challenges and decisions.",
    features: [
      "Career changes and transitions",
      "Remote jobs and interviews",
      "Burnout, layoffs, and clarity",
      "Resume or LinkedIn direction"
    ]
  },
  {
    title: "Interview Prep",
    amount: 100,
    timeline: "Delivered via email",
    description: "Direct, practical support to help you crack your interviews with confidence.",
    features: [
      "Profile and role review",
      "Top 10 likely interview questions",
      "Structured answers using the STAR method"
    ]
  },
  {
    title: "All Career Services Bundle",
    amount: 480,
    timeline: "Timeline varies by service selection",
    description: "Comprehensive bundle pack including Resume rewrite, Cover letter rewrite, LinkedIn Optimization, Superstar Shout-out, Ask Me Anything session, and Interview Prep.",
    features: [
      "Includes all 6 individual services",
      "Special discounted price of USD 480",
      "Saves you USD 130 vs buying them separately"
    ]
  }
];

export const SYSTEM_ABOUT = `
JB Recruitment Solutions is a premium career consulting and recruitment brand founded by Juhi Bhatia.
Juhi Bhatia is an experienced career coach, talent advisor, and recruiter with a strong footprint on LinkedIn, where she actively shares career wisdom and showcases job seekers to employers.

What we DO:
- Offer premium career consulting services (Resume Writing, LinkedIn Optimization, Cover Letters, Interview Prep, LinkedIn Shout-outs via Juhi's personal profile, and Ask Me Anything guidance).
- Help job seekers align their search assets with recruiter search systems and optimize their profiles for Recruiter search algorithms.
- Partner with companies looking to hire top-tier talent.

What we DO NOT DO (STRICT WEBSITE LIMITATIONS):
- We do NOT have a jobs page, direct careers page, or active job openings board on our website.
- We do NOT provide direct job placement or job listings through this chat widget.
- If a user is looking for active job openings, tell them clearly that we do not have a jobs/careers page on our website and do not list job openings here. Instead, they can submit their resume to contact@jbrecruitments.com so we can keep them in mind if a matching client role arises, or buy our resume/LinkedIn optimization services to stand out to employers.

Founder Info - Juhi Bhatia:
Juhi Bhatia is a respected career advisor who understands the recruitment ecosystem from both sides (employer and job seeker). She uses recruiter search patterns, Boolean logic, and ATS optimization guidelines to help job seekers stand out.

Contact Info:
- Email: contact@jbrecruitments.com (For general queries, purchases, and support)
- Primary Contact: contact@jbrecruitments.com
- Alert / Escalation Email: juhi@jbrecruitments.com
- Website: JB Recruitment Solutions (https://www.jbrecruitments.com)
`;

export const SYSTEM_FAQ = `
Frequently Asked Questions (FAQs):
Q: How does the payment work?
A: You can purchase services directly on our website. Payments are secure, powered by Stripe. You can add multiple services to your cart and checkout in one go, or buy a single service instantly.

Q: What happens after I purchase a service?
A: You will receive an automated email confirmation from contact@jbrecruitments.com asking for details such as your current resume, LinkedIn link, or target roles. Once you reply, Juhi will work on your assets.

Q: What are the turnaround times?
A:
- Resume Review, Cover Letter, LinkedIn Optimization, Superstar Shout-out: 5 days.
- Ask Me Anything (email career query): 48 hours.
- Interview Prep answers: Varies, but delivered via email before your interview.

Q: Can I get a discount?
A: Yes! The "All Career Services Bundle" packages all six individual services for USD 480, saving you USD 130 compared to purchasing them separately.
`;

/**
 * Combines all site contexts into a single text representation, filtered for a specific currency.
 */
export function getSystemContextText(currency: Currency = "USD"): string {
  let text = "=== ABOUT JB RECRUITMENT SOLUTIONS & JUHI BHATIA ===\n";
  text += SYSTEM_ABOUT.trim() + "\n\n";
  
  text += `=== SERVICES & PRICING (LOCAL CURRENCY: ${currency}) ===\n`;
  text += `We show pricing in ${currency} because the visitor is located in a region using this currency.\n\n`;
  
  SYSTEM_SERVICES.forEach((service) => {
    const pricing = MULTI_CURRENCY_PRICING[service.title];
    text += `- Title: ${service.title}\n`;
    if (pricing && pricing[currency] !== undefined) {
      text += `  Price: ${currency} ${pricing[currency].toLocaleString()}\n`;
    } else {
      text += `  Price: USD ${service.amount}\n`;
    }
    text += `  Timeline: ${service.timeline}\n`;
    text += `  Description: ${service.description}\n`;
    text += `  Features:\n`;
    service.features.forEach((feat) => {
      text += `    * ${feat}\n`;
    });
    text += "\n";
  });
  
  text += "=== FAQS AND RECRUITMENT SERVICES INFO ===\n";
  // Replace references of USD 480 and USD 130 savings based on the selected currency
  let faqText = SYSTEM_FAQ;
  if (currency === "INR") {
    faqText = faqText.replace(/USD 480/g, "INR 30,000");
    faqText = faqText.replace(/USD 130/g, "INR 4,500");
  } else if (currency === "AED") {
    faqText = faqText.replace(/USD 480/g, "AED 1,600");
    faqText = faqText.replace(/USD 130/g, "AED 250");
  }
  text += faqText.trim() + "\n";

  text += `\n=== CURRENCY INFORMATION ===\n`;
  text += `The user is visiting from a region where pricing is strictly set to ${currency}. `;
  text += `You MUST answer all pricing, rates, package, and cost questions ONLY in ${currency}. Do not display or list prices in other currencies (like USD, AED, or INR) unless the user explicitly requests a comparison. `;
  text += `The exact price for each service in ${currency} is specified above. Always format the currency symbol clearly.\n`;
  
  return text;
}

