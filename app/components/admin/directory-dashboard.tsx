"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IoSearch,
  IoFilter,
  IoCalendar,
  IoWallet,
  IoLocation,
  IoChevronForward,
  IoClose,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoHourglass,
  IoMap,
  IoTime,
} from "react-icons/io5";

interface AdminSubmission {
  id: string;
  type: "contact" | "job-seeker";
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  location?: string;
  description?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  requestMeta?: {
    sourcePath?: string;
    referrer?: string;
    ipAddress?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
    deviceType?: string;
    country?: string;
    region?: string;
    city?: string;
  };
}

interface Purchase {
  id: string;
  candidateName: string;
  candidateEmail: string;
  serviceName: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  status: string;
  country: string | null;
  mockInterviewStatus: string | null; // "PENDING_SCHEDULE", "SCHEDULED", "COMPLETED"
  mockInterviewDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DirectoryDashboardProps {
  submissions: AdminSubmission[];
  purchases: Purchase[];
  dbError?: string | null;
}

interface Candidate {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  firstSeen: string;
  totalSpent: number;
  country: string | null;
  submissions: AdminSubmission[];
  purchases: Purchase[];
}

type SortField = "name" | "firstSeen" | "totalSpent";
type SortOrder = "asc" | "desc";

// Map ISO country codes to global regions
const REGION_MAPPING: Record<string, string> = {
  // North America
  US: "North America",
  CA: "North America",
  MX: "North America",
  // Europe
  GB: "Europe",
  FR: "Europe",
  DE: "Europe",
  IT: "Europe",
  ES: "Europe",
  NL: "Europe",
  BE: "Europe",
  CH: "Europe",
  SE: "Europe",
  NO: "Europe",
  DK: "Europe",
  FI: "Europe",
  IE: "Europe",
  PT: "Europe",
  PL: "Europe",
  AT: "Europe",
  RU: "Europe",
  // Asia-Pacific
  IN: "Asia-Pacific",
  AU: "Asia-Pacific",
  NZ: "Asia-Pacific",
  SG: "Asia-Pacific",
  JP: "Asia-Pacific",
  CN: "Asia-Pacific",
  MY: "Asia-Pacific",
  TH: "Asia-Pacific",
  ID: "Asia-Pacific",
  PH: "Asia-Pacific",
  VN: "Asia-Pacific",
  HK: "Asia-Pacific",
  KR: "Asia-Pacific",
};

function getRegion(countryCode: string | null): string {
  if (!countryCode) return "Unknown";
  const code = countryCode.toUpperCase();
  return REGION_MAPPING[code] || "Rest of World";
}

export default function DirectoryDashboard({
  submissions,
  purchases: initialPurchases,
  dbError = null,
}: DirectoryDashboardProps) {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [serviceFilterOpen, setServiceFilterOpen] = useState(false);
  const [interviewFilter, setInterviewFilter] = useState("all");
  const [interviewFilterOpen, setInterviewFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("firstSeen");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Selected Candidate Drawer state
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState<string | null>(null);

  // Regional breakdown modal state
  const [showRegionModal, setShowRegionModal] = useState(false);

  // Lock body scroll when modals or drawers are open
  React.useEffect(() => {
    if (showRegionModal || selectedCandidateEmail) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showRegionModal, selectedCandidateEmail]);

  // Scheduling states for the selected purchase
  const [schedulingPurchaseId, setSchedulingPurchaseId] = useState<string | null>(null);
  const [schedulingStatus, setSchedulingStatus] = useState("");
  const [schedulingDate, setSchedulingDate] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin");
      router.refresh();
    }
  };

