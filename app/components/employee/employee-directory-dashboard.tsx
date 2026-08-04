"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
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
  IoTime,
  IoCheckbox,
  IoSquareOutline,
  IoLogOut,
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
  country: string | null;
  submissions: AdminSubmission[];
  purchases: Purchase[];
}

type SortField = "name" | "firstSeen" | "activeDeliveries";
type SortOrder = "asc" | "desc";

// Helper to calculate delivery deadline locally if it's null on the record
function getDeliveryDeadline(purchase: Purchase): Date {
  if (purchase.deliveryDeadline) {
    return new Date(purchase.deliveryDeadline);
  }
  const created = new Date(purchase.createdAt);
  const service = purchase.serviceName;
  let days = 5;
  if (service.includes("Ask Me Anything")) {
    days = 2; // 48 hours
  } else if (service.includes("Interview Prep")) {
    days = 3;
  }
  return new Date(created.getTime() + days * 24 * 60 * 60 * 1000);
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

export default function EmployeeDirectoryDashboard({
  submissions,
  purchases: initialPurchases,
  dbError = null,
}: DirectoryDashboardProps) {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "pending" | "completed">("all");
  const [deliveryFilterOpen, setDeliveryFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("firstSeen");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customDateFilter, setCustomDateFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Candidate Drawer state
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState<string | null>(null);
  
  // Loading states for updating delivery completion
  const [updatingPurchaseId, setUpdatingPurchaseId] = useState<string | null>(null);

  // Upload Prep states
  const [uploadingPrepId, setUploadingPrepId] = useState<string | null>(null);
  const [uploadingPrepLoading, setUploadingPrepLoading] = useState(false);
  const [uploadPrepError, setUploadPrepError] = useState<string | null>(null);

  // Reset to page 1 on filter/sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, deliveryFilter, dateFilter, customDateFilter, sortField, sortOrder]);

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (selectedCandidateEmail) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCandidateEmail]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/employee/logout", { method: "POST" });
    } finally {
      router.replace("/employee");
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
      const res = await fetch(`/api/employee/purchases/${purchaseId}/upload-prep`, {
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
          country: null,
          submissions: [sub],
          purchases: [],
        });
      }
    });

    // Process Purchases (Do not filter status completed here, process all)
    purchases.forEach((p) => {
      const email = p.candidateEmail.toLowerCase();
      const existing = candidateMap.get(email);

      if (existing) {
        existing.purchases.push(p);
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
          country: p.country,
          submissions: [],
          purchases: [p],
        });
      }
    });

    return Array.from(candidateMap.values());
  }, [submissions, purchases]);

  // Selected candidate object for drawer
  const selectedCandidate = useMemo(() => {
    if (!selectedCandidateEmail) return null;
    return candidates.find((c) => c.email.toLowerCase() === selectedCandidateEmail.toLowerCase()) || null;
  }, [selectedCandidateEmail, candidates]);

  // Handle toggling delivery completion
  const handleToggleDelivery = async (purchaseId: string, currentStatus: string) => {
    setUpdatingPurchaseId(purchaseId);
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

    try {
      const res = await fetch(`/api/employee/purchases/${purchaseId}/delivery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to update delivery status");

      const updated = await res.json();
      setPurchases((prev) => prev.map((p) => (p.id === purchaseId ? updated : p)));
      toast.success("Delivery status updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error updating delivery status. Please try again.");
    } finally {
      setUpdatingPurchaseId(null);
    }
  };

  const handleSaveNotes = async (purchaseId: string, notes: string) => {
    setUpdatingPurchaseId(purchaseId);
    try {
      const res = await fetch(`/api/employee/purchases/${purchaseId}/delivery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus: "COMPLETED", completionNotes: notes }),
      });

      if (!res.ok) throw new Error("Failed to save completion notes");

      const updated = await res.json();
      setPurchases((prev) => prev.map((p) => (p.id === purchaseId ? updated : p)));
      toast.success("Notes saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error saving notes. Please try again.");
    } finally {
      setUpdatingPurchaseId(null);
    }
  };

  // 2. Filter & Sort Candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        // Exclude candidates who have no purchase attempts (e.g. pure Contact Us form submissions)
        if (c.purchases.length === 0) return false;

        // Search name, email, services
        const query = searchQuery.trim().toLowerCase();
        if (query) {
          const matchName = c.name.toLowerCase().includes(query);
          const matchEmail = c.email.toLowerCase().includes(query);
          const matchService = c.purchases.some((p) =>
            p.serviceName.toLowerCase().includes(query)
          );
          if (!matchName && !matchEmail && !matchService) return false;
        }

        // Delivery Status Filter
        if (deliveryFilter !== "all") {
          const completedPurchases = c.purchases.filter((p) => p.status === "COMPLETED");
          if (completedPurchases.length === 0) return false;
          const hasPending = completedPurchases.some((p) => p.deliveryStatus === "PENDING");
          const hasCompleted = completedPurchases.every((p) => p.deliveryStatus === "COMPLETED");

          if (deliveryFilter === "pending" && !hasPending) return false;
          if (deliveryFilter === "completed" && !hasCompleted) return false;
        }

        // Purchase/Registration Date Filter
        const hasMatchingDate =
          dateFilter === "all" ||
          (c.purchases.length === 0
            ? matchPurchaseDate(c.firstSeen, dateFilter, customDateFilter)
            : c.purchases.some((p) =>
                matchPurchaseDate(p.createdAt, dateFilter, customDateFilter)
              ));
        if (!hasMatchingDate) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any = 0;
        let valB: any = 0;

        if (sortField === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortField === "firstSeen") {
          valA = new Date(a.firstSeen).getTime();
          valB = new Date(b.firstSeen).getTime();
        } else if (sortField === "activeDeliveries") {
          valA = a.purchases.filter((p) => p.status === "COMPLETED" && p.deliveryStatus === "PENDING").length;
          valB = b.purchases.filter((p) => p.status === "COMPLETED" && p.deliveryStatus === "PENDING").length;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [candidates, searchQuery, deliveryFilter, dateFilter, customDateFilter, sortField, sortOrder]);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCandidates, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / itemsPerPage));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Helper to format deadline and determine status classes
  const getDeadlineStatus = (purchase: Purchase) => {
    if (purchase.deliveryStatus === "COMPLETED") {
      return {
        label: "Delivered",
        classes: "text-emerald-600 bg-emerald-50 border-emerald-100",
        icon: <IoCheckmarkCircle className="w-3.5 h-3.5" />,
      };
    }

    const deadline = getDeliveryDeadline(purchase);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0) {
      // Overdue
      const daysOver = Math.abs(Math.floor(diffHours / 24));
      const label = daysOver > 0 ? `Overdue by ${daysOver}d` : "Overdue";
      return {
        label,
        classes: "text-rose-600 bg-rose-50 border-rose-100 animate-pulse",
        icon: <IoAlertCircle className="w-3.5 h-3.5" />,
      };
    } else if (diffHours <= 24) {
      // Due soon (within 24 hours)
      return {
        label: `Due in ${Math.round(diffHours)}h`,
        classes: "text-amber-600 bg-amber-50 border-amber-100 font-semibold",
        icon: <IoTime className="w-3.5 h-3.5" />,
      };
    } else {
      // Safe
      const days = Math.round(diffHours / 24);
      return {
        label: `Due in ${days}d`,
        classes: "text-slate-500 bg-slate-50 border-slate-200",
        icon: <IoHourglass className="w-3.5 h-3.5" />,
      };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main
      onClick={() => setDeliveryFilterOpen(false)}
      className="min-h-screen bg-[#f4f6fb] px-4 py-8 text-[#252e3d] sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Card */}
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">
                JB Recruitment solutions
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#252e3d] sm:text-4xl" style={{ fontFamily: "Crimson Text, serif" }}>
                Employee Portal
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                View candidate paid orders, track delivery deadlines, and check off completed delivery items.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <Link
                href="/employee/directory"
                className="rounded-xl bg-[#252e3d] px-4 py-2 text-sm font-semibold text-white"
              >
                Candidate Directory
              </Link>
              <Link
                href="/employee/interviews"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Interviews
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
              >
                <IoLogOut className="w-4 h-4" />
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

        {/* Directory Section */}
        <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <IoSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search candidates, services..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none transition focus:border-[#5a58ab] focus:bg-white text-[#252e3d]"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeliveryFilterOpen(!deliveryFilterOpen);
                  }}
                  className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-slate-100/50 hover:border-[#5a58ab]/40 transition-all shadow-2xs text-xs font-semibold text-slate-700 cursor-pointer min-w-[170px] justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <IoFilter className="text-[#5a58ab] w-3.5 h-3.5" />
                    {deliveryFilter === "all"
                      ? "All Deliveries"
                      : deliveryFilter === "pending"
                      ? "Pending Delivery"
                      : "Completed Delivery"}
                  </span>
                  <span className="text-slate-400 text-[8px] ml-2">▼</span>
                </button>
                {deliveryFilterOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                    {[
                      { val: "all", label: "All Deliveries" },
                      { val: "pending", label: "Pending Delivery" },
                      { val: "completed", label: "Completed Delivery" },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setDeliveryFilter(item.val as any);
                          setDeliveryFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors font-semibold ${
                          deliveryFilter === item.val
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

          {/* Table Grid */}
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
                    Order Date {sortField === "firstSeen" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-6 py-4 xl:py-5">Paid Services</th>
                  <th
                    onClick={() => handleSort("activeDeliveries")}
                    className="px-6 py-4 xl:py-5 cursor-pointer hover:bg-slate-100 transition-colors animate-in"
                  >
                    Delivery Status {sortField === "activeDeliveries" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-6 py-4 xl:py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium bg-slate-50/50">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  paginatedCandidates.map((candidate) => {
                    const completedPurchases = candidate.purchases.filter((p) => p.status === "COMPLETED");
                    const pendingCount = completedPurchases.filter((p) => p.deliveryStatus === "PENDING").length;
                    const totalCount = completedPurchases.length;

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
                          {candidate.purchases.length === 0 ? (
                            <span className="text-xs xl:text-sm text-slate-400 italic">None</span>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              {candidate.purchases.map((p) => {
                                const isCompleted = p.status === "COMPLETED";
                                const failureReason = !isCompleted
                                  ? p.completionNotes?.startsWith("Payment Failed") || p.completionNotes?.startsWith("Payment Canceled")
                                    ? p.completionNotes
                                    : p.status === "FAILED"
                                    ? "Card declined or authentication failed"
                                    : p.status === "CANCELLED"
                                    ? "Payment canceled by user"
                                    : "Checkout started but payment not completed"
                                  : null;

                                return (
                                  <div key={p.id} className="flex flex-col gap-0.5">
                                    <span
                                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs xl:text-sm font-semibold ring-1 ring-inset ${
                                        isCompleted
                                          ? "bg-slate-50 text-slate-600 ring-slate-500/10"
                                          : "bg-amber-50 text-amber-800 ring-amber-500/20"
                                      }`}
                                    >
                                      {p.serviceName} {!isCompleted && "(Incomplete Payment)"}
                                    </span>
                                    {failureReason && (
                                      <span className="text-[11px] text-amber-700 font-medium pl-1">
                                        Reason: {failureReason}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 xl:py-5">
                          {totalCount === 0 ? (
                            <span className="text-xs xl:text-sm text-slate-400 italic">Not Applicable</span>
                          ) : pendingCount === 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs xl:text-sm font-bold text-emerald-700 border border-emerald-100">
                              <IoCheckmarkCircle /> All Delivered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs xl:text-sm font-bold text-amber-700 border border-amber-100">
                              <IoHourglass /> {pendingCount} of {totalCount} Pending
                            </span>
                          )}
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
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50 text-sm xl:text-base">
                <span className="text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length} entries
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

      {/* Candidate Activity & Service Delivery Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setSelectedCandidateEmail(null)}
          />

          {/* Drawer Panel */}
          <div className="relative bg-white w-full max-w-lg shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#e6eefc] h-full flex flex-col transform transition-all duration-300">
            {/* Drawer Header */}
            <div className="p-3 px-6 border-b border-gray-100 flex justify-between items-center bg-[#fcfdfe]">
              <div>
                <h3 className="text-xl font-bold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
                  Delivery Tracking
                </h3>
                <p className="text-xs text-slate-400 mt-1">Manage deliverables & deadlines</p>
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
              {/* Demographics Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-2">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{selectedCandidate.name}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{selectedCandidate.email}</p>
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

              {/* Deliverables List */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
                  Purchased Services (Deliverables)
                </h4>

                <div className="space-y-4">
                  {selectedCandidate.purchases.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No purchase attempts for this candidate.</p>
                  ) : (
                    selectedCandidate.purchases.map((purchase) => {
                      const isCompleted = purchase.status === "COMPLETED";
                      const failureReason = !isCompleted
                        ? purchase.completionNotes?.startsWith("Payment Failed") || purchase.completionNotes?.startsWith("Payment Canceled")
                          ? purchase.completionNotes
                          : purchase.status === "FAILED"
                          ? "Card declined or authentication failed"
                          : purchase.status === "CANCELLED"
                          ? "Payment canceled by user"
                          : "Checkout started, but payment process was not completed"
                        : null;

                      const statusInfo = getDeadlineStatus(purchase);
                      const deadline = getDeliveryDeadline(purchase);

                      return (
                        <div
                          key={purchase.id}
                          className={`border rounded-3xl p-5 shadow-xs space-y-3 ${
                            isCompleted ? "bg-white border-slate-100" : "bg-amber-50/60 border-amber-200/80"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h5 className="font-semibold text-slate-800 text-sm xl:text-base">{purchase.serviceName}</h5>
                              <span className="text-[10px] text-slate-400 mt-1 block uppercase font-bold tracking-wider">
                                Amount: {purchase.amount} {purchase.currency.toUpperCase()} · {formatDate(purchase.createdAt)}
                              </span>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                isCompleted ? statusInfo.classes : "bg-amber-100 text-amber-800 border-amber-300"
                              }`}
                            >
                              {isCompleted ? statusInfo.icon : <IoAlertCircle className="w-3.5 h-3.5" />}
                              {isCompleted ? statusInfo.label : "Payment Incomplete"}
                            </span>
                          </div>

                          {failureReason && (
                            <div className="p-2.5 bg-white border border-amber-200/80 rounded-xl text-xs text-amber-800 font-medium">
                              <strong>Failure Reason:</strong> {failureReason}
                            </div>
                          )}

                          {isCompleted && purchase.deliveryStatus === "PENDING" && (
                            <div className="text-xs text-slate-400 font-medium">
                              <strong>Deadline:</strong> {deadline.toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          )}

                            {/* Complete delivery Toggle */}
                            <div className="border-t border-slate-100/70 pt-3 flex justify-between items-center">
                              <span className="text-xs text-slate-500 font-semibold">
                                {purchase.deliveryStatus === "COMPLETED" ? "Mark Deliverable Pending:" : "Mark Deliverable Done:"}
                              </span>

                              <button
                                onClick={() => handleToggleDelivery(purchase.id, purchase.deliveryStatus)}
                                disabled={updatingPurchaseId === purchase.id}
                                className="flex items-center gap-1.5 bg-[#5a58ab]/10 hover:bg-[#5a58ab]/20 text-[#5a58ab] px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer disabled:opacity-60"
                              >
                                {purchase.deliveryStatus === "COMPLETED" ? (
                                  <>
                                    <IoCheckbox className="w-4 h-4" /> Reset
                                  </>
                                ) : (
                                  <>
                                    <IoSquareOutline className="w-4 h-4" /> Done
                                  </>
                                )}
                              </button>
                            </div>

                            {purchase.deliveryStatus === "COMPLETED" && (
                              <div className="border-t border-slate-100/50 pt-3 mt-2 space-y-2">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Completion Notes:
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    defaultValue={purchase.completionNotes || ""}
                                    placeholder="Enter completion notes..."
                                    id={`notes-input-${purchase.id}`}
                                    className="flex-grow text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5a58ab] focus:border-[#5a58ab]"
                                  />
                                  <button
                                    onClick={async () => {
                                      const inputEl = document.getElementById(`notes-input-${purchase.id}`) as HTMLInputElement;
                                      const notes = inputEl?.value || "";
                                      await handleSaveNotes(purchase.id, notes);
                                    }}
                                    className="px-3 py-2 bg-[#5a58ab] hover:bg-[#484694] text-white rounded-xl text-xs font-semibold transition"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Interactive Timeline */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400 flex items-center gap-1.5">
                  <IoTime className="w-5 h-5 text-slate-400" /> Activity Timeline
                </h4>

                <div className="relative border-l-2 border-slate-100 pl-6 space-y-6 ml-3">
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
                            <strong>Delivery Status:</strong>{" "}
                            <span
                              className={`font-semibold ${
                                p.deliveryStatus === "COMPLETED" ? "text-emerald-600" : "text-amber-600"
                              }`}
                            >
                              {p.deliveryStatus || "PENDING"}
                            </span>
                          </p>
                          {p.completionNotes && (
                            <p className="text-[11px] bg-white border border-slate-100 p-2.5 rounded-xl text-slate-600 mt-1 italic leading-relaxed">
                              <strong>Notes:</strong> {p.completionNotes}
                            </p>
                          )}
                          {p.deliveryDeadline && (
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

                          {p.status === "COMPLETED" && p.serviceName.toLowerCase().includes("interview prep") && (
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
                          <h5 className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5">{event.title}</h5>
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
    </main>
  );
}
