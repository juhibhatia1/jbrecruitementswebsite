import Image from "next/image";

export default function WhyJBSection() {
  return (
    <section className="w-full bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100">
              🧠
            </span>
            Why JB
          </div>

          <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-slate-900">
            The Challenges behind hiring and career moves.
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
            We deliver people-first recruitment support that balances speed,
            clarity, and long-term alignment — helping companies hire better and
            professionals move forward with confidence.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
          {/* Left Image Card */}
          <div className="relative h-64 overflow-hidden rounded-2xl md:h-full md:col-span-2 lg:col-span-4 lg:row-span-2">
            <Image
              src="https://images.unsplash.com/photo-1542751110-97427bbecf20"
              alt="Abstract visual"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Clear & Thoughtful Hiring */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 lg:p-10 md:col-span-2 lg:col-span-5">
            <h3 className="text-3xl font-semibold text-slate-900">
              Clear
              <span className="block text-xl font-semibold text-slate-800">
                & Thoughtful Hiring
              </span>
            </h3>

            <p className="mt-6 text-base leading-relaxed text-slate-600">
              Built on transparent communication, realistic expectations, and
              carefully evaluated profiles.
            </p>
          </div>

          {/* 3x Faster Hiring */}
          <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 md:p-8 lg:p-10 text-white md:col-span-2 lg:col-span-3">
            <h3 className="text-4xl font-semibold">3x</h3>
            <p className="mt-1 text-lg font-medium">Faster Hiring Cycles</p>

            <p className="mt-6 text-sm leading-relaxed text-indigo-100">
              Reduced time-to-hire through structured screening and role-aligned
              shortlisting.
            </p>

            {/* Subtle background arrow */}
            <div className="pointer-events-none absolute bottom-6 right-6 text-indigo-500 opacity-30">
              ➜
            </div>
          </div>

          {/* Proven Hiring Outcomes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 lg:p-10 md:col-span-2 lg:col-span-4">
            <h3 className="text-4xl font-semibold text-slate-900">120+</h3>
            <p className="mt-1 text-lg font-medium text-slate-800">
              Proven Hiring Outcomes
            </p>

            <p className="mt-6 text-sm leading-relaxed text-slate-600">
              Consistent placements across roles, industries, and experience
              levels.
            </p>
          </div>

          {/* Support That Evolves */}
          <div className="rounded-2xl bg-slate-800 p-6 md:p-8 lg:p-10 text-white md:col-span-4 lg:col-span-8">
            <h3 className="text-3xl font-semibold">
              Support That Evolves Over Time
            </h3>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300">
              We stay involved beyond a single hire — adapting our support as
              teams grow and careers progress.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-right">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:underline"
          >
            Get to Know Us
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
