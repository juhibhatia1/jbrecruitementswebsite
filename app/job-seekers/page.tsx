import JobSeekersForm from "../components/job-seekers/job-seekers-form";
import ServicesSection from "../components/job-seekers/services-section";
import ReviewsCarousel from "../components/job-seekers/reviews-carousel";
import TermsAndConditions from "../components/job-seekers/terms-and-conditions";
import ScrollAnimation from "../components/ui/scroll-animation";
import { jobSeekersMetadata } from "../lib/metadata";
import { prisma } from "@/lib/prisma";

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
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-20 sm:pt-32 md:px-6 md:pb-4 md:pt-24">
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

          <div className="grid grid-cols-1 items-start gap-10 md:gap-12 lg:grid-cols-3 lg:items-stretch lg:gap-10">
            <ScrollAnimation
              variant="fadeUp"
              className="col-span-1 pt-0 lg:col-span-2 lg:flex lg:flex-col lg:pt-0"
            >
              <h1 className="mb-12 lg:mb-7 text-3xl font-semibold leading-[1.1] tracking-tight text-[#252e3d] sm:text-4xl md:mb-12 md:text-5xl lg:text-6xl">
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
                    you&apos;re actively job hunting or exploring new
                    possibilities, we&apos;re here to support your journey.
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

              </div>

              {/* LinkedIn reviews — auto-rotating carousel to fill the space beside the form */}
              <ReviewsCarousel />
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
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-14 text-center sm:px-5 md:px-6 md:pb-20">
          <TermsAndConditions />
        </div>
      </main>
    </div>
  );
}
