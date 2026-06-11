export default function DirectoryLoading() {
  return (
    <main className="min-h-screen bg-[#f4f6fb] px-4 py-8 text-[#252e3d] sm:px-6 lg:px-10 animate-pulse">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Skeleton */}
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded-full" />
              <div className="h-8 w-64 bg-slate-200 rounded-lg" style={{ fontFamily: "Crimson Text, serif" }} />
              <div className="h-4 w-96 bg-slate-200 rounded-full" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-slate-200 rounded-xl" />
              <div className="h-9 w-20 bg-slate-200 rounded-xl" />
              <div className="h-9 w-20 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </header>

        {/* 5 Regional Analytics Boxes Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
              <div className="h-3.5 w-24 bg-slate-200 rounded-full" />
              <div className="h-8 w-16 bg-slate-200 rounded-lg" />
              <div className="h-3 w-28 bg-slate-200 rounded-full" />
            </div>
          ))}
        </section>

        {/* Directory Table Grid Section */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-5">
            {/* Search Input and Filters Placeholders */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-3xl">
              <div className="h-11 w-full sm:w-80 bg-slate-50 border border-slate-250 rounded-xl" />
              <div className="flex gap-2">
                <div className="h-11 w-28 bg-slate-200 rounded-xl" />
                <div className="h-11 w-28 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Table Outline Skeleton */}
          <div className="overflow-x-auto">
            <div className="w-full space-y-3 min-w-[600px]">
              {/* Table Header Row */}
              <div className="flex justify-between border-b border-slate-100 pb-2 text-[10px] uppercase font-bold text-slate-400">
                <div className="w-1/4">Candidate</div>
                <div className="w-1/4">Location</div>
                <div className="w-1/6">First Seen</div>
                <div className="w-1/12 text-center">Purchases</div>
                <div className="w-1/6 text-right">Revenue</div>
              </div>

              {/* Table Data Rows */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100/50">
                  <div className="w-1/4 space-y-1">
                    <div className="h-4 w-32 bg-slate-200 rounded-full" />
                    <div className="h-3.5 w-40 bg-slate-100 rounded-full" />
                  </div>
                  <div className="w-1/4">
                    <div className="h-4 w-28 bg-slate-200 rounded-full" />
                  </div>
                  <div className="w-1/6">
                    <div className="h-3.5 w-20 bg-slate-200 rounded-full" />
                  </div>
                  <div className="w-1/12 flex justify-center">
                    <div className="h-5 w-8 bg-slate-100 rounded-lg" />
                  </div>
                  <div className="w-1/6 flex justify-end">
                    <div className="h-4.5 w-16 bg-slate-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination skeleton bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="h-4.5 w-32 bg-slate-200 rounded-full" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-slate-100 border border-slate-250 rounded-lg" />
              <div className="h-8 w-8 bg-slate-100 border border-slate-250 rounded-lg" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
