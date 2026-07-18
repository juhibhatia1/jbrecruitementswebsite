import JobSeekersForm from "../components/job-seekers/job-seekers-form";
import ServicesSection from "../components/job-seekers/services-section";
import { jobSeekersMetadata } from "../lib/metadata";
import { prisma } from "@/lib/prisma";

export const metadata = jobSeekersMetadata;
export const dynamic = "force-dynamic";

export default async function JobSeekersPage() {
  const [candidateCount, paidBookingCount, completedInterviewCount] = await Promise.all([
    prisma.purchase.findMany({
      select: {
        candidateEmail: true,
      },
      where: {
        serviceName: { contains: "Mock Interview" },
      },
    }).then((purchases) => new Set(purchases.map((purchase) => purchase.candidateEmail.toLowerCase())).size),
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
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 pt-20 sm:pt-32 md:pt-24 pb-12 md:pb-24 flex items-center">
          {/* Sun Rays Background Effect */}
          <div
            className="absolute top-0 left-0 w-full h-[600px] pointer-events-none overflow-hidden -z-10"
            style={{ opacity: 0.6 }}
          >
            <div
              className="absolute -top-[50%] -left-[10%] w-[150%] h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-[-45deg] blur-3xl transform origin-top-left"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, rgba(255,255,255,0) 0deg, rgba(0,0,0,0.03) 25deg, rgba(255,255,255,0) 40deg, rgba(0,0,0,0.04) 65deg, rgba(255,255,255,0) 90deg)",
              }}
            />
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-2 items-start">
            {/* Left Content */}
            <div className="pt-0 lg:pt-0 col-span-1 lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-[#252e3d] mb-12 md:mb-12">
                Career Insights & Guidance
              </h1>

              <div className="space-y-5">
                <div>
                  <h3
                    className="text-lg sm:text-xl font-semibold text-[#252e3d] mb-2"
                    style={{ fontFamily: "Crimson Text, serif" }}
                  >
                    Your Career Support Starts Here
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    JB is dedicated to helping individuals present their best
                    selves and unlock meaningful career opportunities. Whether
                    you're actively job hunting or exploring new possibilities,
                    we're here to support your journey.
                  </p>
                </div>

                <div>
                  <h4
                    className="text-lg sm:text-lg font-semibold text-[#252e3d] mb-2"
                    style={{ fontFamily: "Crimson Text, serif" }}
                  >
                    Stay Updated With Latest Roles
                  </h4>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    We regularly share job opportunities across industries.
                    Submit your resume once and receive curated opportunities
                    that fit your experience, skills, and goals.
                  </p>
                </div>

                <div>
                  <h4
                    className="text-lg sm:text-lg font-semibold text-[#252e3d] mb-2"
                    style={{ fontFamily: "Crimson Text, serif" }}
                  >
                    Simple Process for Candidates
                  </h4>
                  <ol className="list-inside list-decimal text-sm sm:text-base text-gray-700 space-y-1">
                    <li>Fill out the short form</li>
                    <li>Upload your resume</li>
                    <li>Get notified about suitable openings</li>
                  </ol>
                </div>

                <div className="w-full">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
                    • We do not charge candidates for job opportunities. However,
                    we offer paid career services (listed below) designed to
                    help you stand out in the job market.
                  </p>
                </div>

                <div className="w-full">
                  <h4
                    className="text-lg sm:text-lg font-semibold text-[#252e3d] mb-2"
                    style={{ fontFamily: "Crimson Text, serif" }}
                  >
                    Terms & Conditions
                  </h4>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3">
                    Please review our service terms carefully before making a
                    purchase.
                  </p>
                  <ol className="list-inside list-decimal text-sm sm:text-base text-gray-700 space-y-2 lg:pr-6">
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
            </div>

            {/* Right Content: Form */}
            <div className="w-full flex justify-center lg:justify-start col-span-1">
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-none">
                <JobSeekersForm />
              </div>
            </div>
          </div>
        </div>
        <ServicesSection
          promoMetrics={{
            candidatesServed: candidateCount,
            paidBookings: paidBookingCount,
            completedInterviews: completedInterviewCount,
          }}
        />
      </main>
    </div>
  );
}
