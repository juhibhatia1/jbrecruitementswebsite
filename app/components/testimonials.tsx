import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-20 max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-indigo-600">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100">
              💬
            </span>
            Testimonials
          </div>

          <h2 className="text-[44px] font-semibold leading-[1.15] tracking-tight text-slate-900">
            Experiences from Companies and Professionals
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5 lg:grid-cols-12">
          {/* PRIMARY CARD */}
          <div className="md:col-span-5 lg:col-span-7">
            <div className="flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 p-10 text-white">
              {/* Quote */}
              <div>
                <span className="mb-4 block text-4xl font-bold leading-none">
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
                  src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe"
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
              <div className="mt-12 grid grid-cols-2 gap-8 border-t border-white/20 pt-8">
                <div>
                  <p className="text-4xl font-semibold">+70%</p>
                  <p className="mt-1 text-sm text-white/80">
                    Less Manual Hiring Tasks
                  </p>
                </div>

                <div>
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
                  src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe"
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
          <div className="md:col-span-2 lg:col-span-2">
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
                  src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe"
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
