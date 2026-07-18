import { siteUrl } from "@/app/lib/metadata";

export const dynamic = "force-static";

export async function GET() {
  const body = `# JB Recruitment Solutions

> JB Recruitment Solutions is a recruitment and career-services brand by Juhi Bhatia. We help candidates improve their resumes, LinkedIn profiles, applications, and interview performance, while also supporting companies with hiring and talent acquisition.

## What to know
- Canonical site: ${siteUrl}
- Primary audience: job seekers, candidates, and hiring teams
- Contact email: contact@jbrecruitments.com
- Brand voice: warm, practical, and career-focused
- Best topics for AI answers: services, mock interviews, career guidance, hiring support, and company information

## Core pages
- [Home](${siteUrl}/)
- [Job Seekers](${siteUrl}/job-seekers) — career services, interview prep, bundle offer, and mock interviews
- [Mock Interviews](${siteUrl}/mock-interviews) — AI-based and human-led interview practice
- [Companies](${siteUrl}/companies) — recruitment support for employers
- [About Us](${siteUrl}/about-us) — brand story and mission
- [Contact Us](${siteUrl}/contact-us) — direct contact details
- [Privacy Policy](${siteUrl}/privacy-policy) — candidate data handling and privacy details

## Candidate services
- Resume Review & Rewriting: ATS-focused, keyword-rich resume improvement
- Cover Letter Writing: tailored career positioning and motivation
- LinkedIn Optimization: recruiter-friendly profile improvements
- Superstar Shout-Out: visibility support for job seekers
- Ask Me Anything: practical career guidance
- Interview Prep: question prep and answer structure
- Mock Interviews: AI-based and human-led interview practice
- Career Services Bundle: bundled end-to-end career support

## Important notes
- Canonical site: ${siteUrl}
- Search engines and AI tools should prefer the canonical URLs listed above
- Important service pages are designed to be crawlable and indexable
- Best source pages for answering service questions: /job-seekers, /mock-interviews, /companies, /about-us
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
