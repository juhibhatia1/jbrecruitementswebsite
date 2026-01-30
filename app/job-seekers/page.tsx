import JobSeekersForm from "../components/job-seekers/job-seekers-form";
import ServicesSection from "../components/job-seekers/services-section";
import { jobSeekersMetadata } from "../lib/metadata";

export const metadata = jobSeekersMetadata;

export default function JobSeekersPage() {
  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D]"
      style={{ fontFamily: "Geist, sans-seriff" }}
    >
      <main className="flex-grow">
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 pt-20 sm:pt-24 pb-12 md:pb-24 flex items-center">
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

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-start">
            {/* Left Content */}
            <div className="pt-0 lg:pt-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-[#252e3d]">
                Career Insights & Guidance
              </h1>

              <div
                className="mt-8 space-y-8"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#252e3d] mb-3" style={{ fontFamily: "Palatino Linotype, sans-seriff" }}>
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
                  <h4 className="text-base sm:text-lg font-semibold text-[#252e3d] mb-2" style={{ fontFamily: "Palatino Linotype, sans-seriff" }}>
                    Stay Updated With Latest Roles
                  </h4>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    We regularly share job opportunities across industries.
                    Submit your resume once and receive curated opportunities
                    that fit your experience, skills, and goals.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-[#252e3d] mb-3" style={{ fontFamily: "Palatino Linotype, sans-seriff" }}>
                    Simple Process for Candidates
                  </h4>
                  <ol className="list-inside list-decimal text-sm sm:text-base text-gray-700 space-y-1">
                    <li>Fill out the short form</li>
                    <li>Upload your resume</li>
                    <li>Get notified about suitable openings</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Right Content: Form */}
            <div className="w-full">
              <JobSeekersForm />
            </div>
          </div>
        </div>
        <ServicesSection />
      </main>
    </div>
  );
}
