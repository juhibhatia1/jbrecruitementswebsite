export default function SubmissionsLoading() {
  return (
    <main className="min-h-screen bg-[#f4f6fb] px-4 py-8 text-[#252e3d] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Skeleton */}
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded-full" />
              <div className="h-8 w-56 bg-slate-200 rounded-lg" />
              <div className="h-4 w-80 bg-slate-200 rounded-full" />
            </div>
            <div className="h-9 w-20 bg-slate-200 rounded-xl" />
          </div>

          {/* 4 Count Metric Cards Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-4 space-y-2 border border-slate-100">
                <div className="h-3 w-12 bg-slate-200 rounded-full" />
                <div className="h-7 w-10 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        </header>

        {/* Filters and List Section Skeleton */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input Placeholder */}
            <div className="h-11 w-full bg-slate-50 rounded-xl border border-slate-200/80 lg:max-w-xl" />
            {/* Filter Buttons Placement */}
            <div className="flex gap-2">
              <div className="h-9 w-16 bg-slate-200 rounded-xl" />
              <div className="h-9 w-20 bg-slate-200 rounded-xl" />
              <div className="h-9 w-24 bg-slate-200 rounded-xl" />
            </div>
          </div>

          {/* List of Submission Cards */}
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <div className="h-5 w-24 bg-slate-100 rounded-full" />
                      <div className="h-3.5 w-32 bg-slate-100 rounded-full" />
                    </div>
                    <div className="h-6 w-48 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-40 bg-slate-200 rounded-full" />
                  </div>
                </div>

                {/* Details layout container */}
                <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-slate-200 rounded-full" />
                    <div className="h-4.5 w-32 bg-slate-200 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-slate-200 rounded-full" />
                    <div className="h-4.5 w-32 bg-slate-200 rounded-full" />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5 pt-2">
                    <div className="h-3 w-24 bg-slate-200 rounded-full" />
                    <div className="h-4.5 w-full bg-slate-200 rounded-full" />
                    <div className="h-4.5 w-3/4 bg-slate-200 rounded-full" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
