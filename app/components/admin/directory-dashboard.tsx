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
  IoChevronDown,
  IoChevronUp,
} from "react-icons/io5";
import InfoTooltip from "@/app/components/ui/info-tooltip";

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
  gatewayTransactionId: string;
  status: string;
  country: string | null;
  mockInterviewStatus: string | null; // "PENDING_SCHEDULE", "SCHEDULED", "COMPLETED"
  mockInterviewDate: string | null;
  deliveryStatus: string; // "PENDING", "COMPLETED"
  deliveryDeadline: string | null;
  completionNotes: string | null;
  interviewPrepUrl?: string | null;
  interviewPrepText?: string | null;
  candidatePhone: string | null;
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

type SortField = "candidateName" | "createdAt" | "amount" | "age";
type SortOrder = "asc" | "desc";

// Helper to format service age for undelivered orders
function formatAge(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (diffMs <= 0) return "Just now";
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}


// Map ISO country codes to global regions
function getRegionCategory(countryCode: string | null): string {
  if (!countryCode) return "Others";
  const code = countryCode.toUpperCase();
  if (code === "IN") return "India";
  if (code === "AE") return "UAE";
  if (code === "GB") return "UK";
  if (code === "US") return "US";
  
  // GCC members: SA, QA, KW, OM, BH (AE is GCC but has its own bucket)
  const gccCodes = ["SA", "QA", "KW", "OM", "BH"];
  if (gccCodes.includes(code)) return "GCC";
  
  return "Others";
}