  // 1. Consolidate submissions and purchases by candidate email
  const candidates = useMemo(() => {
    const candidateMap = new Map<string, Candidate>();

    // Process Submissions
    submissions.forEach((sub) => {
      const email = sub.email.toLowerCase();
      const existing = candidateMap.get(email);

      if (existing) {
        existing.submissions.push(sub);
        // Keep the oldest registration date as firstSeen
        if (new Date(sub.createdAt) < new Date(existing.firstSeen)) {
          existing.firstSeen = sub.createdAt;
        }
        if (!existing.phone && sub.phone) {
          existing.phone = sub.phone;
        }
        if (!existing.location && sub.location) {
          existing.location = sub.location;
        }
      } else {
        candidateMap.set(email, {
          name: sub.name,
          email: sub.email,
          phone: sub.phone,
          location: sub.location,
          firstSeen: sub.createdAt,
          totalSpent: 0,
          country: sub.requestMeta?.country || null,
          submissions: [sub],
          purchases: [],
        });
      }
    });

    // Process Purchases
    purchases.forEach((p) => {
      const email = p.candidateEmail.toLowerCase();
      const existing = candidateMap.get(email);
      const isCompleted = p.status === "COMPLETED";
      const purchaseAmount = isCompleted ? p.amount : 0;

      if (existing) {
        existing.purchases.push(p);
        existing.totalSpent += purchaseAmount;
        if (new Date(p.createdAt) < new Date(existing.firstSeen)) {
          existing.firstSeen = p.createdAt;
        }
        if (!existing.country && p.country) {
          existing.country = p.country;
        }
      } else {
        candidateMap.set(email, {
          name: p.candidateName,
          email: p.candidateEmail,
          firstSeen: p.createdAt,
          totalSpent: purchaseAmount,
          country: p.country,
          submissions: [],
          purchases: [p],
        });
      }
    });

    return Array.from(candidateMap.values());
  }, [submissions, purchases]);

  // Get active candidate list for drawer
  const selectedCandidate = useMemo(() => {
    if (!selectedCandidateEmail) return null;
    return candidates.find((c) => c.email.toLowerCase() === selectedCandidateEmail.toLowerCase()) || null;
  }, [selectedCandidateEmail, candidates]);

  // 2. Regional Analytics aggregates
  const regionalAnalytics = useMemo(() => {
    const regions = {
      "North America": { count: 0, revenue: 0 },
      Europe: { count: 0, revenue: 0 },
      "Asia-Pacific": { count: 0, revenue: 0 },
      "Rest of World": { count: 0, revenue: 0 },
      Unknown: { count: 0, revenue: 0 },
    };

    candidates.forEach((c) => {
      const region = getRegion(c.country) as keyof typeof regions;
      regions[region].count += 1;
      regions[region].revenue += c.totalSpent;
    });

    return Object.entries(regions).map(([name, data]) => ({
      name,
      ...data,
    }));
  }, [candidates]);

  // Get all unique services for filtering
  const uniqueServices = useMemo(() => {
    const services = new Set<string>();
    purchases.forEach((p) => {
      if (p.status === "COMPLETED") {
        services.add(p.serviceName);
      }
    });
    return Array.from(services);
  }, [purchases]);

  // 3. Search, Filter, Sort Candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        // Search
        const query = searchQuery.trim().toLowerCase();
        if (query) {
          const matchName = c.name.toLowerCase().includes(query);
          const matchEmail = c.email.toLowerCase().includes(query);
          const matchService = c.purchases.some((p) =>
            p.serviceName.toLowerCase().includes(query)
          );
          if (!matchName && !matchEmail && !matchService) return false;
        }

        // Service Filter
        if (serviceFilter !== "all") {
          if (serviceFilter === "none") {
            if (c.purchases.filter((p) => p.status === "COMPLETED").length > 0) return false;
          } else {
            const hasService = c.purchases.some(
              (p) => p.status === "COMPLETED" && p.serviceName === serviceFilter
            );
            if (!hasService) return false;
          }
        }

