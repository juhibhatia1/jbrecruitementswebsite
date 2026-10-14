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
  "Resume Review & Rewriting":   { USD: 79,  AED: 299,  INR: 5999  },
  "Cover Letter Writing":        { USD: 49,  AED: 159,  INR: 2999  },
  "LinkedIn Optimization":       { USD: 79,  AED: 299,  INR: 5999  },
  "Superstar Shout-Out":         { USD: 179, AED: 699,  INR: 11999 },
  "Ask Me Anything":             { USD: 49,  AED: 169,  INR: 2699  },
  "Interview Prep":              { USD: 99,  AED: 299,  INR: 6999  },
  "Ready-to-Apply Job Pack":     { USD: 119, AED: 399,  INR: 8999  },
  "All Career Services Bundle":  { USD: 480, AED: 1600, INR: 30000 },
  "Mock Interview":             { USD: 39,  AED: 99,   INR: 499   },
  "AI Mock Interview":           { USD: 39,  AED: 99,   INR: 499   },
  "Coach Mock Interview":        { USD: 39,  AED: 99,   INR: 499   },
  "Personal Branding Consultation":      { USD: 300,  AED: 1100,  INR: 25000 },
  "LinkedIn Brand Launch":               { USD: 3000, AED: 11000, INR: 265000 },
  "LinkedIn Brand Launch (3 Months)":    { USD: 3000, AED: 11000, INR: 265000 },
  "LinkedIn Brand Authority":            { USD: 5000, AED: 18000, INR: 485000 },
  "LinkedIn Brand Authority (6 Months)": { USD: 5000, AED: 18000, INR: 485000 },
};

export const SYSTEM_SERVICES: SystemService[] = [
  {
    title: "Resume Review & Rewriting",
    amount: 79,
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
    amount: 49,
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
    amount: 79,
    timeline: "5 days",
    description: "Strategic LinkedIn optimization designed to strengthen your positioning and improve recruiter visibility.",
    features: [
      "Strategic headline & About section positioning",
      "Recruiter-focused keywords & profile SEO",
      "Achievement-driven experience & skills optimization",
      "Personal branding & profile visibility enhancement"
    ]
  },
  {
    title: "Superstar Shout-Out",
    amount: 179,
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
    amount: 49,
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
    amount: 99,
    timeline: "Delivered via email",
    description: "Direct, practical support to help you crack your interviews with confidence.",
    features: [
      "Profile and role review",
      "Top 10 likely interview questions",
      "Structured answers using the STAR method"
    ]
  },
  {
    title: "Ready-to-Apply Job Pack",
    amount: 119,
    timeline: "Curated within 3 days",
    description: "A tailored shortlist of active, relevant public job opportunities matched to your experience, skills, and target locations.",
    features: [
      "Targeted opportunities based on your background",
      "Preferred location filtering",
      "Public job listings from portals and company career pages",
      "Direct application links for faster applying"
    ]
  },
  {
    title: "AI Mock Interview",
    amount: 39,
    timeline: "Instant session & report",
    description: "An interactive, real-time voice-based mock interview conducted by an advanced AI tailored to your target role and resume, yielding an instant performance report.",
    features: [
      "Real-time voice-based interactive session",
      "Tailored to your resume, job role, and experience level",
      "Instant scorecard grading out of 10",
      "Question-by-question feedback and improvement plan sent over email"
    ]
  }
];