// Helper to filter purchase records by creation date
function matchPurchaseDate(purchaseDateStr: string, filterType: string, customDate: string): boolean {
  if (filterType === "all") return true;
  const pDate = new Date(purchaseDateStr);
  const now = new Date();
  
  // Set times to midnight for date-only comparisons
  const pDateStart = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate()).getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  switch (filterType) {
    case "today":
      return pDateStart === todayStart;
    case "yesterday": {
      const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
      return pDateStart === yesterdayStart;
    }
    case "last7": {
      const sevenDaysAgoStart = todayStart - 7 * 24 * 60 * 60 * 1000;
      return pDate.getTime() >= sevenDaysAgoStart;
    }
    case "last30": {
      const thirtyDaysAgoStart = todayStart - 30 * 24 * 60 * 60 * 1000;
      return pDate.getTime() >= thirtyDaysAgoStart;
    }
    case "custom": {
      if (!customDate) return true;
      const cDate = new Date(customDate);
      const cDateStart = new Date(cDate.getFullYear(), cDate.getMonth(), cDate.getDate()).getTime();
      return pDateStart === cDateStart;
    }
    default:
      return true;
  }
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
  const [paymentFilter, setPaymentFilter] = useState<"completed" | "incomplete" | "all">("completed");
  const [paymentFilterOpen, setPaymentFilterOpen] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [serviceFilterOpen, setServiceFilterOpen] = useState(false);
  const [interviewFilter, setInterviewFilter] = useState("all");
  const [interviewFilterOpen, setInterviewFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customDateFilter, setCustomDateFilter] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Candidate Drawer state
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState<string | null>(null);

  // Regional breakdown modal state
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  // Reset to page 1 on filter/sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, paymentFilter, serviceFilter, interviewFilter, dateFilter, customDateFilter, sortField, sortOrder]);

  // Lock body scroll when modals or drawers are open
  React.useEffect(() => {
    if (showRegionModal || selectedCandidateEmail) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    if (!showRegionModal) {
      setExpandedRegion(null);
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

  // Upload Prep states
  const [uploadingPrepId, setUploadingPrepId] = useState<string | null>(null);
  const [uploadingPrepLoading, setUploadingPrepLoading] = useState(false);
  const [uploadPrepError, setUploadPrepError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin");
      router.refresh();
    }
  };

  const handleUploadPrep = async (purchaseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPrepId(purchaseId);
    setUploadingPrepLoading(true);
    setUploadPrepError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/purchases/${purchaseId}/upload-prep`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");

      // Update the purchases locally so UI updates immediately
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchaseId ? { ...p, interviewPrepUrl: data.fileUrl, interviewPrepText: "AVAILABLE", deliveryStatus: "COMPLETED" } : p
        )
      );
    } catch (err: any) {
      setUploadPrepError(err.message || "Something went wrong");
    } finally {
      setUploadingPrepLoading(false);
      setUploadingPrepId(null);
      // Reset input value to allow uploading same file again if failed
      e.target.value = '';
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
        if (!existing.phone && p.candidatePhone) {
          existing.phone = p.candidatePhone;
        }
      } else {
        candidateMap.set(email, {
          name: p.candidateName,
          email: p.candidateEmail,
          phone: p.candidatePhone || undefined,
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
    const regions: Record<
      string,
      { count: number; revenue: number; details: Record<string, { count: number; revenue: number }> }
    > = {
      India: { count: 0, revenue: 0, details: {} },
      UAE: { count: 0, revenue: 0, details: {} },
      UK: { count: 0, revenue: 0, details: {} },
      US: { count: 0, revenue: 0, details: {} },
      GCC: { count: 0, revenue: 0, details: {} },
      Others: { count: 0, revenue: 0, details: {} },
    };

    candidates.forEach((c) => {
      const region = getRegionCategory(c.country);
      if (regions[region]) {
        regions[region].count += 1;
        regions[region].revenue += c.totalSpent;

        const countryLabel = c.country ? c.country.toUpperCase() : "Unknown";
        if (!regions[region].details[countryLabel]) {
          regions[region].details[countryLabel] = { count: 0, revenue: 0 };
        }
        regions[region].details[countryLabel].count += 1;
        regions[region].details[countryLabel].revenue += c.totalSpent;
      }
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

  // 3. Search, Filter, Sort — one row per Purchase/transaction
  const filteredPurchases = useMemo(() => {
    return purchases
      .filter((p) => {
        // Payment Status Filter
        if (paymentFilter === "completed" && p.status !== "COMPLETED") return false;
        if (paymentFilter === "incomplete" && p.status === "COMPLETED") return false;

        // Search
        const query = searchQuery.trim().toLowerCase();
        if (query) {
          const matchName = p.candidateName.toLowerCase().includes(query);
          const matchEmail = p.candidateEmail.toLowerCase().includes(query);
          const matchPhone = p.candidatePhone?.toLowerCase().includes(query);
          const matchService = p.serviceName.toLowerCase().includes(query);
          if (!matchName && !matchEmail && !matchPhone && !matchService) return false;
        }

        // Service Filter
        if (serviceFilter !== "all" && serviceFilter !== "none") {
          if (p.serviceName !== serviceFilter) return false;
        }

        // Interview Filter
        if (interviewFilter !== "all") {
          const isInterview =
            p.serviceName.includes("Interview") || p.serviceName.includes("Bundle");
          if (interviewFilter === "none") {
            if (isInterview && p.status === "COMPLETED") return false;
          } else {
            if (!isInterview || p.status !== "COMPLETED") return false;
            if ((p.mockInterviewStatus || "PENDING_SCHEDULE") !== interviewFilter) return false;
          }
        }

        // Date Filter — applied directly to this transaction's date
        if (!matchPurchaseDate(p.createdAt, dateFilter, customDateFilter)) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any, valB: any;
        if (sortField === "candidateName") {
          valA = a.candidateName.toLowerCase();
          valB = b.candidateName.toLowerCase();
        } else if (sortField === "createdAt") {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        } else if (sortField === "amount") {
          valA = a.amount;
          valB = b.amount;
        } else if (sortField === "age") {
          // Age applies only to completed orders that are pending delivery
          const isPendingA = a.status === "COMPLETED" && (a.deliveryStatus || "PENDING") === "PENDING";
          const isPendingB = b.status === "COMPLETED" && (b.deliveryStatus || "PENDING") === "PENDING";

          valA = isPendingA ? Date.now() - new Date(a.createdAt).getTime() : -1;
          valB = isPendingB ? Date.now() - new Date(b.createdAt).getTime() : -1;

          // Push non-pending orders to the bottom regardless of sort order
          if (valA === -1 && valB !== -1) return 1;
          if (valB === -1 && valA !== -1) return -1;
          if (valA === -1 && valB === -1) return 0;
        }
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [purchases, searchQuery, paymentFilter, serviceFilter, interviewFilter, dateFilter, customDateFilter, sortField, sortOrder]);

  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPurchases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPurchases, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / itemsPerPage));

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

  // Helper to format date + time
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        setPaymentFilterOpen(false);
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Users</span>
                    <InfoTooltip text="Total unique registered candidates across all services and applications. Click to open regional breakdown." title="Total Users" position="top" />
                  </div>
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
              <Link
                href="/admin/knowledge"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Chatbot & KB
              </Link>
              <Link
                href="/admin/interviews"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Interviews
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
            <div className="flex items-center gap-2 w-full lg:max-w-md">
              <div className="relative flex-grow">
                <IoSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search candidates by name, email, services..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none transition focus:border-[#5a58ab] focus:bg-white text-[#252e3d]"
                />
              </div>
              <InfoTooltip text="Filter candidates instantly by name, email address, phone number, or purchased service title." title="Candidate Search" position="top" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Payment Status Filter Dropdown */}
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextVal = paymentFilterOpen ? false : true;
                      setPaymentFilterOpen(nextVal);
                      setServiceFilterOpen(false);
                      setInterviewFilterOpen(false);
                    }}
                    className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-slate-100/50 hover:border-[#5a58ab]/40 transition-all shadow-2xs text-xs font-semibold text-slate-700 cursor-pointer min-w-[180px] justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <IoFilter className="text-[#5a58ab] w-3.5 h-3.5" />
                      {paymentFilter === "completed"
                        ? "Successful Payments"
                        : paymentFilter === "incomplete"
                        ? "Incomplete Payments"
                        : "All Payments"}
                    </span>
                    <span className="text-slate-400 text-[8px] ml-2">▼</span>
                  </button>
                  {paymentFilterOpen && (
                    <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                      {[
                        { val: "completed", label: "Successful Payments (Default)" },
                        { val: "incomplete", label: "Incomplete / Failed (Follow-up)" },
                        { val: "all", label: "All Payments" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            setPaymentFilter(item.val as any);
                            setPaymentFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors font-semibold ${
                            paymentFilter === item.val
                              ? "text-[#5a58ab] bg-[#5a58ab]/5"
                              : "text-slate-700"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <InfoTooltip text="Filter candidates by verified completed payments vs incomplete checkout attempts." title="Payment Status Filter" position="bottom" />
              </div>

              {/* Custom Service Filter Dropdown */}
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextVal = serviceFilterOpen ? null : "service";
                      setServiceFilterOpen(nextVal === "service");
                      setInterviewFilterOpen(false);
                      setPaymentFilterOpen(false);
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
                <InfoTooltip text="Filter candidates by specific service package purchased." title="Service Filter" position="bottom" />
              </div>

              {/* Custom Interview Filter Dropdown */}
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextVal = interviewFilterOpen ? null : "interview";
                      setInterviewFilterOpen(nextVal === "interview");
                      setServiceFilterOpen(false);
                      setPaymentFilterOpen(false);
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
                <InfoTooltip text="Filter candidates by interview pipeline status (Pending Schedule, Scheduled, Completed, or Not Applicable)." title="Interview Filter" position="bottom" />
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-slate-100/50 hover:border-[#5a58ab]/40 transition-all shadow-2xs text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="custom">Custom Date</option>
                </select>

                {dateFilter === "custom" && (
                  <input
                    type="date"
                    value={customDateFilter}
                    onChange={(e) => setCustomDateFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#5a58ab] focus:bg-white"
                  />
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
                    onClick={() => handleSort("candidateName")}
                    className="px-6 py-4 xl:py-5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Candidate {sortField === "candidateName" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="px-6 py-4 xl:py-5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Date &amp; Time {sortField === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-6 py-4 xl:py-5">Service(s) Purchased</th>
                  <th className="px-6 py-4 xl:py-5">Delivery</th>
                  <th
                    onClick={() => handleSort("amount")}
                    className="px-6 py-4 xl:py-5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Amount {sortField === "amount" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("age")}
                    className="px-6 py-4 xl:py-5 text-right cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                  >
                    Age {sortField === "age" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium bg-slate-50/50">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  paginatedPurchases.map((p) => {
                    const isCompleted = p.status === "COMPLETED";
                    const isInterview =
                      p.serviceName.includes("Interview") || p.serviceName.includes("Bundle");
                    const isDeliveryPending =
                      isCompleted && (p.deliveryStatus || "PENDING") === "PENDING";
                    const failureReason = !isCompleted
                      ? p.completionNotes?.startsWith("Payment Failed") ||
                        p.completionNotes?.startsWith("Payment Canceled")
                        ? p.completionNotes
                        : p.status === "FAILED"
                        ? "Card declined or authentication failed"
                        : p.status === "CANCELLED"
                        ? "Payment canceled by user"
                        : "Checkout started but payment not completed"
                      : null;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => setSelectedCandidateEmail(p.candidateEmail)}
                      >
                        {/* Candidate */}
                        <td className="px-6 py-4 xl:py-5">
                          <div className="font-semibold text-slate-800 xl:text-[15px]">
                            {p.candidateName}
                          </div>
                          <div className="text-xs xl:text-sm text-slate-400 mt-0.5">
                            {p.candidateEmail}
                          </div>
                          {p.candidatePhone && (
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                              📞 {p.candidatePhone}
                            </div>
                          )}
                        </td>

                        {/* Transaction Date & Time */}
                        <td className="px-6 py-4 xl:py-5 text-slate-600 xl:text-[15px]">
                          <div>{formatDate(p.createdAt)}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {new Date(p.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>

                        {/* Service(s) */}
                        <td className="px-6 py-4 xl:py-5">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs xl:text-sm font-semibold ring-1 ring-inset ${
                                isCompleted
                                  ? "bg-slate-50 text-slate-600 ring-slate-500/10"
                                  : "bg-amber-50 text-amber-800 ring-amber-500/20"
                              }`}
                            >
                              {p.serviceName}
                              {!isCompleted && " (Incomplete)"}
                            </span>
                            {failureReason && (
                              <span className="text-[11px] text-amber-700 font-medium pl-1">
                                {failureReason}
                              </span>
                            )}
                          </div>
                        </td>


                        {/* Delivery */}
                        <td className="px-6 py-4 xl:py-5">
                          {!isCompleted ? (
                            <span className="text-xs text-slate-400 italic">—</span>
                          ) : isDeliveryPending ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs xl:text-sm font-bold text-amber-700 border border-amber-100">
                              <IoHourglass className="w-3 h-3" /> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs xl:text-sm font-bold text-emerald-700 border border-emerald-100">
                              <IoCheckmarkCircle className="w-3 h-3" /> Delivered
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 xl:py-5 font-bold text-slate-800 xl:text-[15px]">
                          {isCompleted
                            ? `${p.currency} ${p.amount.toLocaleString()}`
                            : "—"}
                        </td>

                        {/* Age */}
                        <td className="px-6 py-4 xl:py-5 text-right font-semibold whitespace-nowrap">
                          {isDeliveryPending ? (
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs xl:text-sm font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80">
                              <IoTime className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                              <span>{formatAge(p.createdAt)}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300 font-normal">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50 text-sm xl:text-base">
                <span className="text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPurchases.length)} of {filteredPurchases.length} transactions
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition font-semibold text-slate-700 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-medium text-slate-700 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition font-semibold text-slate-700 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Candidate Activity Timeline & Scheduler Drawer */}
      <div className={`fixed inset-0 z-50 overflow-hidden flex justify-end ${selectedCandidateEmail ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${selectedCandidateEmail ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSelectedCandidateEmail(null)}
        />

        {/* Drawer Panel */}
        <div className={`relative bg-white w-full max-w-lg shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#e6eefc] h-full flex flex-col transition-transform duration-300 ease-out ${selectedCandidateEmail ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedCandidate && (<>
          {/* Drawer Header */}
            <div className="p-3 px-6 border-b border-gray-100 flex justify-between items-center bg-[#fcfdfe]">
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
            <div data-lenis-prevent className="p-3 px-6 overflow-y-auto flex-grow space-y-3">
              {/* Demographics */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{selectedCandidate.name}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{selectedCandidate.email}</p>
                  </div>
                  {selectedCandidate.country && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                      <IoLocation /> {selectedCandidate.country} ({getRegionCategory(selectedCandidate.country)})
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
                            className="px-4 py-2 bg-[#5a58ab] hover:bg-[#4a489b] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            {saveLoading ? (
                              <>
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              "Save Schedule"
                            )}
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
                    ...selectedCandidate.purchases.map((p) => {
                      const isCompleted = p.status === "COMPLETED";
                      const failureReason = !isCompleted
                        ? p.completionNotes?.startsWith("Payment Failed") || p.completionNotes?.startsWith("Payment Canceled")
                          ? p.completionNotes
                          : p.status === "FAILED"
                          ? "Card declined or authentication failed"
                          : p.status === "CANCELLED"
                          ? "Payment canceled by user"
                          : "Checkout started, but payment process was not completed"
                        : null;

                      return {
                        key: `purchase-${p.id}`,
                        date: new Date(p.createdAt),
                        type: "purchase",
                        title: isCompleted ? `Purchased Service: ${p.serviceName}` : `Incomplete Payment: ${p.serviceName}`,
                        icon: <IoWallet className={`w-3.5 h-3.5 ${isCompleted ? "text-emerald-500" : "text-amber-500"}`} />,
                        color: isCompleted ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200",
                        details: (
                          <div className={`text-xs space-y-1.5 mt-2 p-3 rounded-2xl border ${
                            isCompleted ? "bg-slate-50 border-slate-100 text-slate-500" : "bg-amber-50/60 border-amber-200/80 text-amber-900"
                          }`}>
                            <p>
                              <strong>Status:</strong>{" "}
                              <span className={`font-bold ${isCompleted ? "text-emerald-600" : "text-amber-700"}`}>
                                {isCompleted ? "COMPLETED" : "INCOMPLETE / PENDING"}
                              </span>
                            </p>
                            {failureReason && (
                              <p className="p-2 bg-white border border-amber-200 rounded-xl text-amber-800 font-medium">
                                <strong>Failure Reason:</strong> {failureReason}
                              </p>
                            )}
                            {isCompleted && (
                              <p>
                                <strong>Delivery Status:</strong>{" "}
                                <span className={`font-semibold ${p.deliveryStatus === "COMPLETED" ? "text-emerald-600" : "text-amber-600"}`}>
                                  {p.deliveryStatus || "PENDING"}
                                </span>
                              </p>
                            )}
                            {p.deliveryDeadline && isCompleted && (
                              <p className="text-[10px]">
                                <strong>Deadline:</strong> {new Date(p.deliveryDeadline).toLocaleDateString()}
                              </p>
                            )}
                            <p>
                              <strong>Amount:</strong> {p.amount} {p.currency.toUpperCase()}
                            </p>
                            <p>
                              <strong>Billing Country:</strong> {p.country || "Not provided"}
                            </p>
                            <p className="font-mono text-[10px] text-slate-400 break-all mt-1 border-t border-slate-200/50 pt-1">
                              Ref: {p.gatewayTransactionId}
                            </p>
                            
                            {isCompleted && p.serviceName.toLowerCase().includes("interview prep") && (
                              <div className="mt-3 pt-3 border-t border-slate-200/50">
                                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Interview Prep Delivery</p>
                                {p.interviewPrepUrl ? (
                                  <div className="flex items-center gap-2">
                                    <a href={p.interviewPrepUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#5a58ab] hover:underline flex items-center gap-1">
                                      View Uploaded Document
                                    </a>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition w-fit shadow-xs flex items-center gap-1.5">
                                      {uploadingPrepId === p.id ? (
                                        <>
                                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#5a58ab] border-t-transparent" />
                                          <span>Uploading...</span>
                                        </>
                                      ) : (
                                        "Upload PDF Document"
                                      )}
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        accept=".pdf,.doc,.docx,.txt"
                                        disabled={uploadingPrepLoading}
                                        onChange={(e) => handleUploadPrep(p.id, e)}
                                      />
                                    </label>
                                    {uploadPrepError && uploadingPrepId === p.id && (
                                      <span className="text-red-500 text-[10px] font-medium">{uploadPrepError}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ),
                      };
                    }),
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
          </>)}
        </div>
      </div>

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
            <header className="p-3 px-6 border-b border-gray-100 flex justify-between items-center bg-[#fcfdfe] flex-shrink-0">
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
                const hasDetails = Object.keys(region.details).length > 0;
                const isExpanded = expandedRegion === region.name;

                return (
                  <div
                    key={region.name}
                    onClick={() => {
                      if (hasDetails) {
                        setExpandedRegion(isExpanded ? null : region.name);
                      }
                    }}
                    className={`bg-slate-50 border rounded-2xl p-4 transition-all duration-200 ${
                      hasDetails
                        ? "cursor-pointer hover:bg-slate-100/70 hover:border-[#5a58ab]/40 border-slate-100"
                        : "border-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5 text-[#5a58ab]">
                        <IoMap className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider text-slate-700">
                          {region.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-600">${region.revenue.toLocaleString()}</span>
                        {hasDetails && (
                          isExpanded ? (
                            <IoChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <IoChevronDown className="w-4 h-4 text-slate-400" />
                          )
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 flex justify-between items-baseline">
                      <span className="text-lg font-extrabold text-[#252e3d]">
                        {region.count} <span className="text-xs text-slate-400 font-normal">users</span>
                      </span>
                      <span className="text-xs font-semibold text-[#5a58ab] bg-indigo-50 px-2 py-0.5 rounded-md">
                        {percent}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="bg-[#5a58ab] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Drilldown details */}
                    {isExpanded && hasDetails && (
                      <div className="mt-4 pt-3.5 border-t border-slate-200/50 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Country-wise breakdown:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(region.details)
                            .sort((a, b) => b[1].count - a[1].count)
                            .map(([country, stats]) => (
                              <div
                                key={country}
                                className="flex justify-between items-center bg-white border border-slate-100 rounded-xl px-3 py-2 text-[11px]"
                              >
                                <span className="font-semibold text-slate-600">{country}</span>
                                <div className="text-right">
                                  <span className="font-bold text-slate-700 block">{stats.count} users</span>
                                  <span className="text-[9px] text-emerald-600 font-semibold block">
                                    ${stats.revenue.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
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
