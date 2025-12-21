import Image from "next/image";
import { AiOutlineMessage } from "react-icons/ai";
import ScrollAnimation from "./ui/scroll-animation";

export default function Testimonials() {
  return (
    <section
      className="bg-white py-16 md:py-28 border-t border-[#bababa]"
      style={{ fontFamily: "Geist, sans-seriff" }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-20 grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <ScrollAnimation variant="fadeUp">
              <div className="mb-3 flex items-center gap-2 text-[#605dba] text-base md:text-lg font-medium">
                <AiOutlineMessage size={20} className="text-[#605dba]" />
                Testimonials
              </div>
            </ScrollAnimation>
          </div>
          <div className="col-span-2">
            <ScrollAnimation variant="fadeUp" delay={0.1}>
              <h2 className="text-[#252e3d] text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold leading-tight">
                Experiences from Companies and Professionals
              </h2>
              <p
                className="text-[#252E3D] mt-4 md:mt-6 text-base md:text-lg lg:text-xl leading-relaxed"
                style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
              >
                Hear from hiring teams and professionals who’ve experienced a more
                thoughtful recruitment process.
              </p>
            </ScrollAnimation>
          </div>
        </div>

        {/* Top summary testimonial card */}
        <ScrollAnimation variant="fadeUp" delay={0.2} className="mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src="/home/profile-pic.jpg"
                  alt="Jenna Li"
                  width={52}
                  height={52}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Jenna Li
                  </p>
                  <p className="text-sm text-[#252E3D]">
                    Operations Director, NeoLabs
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-slate-700 text-base md:text-lg leading-relaxed">
              Juhi brings structure, clarity, and a truly people-first approach
              to hiring. She quickly understands business needs and culture,
              consistently delivering high-quality talent even in competitive
              markets. Her ability to collaborate seamlessly with stakeholders
              makes her an exceptional recruitment partner.
            </p>

            <div className="mt-8 grid grid-cols-4 gap-x-8 items-end justify-end pt-8">
              <div className="flex-1 text-center col-span-3 justify-end">
                <p
                  className="text-4xl md:text-5xl font-bold text-slate-900"
                  style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
                >
                  x7
                </p>
                <p className="mt-2 text-lg text-[#252E3D]">
                  Faster Time-to-Hire
                </p>
              </div>

              <div className="flex-1 text-center col-span-1 justify-end">
                <p
                  className="text-4xl md:text-5xl font-bold text-slate-900"
                  style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
                >
                  +50%
                </p>
                <p className="mt-2 text-lg text-[#252E3D]">
                  Stronger Role–Candidate Fit
                </p>
              </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5 lg:grid-cols-12">
          {/* PRIMARY CARD */}
          <ScrollAnimation variant="fadeUp" delay={0.3} className="md:col-span-5 lg:col-span-6">
            <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-[#53509b] to-[#3a6ac3] px-8 py-6 text-white">
              {/* Quote */}
              <div>
                <span className="block text-2xl md:text-4xl font-bold leading-none">“</span>

                <p className="max-w-xl text-lg leading-[1.7] text-white/95">
                  Juhi is a highly dependable and strategic talent acquisition
                  professional. She leads end-to-end recruitment with
                  professionalism, strong stakeholder management, and a deep
                  understanding of the talent market.
                </p>
              </div>

              {/* Author */}
              <div className="mt-10 flex items-center gap-4">
                <Image
                  src="/home/profile-pic.jpg"
                  alt="Alex Rivera"
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-lg font-semibold">Alex Rivera</p>
                  <p className="text-md text-white">
                    Product Manager, ZyloTech
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-5 justify-end items-center gap-8">
                <div className="col-span-3 text-right">
                  <p
                    className="text-4xl font-semibold"
                    style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
                  >
                    +70%
                  </p>
                  <p className="mt-1 text-sm text-white">
                    Less Manual Hiring Tasks
                  </p>
                </div>

                <div className="col-span-2  text-right">
                  <p
                    className="text-4xl font-semibold"
                    style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
                  >
                    3.5x
                  </p>
                  <p className="mt-1 text-sm text-white">
                    Hiring Process Efficiency
                  </p>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* SECONDARY DARK CARD */}
          <ScrollAnimation variant="fadeUp" delay={0.4} className="md:col-span-3 lg:col-span-3">
            <div className="flex h-full flex-col justify-between rounded-2xl bg-[#252E3D] p-6 md:p-8 text-white">
              <p className="text-lg leading-[1.7] text-white/90">
                <span className="block text-3xl font-bold leading-none">“</span>
                A methodical, reliable recruiter who delivers quality talent
                with speed, clarity, and care.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <Image
                  src="/home/profile-pic.jpg"
                  alt="Alex Rivera"
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-lg font-semibold">Alex Rivera</p>
                  <p className="text-sm text-white/70">
                    Product Manager, ZyloTech
                  </p>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* SECONDARY LIGHT CARD */}
          <ScrollAnimation variant="fadeUp" delay={0.5} className="md:col-span-2 lg:col-span-3">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <p className="text-lg leading-[1.7] text-slate-700">
                Working with Juhi has been an excellent experience. She handles
                urgent and high-pressure hiring with ease
                <span className="block text-3xl font-bold leading-none text-slate-900">
                  ”
                </span>
              </p>

              <div className="mt-8 flex items-center gap-3">
                <Image
                  src="/home/profile-pic.jpg"
                  alt="Alex Rivera"
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    Alex Rivera
                  </p>
                  <p className="text-sm text-slate-600">
                    Product Manager, ZyloTech
                  </p>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