export const SYSTEM_ABOUT = `
JB Recruitment Solutions is a premium career consulting and recruitment brand founded by Juhi Bhatia.
Juhi Bhatia is an experienced career coach, talent advisor, and recruiter with a strong footprint on LinkedIn, where she actively shares career wisdom and showcases job seekers to employers.
Internal product note: the application currently serves around 2,000 daily active users.

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
Juhi is active on Instagram as @juhibhatia_globalrecruiter, where she shares career tips and recruiter insights. Instagram profile: https://www.instagram.com/juhibhatia_globalrecruiter/

Contact Info:
- Email: contact@jbrecruitments.com (For general queries, purchases, and support)
- Primary Contact: contact@jbrecruitments.com
- Alert / Escalation Email: juhi@jbrecruitments.com
- Instagram (Juhi Bhatia): https://www.instagram.com/juhibhatia_globalrecruiter/
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
A: Yes! As a limited time offer, you get 20% off when you choose any 4 or more services. The discount applies automatically at checkout when building your bundle.

Q: What is the AI Mock Interview and how does it work?
A: The AI Mock Interview is an interactive, voice-based practice session with our advanced AI interviewer. The AI conducts a realistic interview tailored to your target job role, experience level, and resume. Once completed, a detailed performance scorecard with a score out of 10, a summary of strengths/weaknesses, and a full question-by-question improvement report is instantly generated and emailed to you.

Q: How do I take the AI Mock Interview?
A:
1. Select the "AI Based Interview" option under Mock Interviews on our website.
2. Fill in the job details (or select a role) and upload your resume.
3. Complete the payment.
4. You will receive an email invitation with a unique interview link.
5. Open the link in a modern web browser, allow microphone access, run the quick mic test, and click "Start Interview" to begin speaking with the AI.

Q: Where do I take the AI Mock Interview?
A: The interview is taken entirely online inside your web browser on our platform. No software installation, third-party apps, or account sign-ups are required. Simply open the unique link sent to your email (e.g., /interview/[token]) on a computer or phone.

Q: What are the recommendations for a smooth experience?
A: For the best experience, we recommend:
- **Use a Headset/Earphones:** Wearing headphones with a built-in microphone prevents the AI's voice from feeding back into your mic (avoiding echo loops).
- **Environment:** Be in a quiet, distraction-free room. Background chatter or noise can interfere with the audio capture.
- **Internet Connection:** Ensure a stable, low-latency Wi-Fi or wired connection.
- **Permissions:** Make sure to grant browser microphone permissions when prompted.
- **Browser:** Use modern browsers like Google Chrome, Safari, or Microsoft Edge.
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
  text += SYSTEM_FAQ.trim() + "\n";

  text += `\n=== CURRENCY INFORMATION ===\n`;
  text += `The visitor's primary detected currency is ${currency}. `;
  text += `By default, answer pricing and package questions in ${currency}. Always format the currency symbol or code clearly.\n\n`;

  text += `=== COMPLETE REGIONAL PRICING REFERENCE ===\n`;
  text += `JB Recruitment Solutions uses region-based dynamic pricing across 3 regions:\n\n`;
  text += `1. INDIA (INR ₹):\n`;
  text += `   - Superstar Shout-Out: INR 11,999\n`;
  text += `   - Ask Me Anything: INR 2,699\n`;
  text += `   - Resume Review & Rewriting: INR 5,999\n`;
  text += `   - Cover Letter Writing: INR 2,999\n`;
  text += `   - LinkedIn Optimization: INR 5,999\n`;
  text += `   - Interview Prep: INR 6,999\n`;
  text += `   - Ready-to-Apply Job Pack: INR 8,999\n`;
  text += `   - AI Mock Interview: INR 499\n`;
  text += `   - Personal Branding Consultation: INR 25,000 (100% credited toward 3 or 6-month plan)\n`;
  text += `   - Personal Branding (3-Month Launch): INR 2,65,000\n`;
  text += `   - Personal Branding (6-Month Authority): INR 4,85,000\n\n`;
  text += `2. UNITED ARAB EMIRATES (AED):\n`;
  text += `   - Superstar Shout-Out: AED 699\n`;
  text += `   - Ask Me Anything: AED 169\n`;
  text += `   - Resume Review & Rewriting: AED 299\n`;
  text += `   - Cover Letter Writing: AED 159\n`;
  text += `   - LinkedIn Optimization: AED 299\n`;
  text += `   - Interview Prep: AED 299\n`;
  text += `   - Ready-to-Apply Job Pack: AED 399\n`;
  text += `   - AI Mock Interview: AED 99\n`;
  text += `   - Personal Branding Consultation: AED 1,100 (100% credited toward 3 or 6-month plan)\n`;
  text += `   - Personal Branding (3-Month Launch): AED 11,000\n`;
  text += `   - Personal Branding (6-Month Authority): AED 18,000\n\n`;
  text += `3. ALL REMAINING COUNTRIES / INTERNATIONAL (USD $ - e.g. USA, UK, Israel, Europe, Canada, etc.):\n`;
  text += `   - Superstar Shout-Out: USD 179\n`;
  text += `   - Ask Me Anything: USD 49\n`;
  text += `   - Resume Review & Rewriting: USD 79\n`;
  text += `   - Cover Letter Writing: USD 49\n`;
  text += `   - LinkedIn Optimization: USD 79\n`;
  text += `   - Interview Prep: USD 99\n`;
  text += `   - Ready-to-Apply Job Pack: USD 119\n`;
  text += `   - AI Mock Interview: USD 39\n`;
  text += `   - Personal Branding Consultation: USD 300 (100% credited toward 3 or 6-month plan)\n`;
  text += `   - Personal Branding (3-Month Launch): USD 3,000\n`;
  text += `   - Personal Branding (6-Month Authority): USD 5,000\n\n`;
  text += `If a visitor asks about pricing in India, UAE, or International (USD), or requests a currency comparison, quote the exact figures from this regional reference table.\n`;

  return text;
}


