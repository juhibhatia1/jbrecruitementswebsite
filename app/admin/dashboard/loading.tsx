export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f4f6fb] px-4 py-8 text-[#252e3d] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Skeleton */}
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded-full" />
              <div className="h-8 w-64 bg-slate-200 rounded-lg" />
              <div className="h-4 w-96 bg-slate-200 rounded-full" />
            </div>

            {/* Navigation buttons placeholder */}
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-slate-200 rounded-xl" />
              <div className="h-9 w-24 bg-slate-200 rounded-xl" />
              <div className="h-9 w-24 bg-slate-200 rounded-xl" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-slate-100 pt-5 gap-3">
            {/* Tabs Selector Placeholder */}
            <div className="h-10 w-64 bg-slate-200 rounded-xl" />
            {/* Range Selector Placeholder */}
            <div className="h-8 w-36 bg-slate-200 rounded-full" />
          </div>
        </header>

        {/* 6 KPI Cards Grid Skeleton */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60 space-y-3">
              <div className="h-3 w-16 bg-slate-200 rounded-full" />
              <div className="h-7 w-12 bg-slate-200 rounded-lg" />
              <div className="h-3 w-20 bg-slate-200 rounded-full" />
            </div>
          ))}
        </section>

        {/* Large Layout Panels Grid Skeleton */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Chart Section Placeholder */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-slate-200 rounded-full" />
                <div className="h-3 w-36 bg-slate-200 rounded-full" />
              </div>
              <div className="h-7 w-28 bg-slate-200 rounded-lg" />
            </div>
            {/* Chart Area placeholder */}
            <div className="h-56 bg-slate-100/70 rounded-2xl border border-slate-200/50 flex items-center justify-center">
              <div className="h-36 w-full px-6 flex items-end justify-between gap-2">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-200 rounded-t-lg w-full"
                    style={{ height: `${20 + Math.random() * 80}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Service Distribution Placeholder */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-44 bg-slate-200 rounded-full" />
              <div className="h-3 w-32 bg-slate-200 rounded-full" />
            </div>

            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-36 bg-slate-200 rounded-full" />
                    <div className="h-4 w-12 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