        // Interview Filter
        if (interviewFilter !== "all") {
          // Find if candidate has mock interview eligible purchases
          const interviewPurchases = c.purchases.filter(
            (p) =>
              p.status === "COMPLETED" &&
              (p.serviceName.includes("Interview") || p.serviceName.includes("Bundle"))
          );

          if (interviewFilter === "none") {
            if (interviewPurchases.length > 0) return false;
          } else {
            const matchStatus = interviewPurchases.some(
              (p) => (p.mockInterviewStatus || "PENDING_SCHEDULE") === interviewFilter
            );
            if (!matchStatus) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortField === "firstSeen") {
          valA = new Date(a.firstSeen).getTime();
          valB = new Date(b.firstSeen).getTime();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [candidates, searchQuery, serviceFilter, interviewFilter, sortField, sortOrder]);

  // Handle scheduling save
  const handleSaveSchedule = async (purchaseId: string) => {
    setSaveLoading(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/admin/purchases/${purchaseId}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mockInterviewStatus: schedulingStatus,
          mockInterviewDate: schedulingDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save schedule details");
      }

      const updatedPurchase = await response.json();

      // Update local state purchases
      setPurchases((prev) =>
        prev.map((p) => (p.id === purchaseId ? updatedPurchase : p))
      );

      setSchedulingPurchaseId(null);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Failed to save schedule details");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Helper to format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get status color tag for Mock Interview
  const getInterviewBadgeColor = (status: string | null) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200";
      case "SCHEDULED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <main 
      onClick={() => {
        setServiceFilterOpen(false);
        setInterviewFilterOpen(false);
      }}
      className="min-h-screen bg-[#f4f6fb] px-4 py-8 text-[#252e3d] sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Card */}
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col md:flex-row md:items-center gap-6 flex-grow">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">
                  Admin Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-[#252e3d] sm:text-4xl" style={{ fontFamily: "Crimson Text, serif" }}>
                  Global User Directory
                </h1>
                <p className="mt-2 text-sm text-slate-500 max-w-xl">
                  Consolidate and search candidate profiles, check regional analytics, and schedule mock interview appointments.
                </p>
              </div>

              {/* Total Users Interactive Card */}
              <button
                type="button"
                onClick={() => setShowRegionModal(true)}
                className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 hover:border-[#5a58ab] rounded-2xl p-4 transition-all duration-300 text-left cursor-pointer group shadow-2xs md:min-w-[200px] shrink-0"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#5a58ab] group-hover:bg-[#5a58ab] group-hover:text-white transition-colors duration-300">
                  <IoMap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Users</span>
                  <span className="text-2xl font-extrabold text-[#252e3d] group-hover:text-[#5a58ab] transition-colors">{candidates.length}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 group-hover:text-slate-500 transition-colors">Click for regional stats</span>
                </div>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              <Link
                href="/admin/dashboard"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Analytics
              </Link>
              <Link
                href="/admin/submissions"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Submissions
              </Link>
              <Link
                href="/admin/directory"
                className="rounded-xl bg-[#252e3d] px-4 py-2 text-sm font-semibold text-white transition"
              >
                User Directory
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </header>

        {dbError && (
          <div className="p-5 bg-amber-50 border-l-4 border-amber-500 rounded-3xl text-amber-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <IoAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <span>{dbError}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer self-start sm:self-auto"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Directory Grid */}
        <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <IoSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search candidates by name, email, services..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none transition focus:border-[#5a58ab] focus:bg-white text-[#252e3d]"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Custom Service Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextVal = serviceFilterOpen ? null : "service";
                    setServiceFilterOpen(nextVal === "service");
                    setInterviewFilterOpen(false);
                  }}
                  className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-slate-100/50 hover:border-[#5a58ab]/40 transition-all shadow-2xs text-xs font-semibold text-slate-700 cursor-pointer min-w-[130px] justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <IoFilter className="text-[#5a58ab] w-3.5 h-3.5" />
                    {serviceFilter === "all" ? "All Services" : serviceFilter === "none" ? "No Purchase" : serviceFilter}
                  </span>
                  <span className="text-slate-400 text-[8px] ml-2">▼</span>
                </button>
                {serviceFilterOpen && (
                  <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setServiceFilter("all");
                        setServiceFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors font-semibold ${serviceFilter === "all" ? "text-[#5a58ab] bg-[#5a58ab]/5" : "text-slate-700"}`}
                    >
                      All Services
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceFilter("none");
                        setServiceFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors font-semibold ${serviceFilter === "none" ? "text-[#5a58ab] bg-[#5a58ab]/5" : "text-slate-700"}`}
                    >
                      No Purchase
                    </button>
                    {uniqueServices.map((srv) => (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => {
                          setServiceFilter(srv);
                          setServiceFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors font-semibold ${serviceFilter === srv ? "text-[#5a58ab] bg-[#5a58ab]/5" : "text-slate-700"}`}
                      >
                        {srv}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Interview Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextVal = interviewFilterOpen ? null : "interview";
                    setInterviewFilterOpen(nextVal === "interview");
                    setServiceFilterOpen(false);
                  }}
                  className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-slate-100/50 hover:border-[#5a58ab]/40 transition-all shadow-2xs text-xs font-semibold text-slate-700 cursor-pointer min-w-[170px] justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <IoCalendar className="text-[#5a58ab] w-3.5 h-3.5" />
                    {interviewFilter === "all" ? "All Interview Statuses" : interviewFilter === "none" ? "Not Applicable" : interviewFilter === "PENDING_SCHEDULE" ? "Pending Schedule" : interviewFilter === "SCHEDULED" ? "Scheduled" : "Completed"}
                  </span>
                  <span className="text-slate-400 text-[8px] ml-2">▼</span>
                </button>
                {interviewFilterOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                    {[
                      { val: "all", label: "All Interview Statuses" },
                      { val: "none", label: "Not Applicable" },
                      { val: "PENDING_SCHEDULE", label: "Pending Schedule" },
                      { val: "SCHEDULED", label: "Scheduled" },
                      { val: "COMPLETED", label: "Completed" }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setInterviewFilter(item.val);
                          setInterviewFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors font-semibold ${interviewFilter === item.val ? "text-[#5a58ab] bg-[#5a58ab]/5" : "text-slate-700"}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grid Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm xl:text-base">
              <thead className="bg-slate-50 text-xs xl:text-sm font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="px-6 py-4 xl:py-5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Candidate {sortField === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("firstSeen")}
                    className="px-6 py-4 xl:py-5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Registered {sortField === "firstSeen" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-6 py-4 xl:py-5">Services Purchased</th>
                  <th className="px-6 py-4 xl:py-5">Mock Interview</th>
                  <th
                    onClick={() => handleSort("totalSpent")}
                    className="px-6 py-4 xl:py-5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Total Spent {sortField === "totalSpent" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-6 py-4 xl:py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium bg-slate-50/50">
                      No candidates found matching the active search parameters.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const activeInterviewPurchases = candidate.purchases.filter(
                      (p) =>
                        p.status === "COMPLETED" &&
                        (p.serviceName.includes("Interview") || p.serviceName.includes("Bundle"))
                    );
                    const latestInterview = activeInterviewPurchases[0] || null;

                    return (
                      <tr
                        key={candidate.email}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => setSelectedCandidateEmail(candidate.email)}
                      >
                        <td className="px-6 py-4 xl:py-5">
                          <div className="font-semibold text-slate-800 xl:text-[15px]">{candidate.name}</div>
                          <div className="text-xs xl:text-sm text-slate-400 mt-0.5">{candidate.email}</div>
                        </td>
                        <td className="px-6 py-4 xl:py-5 text-slate-600 xl:text-[15px]">
                          {formatDate(candidate.firstSeen)}
                        </td>
                        <td className="px-6 py-4 xl:py-5">
                          {candidate.purchases.filter((p) => p.status === "COMPLETED").length === 0 ? (
                            <span className="text-xs xl:text-sm text-slate-400 italic">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {candidate.purchases
                                .filter((p) => p.status === "COMPLETED")
                                .map((p) => (
                                  <span
                                    key={p.id}
                                    className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs xl:text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10"
                                  >
                                    {p.serviceName}
                                  </span>
                                ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 xl:py-5">
                          {!latestInterview ? (
                            <span className="text-xs xl:text-sm text-slate-400 italic">Not Applicable</span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs xl:text-sm font-bold border ${getInterviewBadgeColor(
                                latestInterview.mockInterviewStatus
                              )}`}
                            >
                               {latestInterview.mockInterviewStatus === "COMPLETED" && <IoCheckmarkCircle />}
                               {latestInterview.mockInterviewStatus === "SCHEDULED" && <IoCalendar />}
                               {(latestInterview.mockInterviewStatus || "PENDING_SCHEDULE") ===
                                 "PENDING_SCHEDULE" && <IoHourglass />}
                               {latestInterview.mockInterviewStatus === "SCHEDULED" && latestInterview.mockInterviewDate
                                 ? `${formatDate(latestInterview.mockInterviewDate)}`
                                 : latestInterview.mockInterviewStatus || "PENDING_SCHEDULE"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 xl:py-5 font-bold text-slate-800 xl:text-[15px]">
                          USD {candidate.totalSpent}
                        </td>
                        <td className="px-6 py-4 xl:py-5 text-right">
                          <button className="text-slate-400 group-hover:text-[#5a58ab] p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                            <IoChevronForward className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Candidate Activity Timeline & Scheduler Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedCandidateEmail(null)}
          />

          {/* Drawer Panel */}
          <div className="relative bg-white w-full max-w-lg shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#e6eefc] h-full flex flex-col transform transition-transform">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fcfdfe]">
              <div>
                <h3 className="text-xl font-bold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
                  Candidate Profile
                </h3>
                <p className="text-xs text-slate-400 mt-1">Timeline & Activity Logs</p>
              </div>
              <button
                onClick={() => setSelectedCandidateEmail(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div data-lenis-prevent className="p-6 overflow-y-auto flex-grow space-y-6">
              {/* Demographics */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{selectedCandidate.name}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{selectedCandidate.email}</p>
                  </div>
                  {selectedCandidate.country && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                      <IoLocation /> {selectedCandidate.country} ({getRegion(selectedCandidate.country)})
                    </span>
                  )}
                </div>

                {selectedCandidate.phone && (
                  <p className="text-xs text-slate-500">
                    <strong>Phone:</strong> {selectedCandidate.phone}
                  </p>
                )}
                {selectedCandidate.location && (
                  <p className="text-xs text-slate-500">
                    <strong>Location:</strong> {selectedCandidate.location}
                  </p>
                )}
              </div>

              {/* Mock Interview Scheduler */}
              {selectedCandidate.purchases.filter(
                (p) =>
                  p.status === "COMPLETED" &&
                  (p.serviceName.includes("Interview") || p.serviceName.includes("Bundle"))
              ).map((purchase) => {
                const isEditing = schedulingPurchaseId === purchase.id;

                return (
                  <div key={purchase.id} className="bg-linear-to-r from-indigo-50/50 to-purple-50/30 border border-indigo-100/50 rounded-3xl p-5">
                    <div className="flex items-center gap-1.5 text-[#5a58ab]">
                      <IoCalendar className="w-5 h-5" />
                      <h4 className="text-sm font-bold uppercase tracking-wide">Mock Interview Scheduling</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Purchased: {purchase.serviceName}
                    </p>

                    {isEditing ? (
                      <div className="mt-4 space-y-3 border-t border-indigo-100/30 pt-3">
                        {saveError && (
                          <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-1.5">
                            <IoAlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{saveError}</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Interview Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={schedulingDate}
                            onChange={(e) => setSchedulingDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:ring-1 focus:ring-[#5a58ab] text-[#252e3d]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Appointment Status
                          </label>
                          <div className="relative">
                            <select
                              value={schedulingStatus}
                              onChange={(e) => setSchedulingStatus(e.target.value)}
                              className="w-full appearance-none px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs outline-none text-[#252e3d] cursor-pointer focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] transition-all"
                            >
                              <option value="PENDING_SCHEDULE" className="bg-white text-slate-800">Pending Schedule</option>
                              <option value="SCHEDULED" className="bg-white text-slate-800">Scheduled</option>
                              <option value="COMPLETED" className="bg-white text-slate-800">Completed</option>
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[8px]">
                              ▼
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            onClick={() => setSchedulingPurchaseId(null)}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveSchedule(purchase.id)}
                            disabled={saveLoading}
                            className="px-4 py-2 bg-[#5a58ab] hover:bg-[#4a489b] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                          >
                            {saveLoading ? "Saving..." : "Save Schedule"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex justify-between items-center bg-white border border-indigo-50 p-3 rounded-2xl">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Status:</span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold mt-1 px-2 py-0.5 rounded-full border ${getInterviewBadgeColor(
                              purchase.mockInterviewStatus
                            )}`}
                          >
                            {purchase.mockInterviewStatus === "COMPLETED" && <IoCheckmarkCircle />}
                            {purchase.mockInterviewStatus === "SCHEDULED" && <IoCalendar />}
                            {(purchase.mockInterviewStatus || "PENDING_SCHEDULE") === "PENDING_SCHEDULE" && (
                              <IoHourglass />
                            )}
                            {purchase.mockInterviewStatus || "PENDING_SCHEDULE"}
                          </span>

                          {purchase.mockInterviewDate && (
                            <span className="block text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
                              <IoTime className="text-[#5a58ab]" />
                              {new Date(purchase.mockInterviewDate).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setSchedulingPurchaseId(purchase.id);
                            setSchedulingStatus(purchase.mockInterviewStatus || "PENDING_SCHEDULE");
                            setSchedulingDate(
                              purchase.mockInterviewDate
                                ? new Date(purchase.mockInterviewDate).toISOString().slice(0, 16)
                                : ""
                            );
                            setSaveError(null);
                          }}
                          className="bg-[#5a58ab]/10 hover:bg-[#5a58ab]/20 text-[#5a58ab] px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Schedule
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Interactive Timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400 flex items-center gap-1.5">
                  <IoTime className="w-5 h-5 text-slate-400" /> Activity Timeline
                </h4>

                <div className="relative border-l-2 border-slate-100 pl-6 space-y-6 ml-3">
                  {/* Map submissions and purchases into a single ordered timeline */}
                  {[
                    ...selectedCandidate.submissions.map((sub) => ({
                      key: `sub-${sub.id}`,
                      date: new Date(sub.createdAt),
                      type: "registration",
                      title: sub.type === "contact" ? "Contact Form Registration" : "Job Seeker Resume Registration",
                      icon: <IoWallet className="w-3.5 h-3.5 text-blue-500" />,
                      color: "bg-blue-50 border-blue-200",
                      details: (
                        <div className="text-xs text-slate-500 space-y-1.5 mt-2 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                          <p>
                            <strong>Phone:</strong> {sub.phone || "Not provided"}
                          </p>
                          {sub.type === "contact" ? (
                            <>
                              <p>
                                <strong>Company:</strong> {sub.company || "Not provided"}
                              </p>
                              <p>
                                <strong>Subject:</strong> {sub.subject || "General Inquiry"}
                              </p>
                              <p className="whitespace-pre-wrap mt-1 border-t border-slate-200/50 pt-1">
                                "{sub.message}"
                              </p>
                            </>
                          ) : (
                            <>
                              <p>
                                <strong>Location:</strong> {sub.location || "Not provided"}
                              </p>
                              <p>
                                <strong>Resume:</strong>{" "}
                                {sub.resumeUrl ? (
                                  <a
                                    href={sub.resumeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#5a58ab] hover:underline font-semibold"
                                  >
                                    {sub.resumeFileName || "View File"}
                                  </a>
                                ) : (
                                  "Not uploaded"
                                )}
                              </p>
                              <p className="whitespace-pre-wrap mt-1 border-t border-slate-200/50 pt-1">
                                "{sub.description || "No note provided."}"
                              </p>
                            </>
                          )}
                        </div>
                      ),
                    })),
                    ...selectedCandidate.purchases.map((p) => ({
                      key: `purchase-${p.id}`,
                      date: new Date(p.createdAt),
                      type: "purchase",
                      title: `Purchased Service: ${p.serviceName}`,
                      icon: <IoWallet className="w-3.5 h-3.5 text-emerald-500" />,
                      color: "bg-emerald-50 border-emerald-200",
                      details: (
                        <div className="text-xs text-slate-500 space-y-1 mt-2 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                          <p>
                            <strong>Status:</strong>{" "}
                            <span
                              className={`font-semibold ${
                                p.status === "COMPLETED" ? "text-emerald-600" : "text-amber-600"
                              }`}
                            >
                              {p.status}
                            </span>
                          </p>
                          <p>
                            <strong>Amount:</strong> {p.amount} {p.currency.toUpperCase()}
                          </p>
                          <p>
                            <strong>Billing Country:</strong> {p.country || "Not provided"}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400 break-all mt-1 border-t border-slate-200/50 pt-1">
                            Ref:{" "}
                            <a
                              href={`https://dashboard.stripe.com/payments/${p.stripePaymentIntentId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#5a58ab] hover:underline font-semibold"
                            >
                              {p.stripePaymentIntentId}
                            </a>
                          </p>
                        </div>
                      ),
                    })),
                  ]
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((event) => (
                      <div key={event.key} className="relative">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border bg-white shadow-xs`}
                        >
                          {event.icon}
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                            {event.date.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <h5 className="text-sm font-bold text-slate-800 mt-0.5">{event.title}</h5>
                          {event.details}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regional Contribution Drilldown Modal */}
      {showRegionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overscroll-contain">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#252e3d]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowRegionModal(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 overscroll-contain">
            {/* Header */}
            <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fcfdfe] flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
                  Regional User Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-1">Drilldown of user registration & revenue contribution</p>
              </div>
              <button
                onClick={() => setShowRegionModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </header>

            {/* Scrollable Content with thin scrollbar styling */}
            <div data-lenis-prevent className="p-6 overflow-y-auto flex-grow space-y-4 scrollbar-thin-styled">
              {regionalAnalytics.map((region) => {
                const percent = candidates.length ? Math.round((region.count / candidates.length) * 100) : 0;
                return (
                  <div key={region.name} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:bg-slate-100/50 transition-colors duration-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5 text-[#5a58ab]">
                        <IoMap className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider text-slate-700">{region.name}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">${region.revenue}</span>
                    </div>
                    
                    <div className="mt-2.5 flex justify-between items-baseline">
                      <span className="text-lg font-extrabold text-[#252e3d]">
                        {region.count} <span className="text-xs text-slate-400 font-normal">users</span>
                      </span>
                      <span className="text-xs font-semibold text-[#5a58ab] bg-indigo-50 px-2 py-0.5 rounded-md">{percent}%</span>
                    </div>
                    
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="bg-[#5a58ab] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
