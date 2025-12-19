import Image from "next/image";

export default function AdvisorTrustSection() {
  return (
    <section className="bg-[#1b1b1b] text-white">
      {/* ===== TOP: ADVISOR HIGHLIGHT ===== */}
      <div className="mx-auto max-w-7xl px-6 py-28">
        {/* Eyebrow */}
        <div className="mb-6 flex justify-center">
          <span className="flex items-center gap-2 text-sm font-medium text-indigo-400">
            ✦ Thoughtful
          </span>
        </div>

        {/* Heading */}
        <h2 className="mx-auto max-w-4xl text-center text-[44px] font-semibold leading-[1.15] tracking-tight">
          Guidance you can trust at every stage of
          <br />
          hiring.
        </h2>

        {/* Content */}
        <div className="mt-16 md:mt-20 lg:mt-24 grid grid-cols-1 gap-8 md:gap-12 lg:gap-16 lg:grid-cols-12 lg:items-center">
          {/* Image */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956"
                alt="Senior Recruitment Advisor"
                width={520}
                height={640}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Text */}
          <div className="lg:col-span-7">
            <h3 className="max-w-xl text-xl md:text-2xl lg:text-[28px] font-medium leading-[1.35]">
              Hiring Is About People, Not Just Roles.
              <br />
              Get Alignment Right, And Everything Else
              <br />
              Follows.
            </h3>

            {/* Name + CTA */}
            <div className="mt-8 flex items-center gap-4 text-sm text-slate-300">
              <span>Senior Recruitment Advisor (Name)</span>
              <button className="rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white">
                Speak
              </button>
            </div>

            {/* Divider */}
            <div className="mt-8 h-px w-full bg-white/20" />

            {/* Metrics */}
            <div className="mt-6 flex flex-wrap gap-8 md:gap-12 lg:gap-16">
              <div className="flex items-baseline gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl font-semibold">84%</span>
                <span className="text-sm text-slate-300">
                  Better role alignment
                </span>
              </div>

              <div className="flex items-baseline gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl font-semibold">5X</span>
                <span className="text-sm text-slate-300">
                  Honest communication
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM: INDUSTRY RECOGNITION ===== */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:gap-16 md:grid-cols-3">
            {/* Item 1 */}
            <div className="text-center md:border-r md:border-white/10 md:pr-8 lg:pr-12">
              <div className="mx-auto mb-6 h-16 w-16 bg-black" />
              <h4 className="text-base md:text-lg font-medium">
                Industry Recognition
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Featured by The Arab Icons for leadership and impact in global
                talent acquisition.
              </p>
            </div>

            {/* Item 2 */}
            <div className="text-center md:border-r md:border-white/10 md:px-8 lg:px-12">
              <div className="mx-auto mb-6 flex h-16 w-32 items-center justify-center rounded bg-white">
                <span className="text-base md:text-lg font-semibold text-black">
                  Favikon
                </span>
              </div>
              <h4 className="text-lg font-medium">
                Ranked #1 Careers & Office creator
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Recognised by Favikon as the #1 Careers & Office LinkedIn
                creator in the United Arab Emirates.
              </p>
            </div>

            {/* Item 3 */}
            <div className="text-center md:pl-8 lg:pl-12">
              <div className="mx-auto mb-6 h-16 w-16 bg-black" />
              <div className="mb-3 flex justify-center gap-1 text-yellow-400">
                ★★★★★
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                “The blend of AI and creativity at Automatix transformed our
                vision into reality. Exceptional support!”
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
