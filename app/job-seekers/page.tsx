import JobSeekersForm from "../components/job-seekers/job-seekers-form";
import ServicesSection from "../components/job-seekers/services-section";
import ScrollAnimation from "../components/ui/scroll-animation";
import { jobSeekersMetadata } from "../lib/metadata";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RxArrowTopRight } from "react-icons/rx";
import styles from "./page.module.css";

export const metadata = jobSeekersMetadata;
export const dynamic = "force-dynamic";

export default async function JobSeekersPage() {
  const [candidateCount, paidBookingCount, completedInterviewCount] =
    await Promise.all([
      prisma.purchase
        .findMany({
          select: {
            candidateEmail: true,
          },
          where: {
            serviceName: { contains: "Mock Interview" },
          },
        })
        .then(
          (purchases) =>
            new Set(
              purchases.map((purchase) =>
                purchase.candidateEmail.toLowerCase(),
              ),
            ).size,
        ),
      prisma.purchase.count({
        where: {
          serviceName: { contains: "Mock Interview" },
          status: "COMPLETED",
        },
      }),
      prisma.candidateApplication.count({
        where: {
          interviewPreference: { in: ["AI", "MANUAL"] },
          OR: [
            { status: "INTERVIEW_COMPLETED" },
            { session: { status: "COMPLETED" } },
            { session: { completedAt: { not: null } } },
          ],
        },
      }),
    ]);

  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <main className="flex-grow">
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-20 sm:pt-32 md:px-6 md:pb-24 md:pt-24">
          <div
            className="pointer-events-none absolute left-0 top-0 -z-10 h-[600px] w-full overflow-hidden"
            style={{ opacity: 0.6 }}
          >
            <div
              className="absolute -left-[10%] -top-[50%] h-[200%] w-[150%] rotate-[-45deg] transform bg-gradient-to-r from-transparent via-white/40 to-transparent blur-3xl origin-top-left"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, rgba(255,255,255,0) 0deg, rgba(0,0,0,0.03) 25deg, rgba(255,255,255,0) 40deg, rgba(0,0,0,0.04) 65deg, rgba(255,255,255,0) 90deg)",
              }}
            />
          </div>

          <div className="grid grid-cols-1 items-start gap-10 md:gap-12 lg:grid-cols-3 lg:gap-2">
            <ScrollAnimation
              variant="fadeUp"
              className="col-span-1 pt-0 lg:col-span-2 lg:pt-0"
            >
              <h1 className="mb-12 text-3xl font-semibold leading-[1.1] tracking-tight text-[#252e3d] sm:text-4xl md:mb-12 md:text-5xl lg:text-6xl">
                Career Insights & Guidance
              </h1>

              <div className="space-y-5">
                <div>
                  <h3
                    className="mb-2 text-lg font-semibold text-[#252e3d] sm:text-xl"
                    style={{ fontFamily: "Crimson Text, serif" }}
                  >
                    Your Career Support Starts Here
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                    JB is dedicated to helping individuals present their best
                    selves and unlock meaningful career opportunities. Whether
                    you're actively job hunting or exploring new possibilities,
                    we're here to support your journey.
                  </p>
                </div>

                <div>
                  <h4
                    className="mb-2 text-lg font-semibold text-[#252e3d] sm:text-lg"
                    style={{ fontFamily: "Crimson Text, serif" }}
                  >
                    Stay Updated With Latest Roles
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                    We regularly share job opportunities across industries.
                    Submit your resume once and receive curated opportunities
                    that fit your experience, skills, and goals.
                  </p>
                </div>

                <div>
                  <h4
                    className="mb-2 text-lg font-semibold text-[#252e3d] sm:text-lg"
                    style={{ fontFamily: "Crimson Text, serif" }}
                  >
                    Simple Process for Candidates
                  </h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700 sm:text-base">
                    <li>Fill out the short form</li>
                    <li>Upload your resume</li>
                    <li>Get notified about suitable openings</li>
                  </ol>
                </div>

                <div className="w-full">
                  <p className="text-sm font-medium leading-relaxed text-gray-700 sm:text-base">
                    • We do not charge candidates for job opportunities.
                    However, we offer paid career services below that are
                    designed to help you stand out in the job market.
                  </p>
                </div>

                <div className="w-full">
                  <h4
                    className="mb-2 text-lg font-semibold text-[#252e3d] sm:text-lg"
                    style={{ fontFamily: "Crimson Text, serif" }}
                  >
                    Terms & Conditions
                  </h4>
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 sm:text-base">
                    Please review our service terms carefully before making a
                    purchase.
                  </p>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-gray-700 lg:pr-6 sm:text-base">
                    <li>
                      <span className="font-semibold">No Refund Policy:</span>{" "}
                      All services are non-refundable once payment has been
                      made, as work begins immediately on strategy, review, and
                      documentation.
                    </li>
                    <li>
                      <span className="font-semibold">Revision Window:</span>{" "}
                      Revision requests must be shared within 10 days of
                      receiving the first edited draft (or within 10 days of
                      LinkedIn optimization for LinkedIn services). Requests
                      after this period may require an additional fee.
                    </li>
                    <li>
                      <span className="font-semibold">
                        Client Responsibility:
                      </span>{" "}
                      Clients are responsible for providing accurate
                      information, career details, and required documents on
                      time. Delays in sharing information may impact turnaround
                      time.
                    </li>
                    <li>
                      <span className="font-semibold">Service Scope:</span>{" "}
                      Services include editing, optimization, and professional
                      structuring of provided information. We do not guarantee
                      job placement, interview calls, or hiring outcomes.
                    </li>
                  </ol>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation
              variant="scaleUp"
              delay={0.08}
              className="col-span-1 flex w-full justify-center lg:justify-start"
            >
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-none">
                <JobSeekersForm />
              </div>
            </ScrollAnimation>
          </div>

          <ServicesSection
            promoMetrics={{
              candidatesServed: candidateCount,
              paidBookings: paidBookingCount,
              completedInterviews: completedInterviewCount,
            }}
          />

          <ScrollAnimation
            variant="fadeUp"
            delay={0.12}
            className="mt-12 md:mt-16"
          >
            <section>
              <div className="overflow-hidden rounded-[2rem] border border-[#e5ebf8] bg-linear-to-br from-white via-[#fbfaff] to-[#f6f3ff] px-5 py-8 shadow-[0_16px_50px_rgba(37,55,77,0.08)]">
                <div className="mx-auto max-w-3xl text-center">
                  <span className="inline-flex items-center rounded-full bg-[#f2f0ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#5a58ab] shadow-sm">
                    Service impact
                  </span>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#252e3d] sm:text-4xl">
                    How our services help job seekers
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#5b6476] sm:text-base">
                    A quick snapshot of our most-used services and the value
                    they create.
                  </p>
                </div>

                <div className="mt-8 grid gap-5 grid-cols-2 md:grid-cols-4">
                  {[
                    {
                      value: "2,400+",
                      label: "Resumes improved",
                      detail: "Sharper resumes with stronger impact.",
                    },
                    {
                      value: "1,100+",
                      label: "LinkedIn profiles tuned",
                      detail: "Better recruiter discoverability.",
                    },
                    {
                      value: "900+",
                      label: "Interview sessions",
                      detail: "More confident interview practice.",
                    },
                    {
                      value: "750+",
                      label: "Tailored job shortlists",
                      detail: "Curated jobs that save time.",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.75rem] border border-[#e5ebf8] bg-white/95 p-4 md:p-6 shadow-[0_10px_30px_rgba(37,55,77,0.06)]"
                    >
                      <div className="text-3xl md:text-4xl font-semibold tracking-tight text-[#5a58ab] sm:text-5xl">
                        {item.value}
                      </div>
                      <h3 className="mt-3 md:mt-5 text-md md:text-lg font-semibold text-[#252e3d]">
                        {item.label}
                      </h3>
                      {/* <p className="mt-2 text-sm leading-6 text-[#5b6476]">
                      {item.detail}
                    </p> */}
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[1.5rem] border border-[#e5ebf8] bg-white/90 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a93a8]">
                      Candidate journey
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#252e3d]">
                      From profile polish to interview-ready applications
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6476]">
                      We do not just sell services - we move a candidate
                      through a clear journey that builds credibility, speeds up
                      action, and raises the odds of a stronger outcome.
                    </p>

                    <div className={`${styles.journeyTimeline} mt-5 space-y-3`}>
                      {[
                        {
                          step: "01",
                          title: "Clarify the story",
                          note: "Resume Review & Rewriting turns experience into a sharper, role-focused narrative.",
                        },
                        {
                          step: "02",
                          title: "Build discoverability",
                          note: "LinkedIn Optimization helps recruiters and hiring teams find the right profile faster.",
                        },
                        {
                          step: "03",
                          title: "Practice with precision",
                          note: "Mock Interviews and Interview Prep make answers more structured, relevant, and confident.",
                        },
                        {
                          step: "04",
                          title: "Move faster to apply",
                          note: "Ready-to-Apply Job Packs shorten the search by surfacing curated public opportunities.",
                        },
                      ].map((item, index) => (
                        <div
                          key={item.title}
                          className={`${styles.journeyItem} flex gap-4 rounded-2xl px-4 py-1 `}
                          style={{ animationDelay: `${index * 120}ms` }}
                        >
                          <div className="relative flex shrink-0 items-center">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold tracking-[0.18em] text-[#5a58ab] shadow-sm border border-[#e5ebf8]">
                              {item.step}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#252e3d]">
                              {item.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#5b6476]">
                              {item.note}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-[#e5ebf8] bg-[#252e3d] p-5 text-white shadow-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                        Real results, real people
                      </p>
                      <p className="mt-3 text-lg leading-7 text-white/90">
                        Every review below is from someone who worked with
                        Juhi and landed real results.
                      </p>
                      <div className="mt-6 border-t border-white/10">
                        {[
                          {
                            name: "Simona Nyagolova",
                            role: "Sales Development Representative at GoDaddy",
                            review:
                              "Highly recommend Juhi's services! Very professional, on time and genuinely does a great job at her requests.",
                          },
                          {
                            name: "BriAnna Beard, M.A.",
                            role: "Supervisor at Adidas",
                            review:
                              "Juhi was great! She was able to revise my resume and optimize my LinkedIn and I am extremely satisfied. I will absolutely be recommending her to others.",
                          },
                          {
                            name: "Carlos Augusto, PHR",
                            role: "Human Resources & Military Operations Expert",
                            review:
                              "I am pleased with Juhi's services. Once I got my new resume, I started getting interview calls. That is wild! Give it a try. I recommend it.",
                          },
                        ].map((item, index) => (
                          <div
                            key={item.name}
                            className={`flex gap-3 py-4 text-sm leading-6 ${
                              index !== 0 ? "border-t border-white/10 ml-12 pl-0" : ""
                            }`}
                          >
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold leading-none text-white ${index !== 0 ? "-ml-12" : ""}`}>
                              <span className="translate-y-px">
                                {item.name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((part) => part[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-baseline gap-x-2">
                                <p className="font-semibold text-white">
                                  {item.name}
                                </p>
                                <p className="text-xs text-white/50">
                                  {item.role}
                                </p>
                              </div>
                              <div className="mt-1 flex gap-0.5 text-[#f5b942]" aria-hidden="true">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                    <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.6.99-5.79-4.21-4.1 5.82-.85z" />
                                  </svg>
                                ))}
                              </div>
                              <p className="mt-1.5 text-white/75">
                                {item.review}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="https://www.linkedin.com/services/page/71481432514867b3ab/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#252e3d] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
                    >
                      View more reviews
                      <RxArrowTopRight className="h-4 w-4 transform transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </ScrollAnimation>
        </div>
      </main>
    </div>
  );
}
