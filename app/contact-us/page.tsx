import Image from "next/image";
import ContactForm from "../components/contact-us/contact-form";
import ScrollAnimation from "../components/ui/scroll-animation";
import { CiMail } from "react-icons/ci";
import { MdLocalPhone } from "react-icons/md";
import { Metadata } from "next";
import { contactMetadata } from "../lib/metadata";
import { PiHandsClappingFill } from "react-icons/pi";

export const metadata: Metadata = contactMetadata;

export default function ContactPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      <main className="flex-grow bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 sm:py-16 md:py-24 flex items-start md:items-center relative">
          {/* Subtle circular background blur */}
          <div className="pointer-events-none -z-10 absolute inset-0 flex">
            <div className="absolute left-6 top-6 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#eef0ff] via-[#f7f7ff] to-transparent opacity-60 blur-3xl hidden sm:block" />
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* LEFT CONTENT */}
            <ScrollAnimation variant="fadeUp" className="space-y-8">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#252e3d] leading-tight"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Let’s Connect
              </h1>

              <p
                className="text-[#252e3d] leading-relaxed text-base sm:text-lg"
                style={{ fontFamily: "Palatino Linotype, sans-serif" }}
              >
                Whether you're an organisation looking to hire or a professional
                exploring your next opportunity, we’re here to support you with
                clarity, warmth, and expertise.
              </p>

              {/* Founder */}
              {/* <div className="flex items-center gap-4 pt-4">
                <Image
                  src="/founder.jpeg"
                  alt="Founder"
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />
                <div>
                  <p
                  <h4 className="font-semibold text-[#252e3d] mb-2 text-lg md:text-xl">Companies</h4>
                  <p className="text-base text-gray-600">We help businesses hire candidates who are not just qualified, but truly aligned with their culture and goals.</p>
                  >
                    Juhi Bhatia
                  </p>
                  <h4 className="font-semibold text-[#252e3d] mb-2 text-lg md:text-xl">Job Seekers</h4>
                  <p className="text-base text-gray-600">We support individuals throughout their career journey with tools and guidance that help them stand out and succeed.</p>
              </div> */}

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[#605dba] flex-shrink-0 min-w-[48px] min-h-[48px]">
                    <CiMail size={24} className="text-[#605dba]" />
                  </div>
                  <span className="text-[#252e3d] text-lg font-semibold">
                    juhi.bhatia1@gmail.com
                  </span>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[#605dba] flex-shrink-0 min-w-[48px] min-h-[48px]">
                    <PiHandsClappingFill size={24} className="text-[#605dba]" />
                  </div>
                  <span
                    className="text-[#252e3d] text-lg"
                    style={{ fontFamily: "Palatino Linotype, sans-serif" }}
                  >
                    We assist Employers and Candidates across regions and
                    industries, offering flexible recruitment support and
                    consultation.
                  </span>
                </div>
              </div>

              {/* Small Cards: Companies / Job Seekers */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border p-4 xl:p-6 shadow-sm">
                  <h4 className="font-semibold text-2xl xl:text-3xl text-[#252E3D] mb-2 xl:mb-3">
                    Companies
                  </h4>
                  <p className="text-md text-gray-600">
                    We help businesses hire candidates who are not just
                    qualified, but truly aligned with their culture and goals.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl border p-4 xl:p-6 shadow-sm">
                  <h4 className="font-semibold text-2xl xl:text-3xl text-[#252E3D] mb-2 xl:mb-3">
                    Job Seekers
                  </h4>
                  <p className="text-md text-gray-600">
                    We support individuals throughout their career journey with
                    tools and guidance that help them stand out and succeed.
                  </p>
                </div>
              </div>
            </ScrollAnimation>

            {/* RIGHT FORM */}
            <ScrollAnimation variant="slideLeft" delay={0.2}>
              <ContactForm />
            </ScrollAnimation>
          </div>
        </div>
      </main>
    </div>
  );
}
