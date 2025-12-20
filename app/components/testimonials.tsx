import Image from "next/image";
import { AiOutlineMessage } from "react-icons/ai";

export default function Testimonials() {
  return (
    <section className="bg-white py-28 border-t border-[#bababa]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-20 max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#605dc8]">
            <AiOutlineMessage size={20} className="text-[#605dc8]" />
            Testimonials
          </div>

          <h2 className="text-[#252e3d] text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold leading-tight">
            Experiences from Companies and Professionals
          </h2>
        </div>

        {/* Top summary testimonial card */}
        <div className="mb-8">
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
                  <p className="text-sm text-slate-500">
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
                <p className="text-4xl md:text-5xl font-bold text-slate-900">
                  x7
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Faster Time-to-Hire
                </p>
              </div>

              <div className="flex-1 text-center col-span-1 justify-end">
                <p className="text-4xl md:text-5xl font-bold text-slate-900">
                  +50%
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Stronger Role–Candidate Fit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5 lg:grid-cols-12">
          {/* PRIMARY CARD */}
          <div className="md:col-span-5 lg:col-span-6">
            <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-[#7e7cc5] to-[#5a8be3] p-10 py-2 text-white">
              {/* Quote */}
              <div>
                <span className="block text-4xl font-bold leading-none">
                  “
                </span>

                <p className="max-w-xl text-[15.5px] leading-[1.7] text-white/95">
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
                  <p className="text-sm font-semibold">Alex Rivera</p>
                  <p className="text-sm text-white/80">
                    Product Manager, ZyloTech
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="mt-12 grid grid-cols-5 justify-end items-center gap-8 border-t border-white/20 pt-8">
                <div className="col-span-3 text-right">
                  <p className="text-4xl font-semibold">+70%</p>
                  <p className="mt-1 text-sm text-white/80">
                    Less Manual Hiring Tasks
                  </p>
                </div>

                <div className="col-span-2  text-right">
                  <p className="text-4xl font-semibold">3.5x</p>
                  <p className="mt-1 text-sm text-white/80">
                    Hiring Process Efficiency
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY DARK CARD */}
          <div className="md:col-span-3 lg:col-span-3">
            <div className="flex h-full flex-col justify-between rounded-2xl bg-slate-800 p-6 md:p-8 text-white">
              <p className="text-[15px] leading-[1.7] text-white/90">
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
                  <p className="text-sm font-semibold">Alex Rivera</p>
                  <p className="text-xs text-white/70">
                    Product Manager, ZyloTech
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY LIGHT CARD */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <p className="text-[15px] leading-[1.7] text-slate-700">
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
                  <p className="text-sm font-semibold text-slate-900">
                    Alex Rivera
                  </p>
                  <p className="text-xs text-slate-600">
                    Product Manager, ZyloTech
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
