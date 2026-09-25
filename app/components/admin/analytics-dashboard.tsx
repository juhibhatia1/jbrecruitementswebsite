"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useLenis } from "@/app/providers/lenis-provider";
import type { AdminSubmission } from "@/lib/submission-types";
import {
  buildSubmissionAnalytics,
  type AnalyticsBucket,
} from "@/lib/admin-analytics";
import {
  IoSearch,
  IoClose,
  IoAlertCircle,
  IoArrowBack,
  IoGrid,
  IoList,
  IoChevronBack,
  IoChevronForward,
  IoWalletOutline,
  IoMailOutline,
  IoGlobeOutline,
  IoLaptopOutline,
  IoBarChartOutline,
  IoOpenOutline,
  IoArrowForward,
  IoCartOutline,
  IoTrendingUp,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoFlashOutline,
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoPersonOutline,
  IoPeopleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaArrowRight, FaArrowRightLong } from "react-icons/fa6";
import CreateCandidateInterviewModal from "@/app/components/admin/create-candidate-interview-modal";
import InfoTooltip from "@/app/components/ui/info-tooltip";

interface PurchaseData {
  id: string;
  candidateName: string;
  candidateEmail: string;
  serviceName: string;
  amount: number;
  currency: string;
  gatewayTransactionId: string;
  status: string;
  country: string | null;
  mockInterviewStatus: string | null;
  mockInterviewDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FunnelEventData {
  id: string;
  serviceName: string;
  eventType: "VIEW" | "CLICK_BUY" | "PAGE_VIEW" | "BUY_BUTTON_CLICK" | "CHECKOUT_COMPLETED" | string;
  createdAt: string;
}

interface AnalyticsDashboardProps {
  submissions: AdminSubmission[];
  purchases: PurchaseData[];
  funnelEvents?: FunnelEventData[];
  totalInterviewsCount?: number;
  dbError?: string | null;
}

type RangeFilter = "7d" | "30d" | "all";
type TabValue = "pipeline" | "funnels" | "demographics";

function percent(part: number, total: number): string {
  if (!total || total <= 0) {
    return "0%";
  }

  return `${Math.round((part / total) * 100)}%`;
}

function BarList({
  title,
  subtitle,
  info,
  items,
}: {
  title: string;
  subtitle?: string;
  info?: string;
  items: AnalyticsBucket[];
}) {
  const maxValue = items[0]?.count || 1;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-700">
            {title}
          </h3>
          {info && <InfoTooltip text={info} title={title} position="bottom" align="start" />}
        </div>
      </div>
      {subtitle && (
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 font-medium">{subtitle}</p>
      )}

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No data yet.</p>
        ) : null}

        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-slate-700">{item.label}</span>
              <span className="font-semibold text-slate-900">{item.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-[#605dba]"
                style={{
                  width: `${Math.min(Math.max((item.count / maxValue) * 100, 8), 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Sub-component for candidate/submission details modal
interface DetailModalProps {
  item: any;
  metricFamily: "submissions" | "revenue" | "conversion";
  onClose: () => void;
}

function DetailModal({ item, metricFamily, onClose }: DetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252e3d]/40 backdrop-blur-xs">
      <div data-lenis-prevent className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 shadow-xl max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition"
        >
          <IoClose className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-[#252e3d] pr-8 border-b border-slate-100 pb-3" style={{ fontFamily: "Crimson Text, serif" }}>
          {item.name || item.candidateName || "Record Details"}
        </h3>

        <div className="mt-5 space-y-4 text-sm text-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-slate-400 uppercase font-semibold">Email Address</span>
              <span className="font-medium">{item.email || item.candidateEmail || "N/A"}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-400 uppercase font-semibold">Date / Timestamp</span>
              <span className="font-medium">{new Date(item.date || item.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-slate-400 uppercase font-semibold">Type / Service</span>
              <span className="font-semibold text-[#5a58ab]">{item.typeOrService || item.serviceName || "N/A"}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-400 uppercase font-semibold">Value / Status</span>
              <span className="font-medium">{item.valueOrStatus || item.status || "N/A"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-slate-400 uppercase font-semibold">Location / Country</span>
              <span className="font-medium">{item.locationOrDetail || item.country || "N/A"}</span>
            </div>
            {item.phone && (
              <div>
                <span className="block text-xs text-slate-400 uppercase font-semibold">Phone</span>
                <span className="font-medium">{item.phone}</span>
              </div>
            )}
          </div>

          {item.subtext && (
            <div>
              <span className="block text-xs text-slate-400 uppercase font-semibold">Identifier / Info</span>
              <span className="font-mono text-xs text-slate-500">{item.subtext}</span>
            </div>
          )}

          {item.gatewayTransactionId && (
            <div>
              <span className="block text-xs text-slate-400 uppercase font-semibold">Stripe Transaction</span>
              <a
                href={`https://dashboard.stripe.com/payments/${item.gatewayTransactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#5a58ab] hover:underline font-semibold font-mono text-xs mt-1"
              >
                View on Stripe Dashboard
                <IoOpenOutline className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {item.resumeUrl && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xs text-slate-400 uppercase font-semibold mb-1">Uploaded Resume</span>
              <a
                href={item.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#3055cc] hover:underline font-semibold text-xs"
              >
                <IoOpenOutline className="w-4 h-4" />
                {item.resumeFileName || "View Resume File"}
              </a>
            </div>
          )}

          {item.message && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="block text-xs text-slate-400 uppercase font-semibold mb-1">Message / Note</span>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-600">{item.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for Drilldown panel Takeover
interface DrilldownViewProps {
  initialMetric: string;
  onClose: () => void;
  submissions: AdminSubmission[];
  purchases: PurchaseData[];
  funnelEvents: FunnelEventData[];
  submissionAnalytics: any;
  grossRevenue: number;
  totalOrders: number;
  aov: number;
  overallConversionRate: number;
  serviceStats: any;
}

function DrilldownView({
  initialMetric,
  onClose,
  submissions,
  purchases,
  funnelEvents,
  submissionAnalytics,
  grossRevenue,
  totalOrders,
  aov,
  overallConversionRate,
  serviceStats,
}: DrilldownViewProps) {
  const [metric, setMetric] = useState(initialMetric);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [page, setPage] = useState(1);
  const [pillFilter, setPillFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const { lenis } = useLenis();

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      if (lenis) lenis.start();
    };
  }, [lenis]);

  useEffect(() => {
    setPillFilter("all");
  }, [metric]);

  const metricFamily = useMemo(() => {
    if (
      ["total_submissions", "contacts", "job_seekers", "last_24h", "unique_emails", "unique_ips"].includes(
        metric
      )
    ) {
      return "submissions";
    }
    if (["revenue", "orders", "aov"].includes(metric)) {
      return "revenue";
    }
    return "conversion";
  }, [metric]);

  // Compile raw items according to selected metric
  const rawItems = useMemo<any[]>(() => {
    switch (metric) {
      case "total_submissions":
        return submissions.map((s) => {
          const anyS = s as any;
          return {
            id: anyS.id,
            name: anyS.name,
            email: anyS.email,
            typeOrService: anyS.type === "contact" ? "Contact Form" : "Job Seeker",
            valueOrStatus: "Submitted",
            locationOrDetail: anyS.requestMeta?.country || "Unknown",
            date: anyS.createdAt,
            subtext: anyS.type === "contact" ? anyS.company || "" : anyS.location || "",
            phone: anyS.phone,
            message: anyS.type === "contact" ? anyS.message : anyS.description || "",
            resumeUrl: anyS.type === "job-seeker" ? anyS.resumeUrl : undefined,
            resumeFileName: anyS.type === "job-seeker" ? anyS.resumeFileName : undefined,
          };
        });

      case "contacts":
        return (submissions.filter((s) => s.type === "contact") as any[])
          .map((s) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            typeOrService: "Contact Form",
            valueOrStatus: s.subject || "General Enquiry",
            locationOrDetail: s.company || "No Company",
            date: s.createdAt,
            phone: s.phone,
            message: s.message,
          }));

      case "job_seekers":
        return (submissions.filter((s) => s.type === "job-seeker") as any[])
          .map((s) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            typeOrService: "Job Seeker",
            valueOrStatus: s.resumeUrl ? "Resume Uploaded" : "No Resume",
            locationOrDetail: s.location || s.requestMeta?.country || "Unknown",
            date: s.createdAt,
            phone: s.phone,
            message: s.description || "",
            resumeUrl: s.resumeUrl,
            resumeFileName: s.resumeFileName,
          }));

      case "last_24h": {
        const start = Date.now() - 24 * 60 * 60 * 1000;
        return submissions
          .filter((s) => new Date(s.createdAt).getTime() >= start)
          .map((s) => {
            const anyS = s as any;
            return {
              id: anyS.id,
              name: anyS.name,
              email: anyS.email,
              typeOrService: anyS.type === "contact" ? "Contact Form" : "Job Seeker",
              valueOrStatus: "Submitted",
              locationOrDetail: anyS.requestMeta?.country || "Unknown",
              date: anyS.createdAt,
              phone: anyS.phone,
              message: anyS.type === "contact" ? anyS.message : anyS.description || "",
              resumeUrl: anyS.type === "job-seeker" ? anyS.resumeUrl : undefined,
              resumeFileName: anyS.type === "job-seeker" ? anyS.resumeFileName : undefined,
            };
          });
      }

      case "unique_emails": {
        const emailGroups: Record<string, typeof submissions> = {};
        submissions.forEach((s) => {
          const email = s.email.toLowerCase().trim();
          if (!emailGroups[email]) emailGroups[email] = [];
          emailGroups[email].push(s);
        });

        return Object.entries(emailGroups).map(([email, list]) => {
          const latest = list[0] as any; // ordered desc by default
          return {
            id: email,
            name: latest.name,
            email: email,
            typeOrService: latest.type === "contact" ? "Contact Form" : "Job Seeker",
            valueOrStatus: `${list.length} ${list.length === 1 ? "submission" : "submissions"}`,
            locationOrDetail: latest.requestMeta?.country || "Unknown",
            date: latest.createdAt,
            phone: latest.phone,
            message: `Submission history contains ${list.length} submission(s). Last submission message/description: ${
              latest.type === "contact" ? latest.message : latest.description || "N/A"
            }`,
          };
        });
      }

      case "unique_ips": {
        const ipGroups: Record<string, typeof submissions> = {};
        submissions.forEach((s) => {
          const ip = s.requestMeta?.ipAddress;
          if (ip) {
            if (!ipGroups[ip]) ipGroups[ip] = [];
            ipGroups[ip].push(s);
          }
        });

        return Object.entries(ipGroups).map(([ip, list]) => {
          const latest = list[0] as any;
          return {
            id: ip,
            name: ip,
            email: latest.email,
            typeOrService: `${latest.requestMeta?.browser || "Other"} (${latest.requestMeta?.os || "Other"})`,
            valueOrStatus: `${list.length} ${list.length === 1 ? "submission" : "submissions"}`,
            locationOrDetail: latest.requestMeta?.country || "Unknown",
            date: latest.createdAt,
            subtext: latest.requestMeta?.userAgent || "",
          };
        });
      }

      case "revenue":
      case "orders":
      case "aov":
        return purchases
          .filter((p) => p.status === "COMPLETED")
          .map((p) => ({
            id: p.id,
            name: p.candidateName,
            email: p.candidateEmail,
            typeOrService: p.serviceName,
            valueOrStatus: `$${p.amount.toFixed(2)}`,
            locationOrDetail: p.country || "Unknown",
            date: p.createdAt,
            subtext: `Ref: ${p.gatewayTransactionId} | Status: ${p.mockInterviewStatus || "No Interview"}`,
            gatewayTransactionId: p.gatewayTransactionId,
          }));

      case "conversion":
        return Object.entries(serviceStats).map(([name, s]: [string, any]) => {
          const ctr = s.views > 0 ? (s.clicks / s.views) * 100 : 0;
          const overall = s.views > 0 ? (s.purchases / s.views) * 100 : 0;
          return {
            id: name,
            name: name,
            email: `${s.views} Views`,
            typeOrService: `${s.clicks} Clicks (${ctr.toFixed(1)}% CTR)`,
            valueOrStatus: `${s.purchases} Sales`,
            locationOrDetail: `$${s.revenue.toFixed(2)} Revenue`,
            date: `${overall.toFixed(2)}% Conversion`,
            subtext: `Card views: ${s.views} | Buy Clicks: ${s.clicks} | Completions: ${s.purchases}`,
          };
        });

      default:
        return [];
    }
  }, [metric, submissions, purchases, serviceStats]);

  // Pill Filters calculation
  const pillOptions = useMemo(() => {
    const options = [{ key: "all", label: `All (${rawItems.length})` }];

    if (metricFamily === "submissions") {
      const contactsCount = rawItems.filter((i) => i.typeOrService === "Contact Form").length;
      const jobSeekersCount = rawItems.filter((i) => i.typeOrService === "Job Seeker").length;
      if (contactsCount > 0) options.push({ key: "contact", label: `Contact Form (${contactsCount})` });
      if (jobSeekersCount > 0) options.push({ key: "job-seeker", label: `Job Seeker (${jobSeekersCount})` });
    } else if (metricFamily === "revenue") {
      // Group by Service
      const serviceCounts: Record<string, number> = {};
      rawItems.forEach((i) => {
        serviceCounts[i.typeOrService] = (serviceCounts[i.typeOrService] || 0) + 1;
      });

      // Sort services by count descending (most popular first), then alphabetically
      const sortedServices = Object.entries(serviceCounts).sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }
        return a[0].localeCompare(b[0]);
      });

      // Show top 5 services only
      const top5Services = sortedServices.slice(0, 5);
      top5Services.forEach(([svc, count]) => {
        options.push({ key: svc, label: `${svc} (${count})` });
      });

      // If active filter is outside top 5, keep it visible so selection is preserved
      if (
        pillFilter !== "all" &&
        !top5Services.some(([svc]) => svc === pillFilter) &&
        serviceCounts[pillFilter]
      ) {
        options.push({ key: pillFilter, label: `${pillFilter} (${serviceCounts[pillFilter]})` });
      }
    }

    return options;
  }, [rawItems, metricFamily, pillFilter]);

  // Apply Search & Pill Filters
  const filteredItems = useMemo(() => {
    let list = rawItems;

    // Search query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.email.toLowerCase().includes(query) ||
          i.typeOrService.toLowerCase().includes(query) ||
          i.locationOrDetail.toLowerCase().includes(query)
      );
    }

    // Pill filter
    if (pillFilter !== "all") {
      if (metricFamily === "submissions") {
        const typeLabel = pillFilter === "contact" ? "Contact Form" : "Job Seeker";
        list = list.filter((i) => i.typeOrService === typeLabel);
      } else if (metricFamily === "revenue") {
        list = list.filter((i) => i.typeOrService === pillFilter);
      }
    }

    return list;
  }, [rawItems, searchQuery, pillFilter, metricFamily]);

  // Pagination calculations
  const itemsPerPage = 8;
  const totalPages = Math.max(Math.ceil(filteredItems.length / itemsPerPage), 1);
  const paginatedItems = useMemo(() => {
    const startIdx = (page - 1) * itemsPerPage;
    return filteredItems.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredItems, page]);

  // Reset page on filters changes
  useMemo(() => {
    setPage(1);
  }, [searchQuery, pillFilter, metric]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#252e3d]/50 backdrop-blur-xs p-4 sm:p-6 lg:p-8 overscroll-contain">
      <div className="w-full max-w-6xl bg-[#f4f6fb] rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative overscroll-contain">
        
        {/* Absolute Close Button in Top Right */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-md hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer text-slate-500 hover:text-slate-800"
          title="Close Popup"
        >
          <IoClose className="w-5 h-5" />
        </button>

        {/* Header Block (Sticky/static at top of modal) */}
        <header className="bg-white p-5 py-4 border-b border-slate-200 flex-shrink-0 flex flex-col gap-4 pr-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:border-[#5a58ab] hover:bg-slate-50 transition cursor-pointer text-slate-600 hover:text-[#5a58ab]"
            >
              <IoArrowBack className="w-5 h-5" />
            </button>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Drilldown Analysis
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#252e3d] flex items-center gap-2" style={{ fontFamily: "Crimson Text, serif" }}>
                {metric.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </h1>
            </div>
          </div>

          {/* Metric Summary Badges Bar */}
          <div className="border-t border-slate-100 pt-4">
            {metricFamily === "submissions" ? (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mr-2">
                  Pipeline:
                </span>
                <button
                  onClick={() => setMetric("total_submissions")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    metric === "total_submissions"
                      ? "bg-[#5a58ab] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Total Pipeline: <span className="font-bold">{submissions.length}</span>
                </button>
                <button
                  onClick={() => setMetric("contacts")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    metric === "contacts"
                      ? "bg-[#5a58ab] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Contact Form: <span className="font-bold">{submissionAnalytics.contact}</span>
                </button>
                <button
                  onClick={() => setMetric("job_seekers")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    metric === "job_seekers"
                      ? "bg-[#5a58ab] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Job Seekers: <span className="font-bold">{submissionAnalytics.jobSeekers}</span>
                </button>
                <button
                  onClick={() => setMetric("last_24h")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    metric === "last_24h"
                      ? "bg-[#5a58ab] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  24 Hours: <span className="font-bold">{submissionAnalytics.last24Hours}</span>
                </button>
                <button
                  onClick={() => setMetric("unique_emails")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    metric === "unique_emails"
                      ? "bg-[#5a58ab] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Emails: <span className="font-bold">{submissionAnalytics.uniqueEmails}</span>
                </button>
                <button
                  onClick={() => setMetric("unique_ips")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    metric === "unique_ips"
                      ? "bg-[#5a58ab] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Unique IPs: <span className="font-bold">{submissionAnalytics.uniqueIps}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mr-2">
                  Sales metrics:
                </span>
                <button
                  onClick={() => setMetric("revenue")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    metric === "revenue"
                      ? "bg-[#5a58ab] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Revenue: <span className="font-bold">${grossRevenue.toFixed(0)}</span>
                </button>
                <button
                  onClick={() => setMetric("orders")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    metric === "orders"
                      ? "bg-[#5a58ab] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Orders: <span className="font-bold">{totalOrders}</span>
                </button>
                <button
                  onClick={() => setMetric("aov")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    metric === "aov"
                      ? "bg-[#5a58ab] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  AOV: <span className="font-bold">${aov.toFixed(0)}</span>
                </button>
                <button
                  onClick={() => setMetric("conversion")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    metric === "conversion"
                      ? "bg-[#5a58ab] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Conversions: <span className="font-bold">{overallConversionRate.toFixed(1)}%</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Combined Panel Container (No outer scrollbar) */}
        <div data-lenis-prevent className="flex-grow p-5 flex flex-col overflow-hidden">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col flex-grow overflow-hidden">
            
            {/* Filter Controls Segment */}
            <div className="flex flex-col gap-4 p-5 pb-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-800">
                    {filteredItems.length} records
                  </span>

                  {/* Search bar */}
                  <div className="relative">
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search name, email, country..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 w-56 md:w-72 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-700 outline-none rounded-xl border border-slate-200 transition focus:border-[#5a58ab]"
                    />
                  </div>
                </div>

                {/* View Mode Toggle (Table / Cards) */}
                <div className="flex bg-slate-100 rounded-xl p-0.5 self-start md:self-auto shadow-2xs border border-slate-200">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold leading-none transition ${
                      viewMode === "table" ? "bg-white text-[#252e3d] shadow-2xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <IoList className="w-3 h-3" />
                    <span>Table</span>
                  </button>
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold leading-none transition ${
                      viewMode === "cards" ? "bg-white text-[#252e3d] shadow-2xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <IoGrid className="w-3 h-3" />
                    <span>Cards</span>
                  </button>
                </div>
              </div>

              {/* Pill filters row */}
              {pillOptions.length > 1 && (
                <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                  {pillOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setPillFilter(opt.key)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        pillFilter === opt.key
                          ? "bg-[#5a58ab] text-white shadow-2xs"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Data Segment (Scrollable area) */}
            <div className="px-5 py-4 flex-grow overflow-y-auto scrollbar-thin-styled">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <IoAlertCircle className="w-10 h-10 mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">No records match your filters.</p>
                </div>
              ) : viewMode === "table" ? (
                /* TABLE VIEW MODE */
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">
                          {metric === "unique_ips" ? "IP Address" : "Candidate Name"}
                        </th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">
                          {metricFamily === "submissions"
                            ? metric === "unique_ips"
                              ? "Browser"
                              : "Type"
                            : "Service"}
                        </th>
                        <th className="py-3 px-4">
                          {metricFamily === "submissions"
                            ? metric === "unique_ips"
                              ? "OS"
                              : "Date"
                            : "Value"}
                        </th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs sm:text-sm text-slate-700">
                      {paginatedItems.map((item, idx) => (
                        <tr
                          key={item.id || idx}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {item.name}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono">
                            {item.email}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                              {item.typeOrService}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {item.valueOrStatus}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="text-xs font-bold text-[#5a58ab] hover:underline cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* CARDS VIEW MODE */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedItems.map((item, idx) => (
                    <article
                      key={item.id || idx}
                      onClick={() => setSelectedItem(item)}
                      className="border border-gray-300 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-[#5a58ab]/40 transition duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="text-sm font-bold text-slate-800 truncate">
                            {item.name}
                          </h4>
                          <span className="inline-flex shrink-0 items-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                            {item.typeOrService}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate mb-3">
                          {item.email}
                        </p>
                        <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
                          <p>
                            <span className="font-semibold text-slate-400">Value/Detail:</span>{" "}
                            {item.valueOrStatus}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-400">Location:</span>{" "}
                            {item.locationOrDetail}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-2.5 flex justify-between items-center text-[11px] text-slate-400 font-semibold">
                        <span>
                          {metric === "conversion" ? item.date : new Date(item.date).toLocaleDateString()}
                        </span>
                        <span className="group text-[#3055cc] hover:underline flex items-center gap-0.5">
                          Details 
                          <FaArrowRight className="w-3 h-3 transform transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls Sticky Footer Segment */}
            <div className="p-5 pt-4 border-t border-slate-100 bg-[#fcfdfe] flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-400 font-medium">
                Showing {Math.min((page - 1) * itemsPerPage + 1, filteredItems.length)}–
                {Math.min(page * itemsPerPage, filteredItems.length)} of {filteredItems.length}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                >
                  <IoChevronBack className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600 px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                >
                  <IoChevronForward className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Detail overlay modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          metricFamily={metricFamily}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default function AnalyticsDashboard({
  submissions,
  purchases = [],
  funnelEvents = [],
  totalInterviewsCount = 0,
  dbError = null,
}: AnalyticsDashboardProps) {
  const router = useRouter();
  const [range, setRange] = useState<RangeFilter>("30d");
  const [activeTab, setActiveTab] = useState<TabValue>("pipeline");
  const [chartInterval, setChartInterval] = useState<"weekly" | "monthly">("weekly");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeDrilldown, setActiveDrilldown] = useState<string | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  // 1. Date Range Filtering
  const rangeFilteredSubmissions = useMemo(() => {
    if (range === "all") {
      return submissions;
    }

    const days = range === "7d" ? 7 : 30;
    const start = Date.now() - days * 24 * 60 * 60 * 1000;

    return submissions.filter((item) => {
      return new Date(item.createdAt).getTime() >= start;
    });
  }, [range, submissions]);

  const rangeFilteredPurchases = useMemo(() => {
    if (range === "all") {
      return purchases;
    }

    const days = range === "7d" ? 7 : 30;
    const start = Date.now() - days * 24 * 60 * 60 * 1000;

    return purchases.filter((item) => {
      return new Date(item.createdAt).getTime() >= start;
    });
  }, [range, purchases]);

  const rangeFilteredFunnelEvents = useMemo(() => {
    if (range === "all") {
      return funnelEvents;
    }

    const days = range === "7d" ? 7 : 30;
    const start = Date.now() - days * 24 * 60 * 60 * 1000;

    return funnelEvents.filter((item) => {
      return new Date(item.createdAt).getTime() >= start;
    });
  }, [range, funnelEvents]);

  // 2. Compute Analytics for Submissions Tab
  const submissionAnalytics = useMemo(() => {
    return buildSubmissionAnalytics(rangeFilteredSubmissions);
  }, [rangeFilteredSubmissions]);

  // 3. Compute Analytics for Services Tab
  const completedPurchases = useMemo(() => {
    return rangeFilteredPurchases.filter((p) => p.status === "COMPLETED");
  }, [rangeFilteredPurchases]);

  const grossRevenue = useMemo(() => {
    return completedPurchases.reduce((sum, p) => sum + p.amount, 0);
  }, [completedPurchases]);

  const totalOrders = completedPurchases.length;

  const aov = totalOrders > 0 ? grossRevenue / totalOrders : 0;

  const totalViews = useMemo(() => {
    return rangeFilteredFunnelEvents.filter((e) => e.eventType === "VIEW").length;
  }, [rangeFilteredFunnelEvents]);

  const overallConversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

  // 4. Service Specific Statistics
  const serviceStats = useMemo(() => {
    const serviceConfig: Record<string, { price: number }> = {
      "Resume Review & Rewriting": { price: 79 },
      "Cover Letter Writing": { price: 49 },
      "LinkedIn Optimization": { price: 79 },
      "Superstar Shout-Out": { price: 159 },
      "Ask Me Anything": { price: 39 },
      "Interview Prep": { price: 99 },
      "Ready-to-Apply Job Pack": { price: 129 },
      "Mock Interview": { price: 39 },
      "AI Mock Interview": { price: 39 },
    };

    const stats: Record<
      string,
      {
        views: number;
        clicks: number;
        purchases: number;
        revenue: number;
        price: number;
      }
    > = {};

    // Initialize with standard services
    Object.keys(serviceConfig).forEach((title) => {
      stats[title] = {
        views: 0,
        clicks: 0,
        purchases: 0,
        revenue: 0,
        price: serviceConfig[title].price,
      };
    });

    // Populate from telemetry events
    rangeFilteredFunnelEvents.forEach((e) => {
      const name = e.serviceName;
      if (!stats[name]) {
        stats[name] = { views: 0, clicks: 0, purchases: 0, revenue: 0, price: 0 };
      }
      if (e.eventType === "VIEW") {
        stats[name].views += 1;
      } else if (e.eventType === "CLICK_BUY") {
        stats[name].clicks += 1;
      }
    });

    // Populate from database purchases
    completedPurchases.forEach((p) => {
      const name = p.serviceName;
      if (!stats[name]) {
        stats[name] = { views: 0, clicks: 0, purchases: 0, revenue: 0, price: p.amount };
      }
      stats[name].purchases += 1;
      stats[name].revenue += p.amount;
    });

    // Keep numbers mathematically logical
    Object.keys(stats).forEach((name) => {
      const s = stats[name];
      s.clicks = Math.max(s.clicks, s.purchases);
      s.views = Math.max(s.views, s.clicks);
    });

    return stats;
  }, [rangeFilteredFunnelEvents, completedPurchases]);

  // 5. Proactive Alerts Calculations
  const proactiveAlerts = useMemo(() => {
    const alerts: {
      serviceName: string;
      views: number;
      purchases: number;
      conversionRate: number;
      recommendation: string;
    }[] = [];

    Object.entries(serviceStats).forEach(([sName, s]) => {
      // Trigger alert if service has at least 3 views and conversion rate < 1.5%
      if (s.views >= 3) {
        const convRate = (s.purchases / s.views) * 100;
        if (convRate < 1.5) {
          const ctr = s.views > 0 ? (s.clicks / s.views) * 100 : 0;
          const checkoutRate = s.clicks > 0 ? (s.purchases / s.clicks) * 100 : 0;
          let recommendation = "";

          if (ctr < 10) {
            recommendation = `Low click-through rate (${ctr.toFixed(1)}%). Consider revising the features list or adding a "Top Value" tag to make this service card more eye-catching.`;
          } else if (checkoutRate < 20) {
            recommendation = `High drop-off at checkout (${checkoutRate.toFixed(1)}% complete). The current price point (${s.price}) might represent friction. Consider introducing a temporary 10-15% discount or adding checkout assurance badges.`;
          } else {
            recommendation = `Overall conversion rate is low (${convRate.toFixed(1)}%). Suggest displaying a snippet of a sample deliverable, or adding candidate testimonials for this service.`;
          }

          alerts.push({
            serviceName: sName,
            views: s.views,
            purchases: s.purchases,
            conversionRate: convRate,
            recommendation,
          });
        }
      }
    });

    return alerts;
  }, [serviceStats]);

  // Unique Candidates in Directory
  const uniqueDirectoryCount = useMemo(() => {
    const emails = new Set<string>();
    submissions.forEach((s) => {
      if (s.email) emails.add(s.email.toLowerCase().trim());
    });
    purchases.forEach((p) => {
      if (p.candidateEmail) emails.add(p.candidateEmail.toLowerCase().trim());
    });
    return emails.size;
  }, [submissions, purchases]);

  // Operational items needing attention
  const pendingResumesCount = useMemo(() => {
    return submissions.filter((s) => s.type === "job-seeker" && s.resumeUrl).length;
  }, [submissions]);

  const pendingInterviewsCount = useMemo(() => {
    return purchases.filter((p) => p.mockInterviewStatus === "PENDING_SCHEDULE").length;
  }, [purchases]);

  // Top 5 Services by Revenue
  const top5Services = useMemo(() => {
    return Object.entries(serviceStats)
      .map(([name, s]) => ({ name, ...s }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [serviceStats]);

  // 6. Chart Revenue Grouping Data
  const revenueTrend = useMemo(() => {
    if (chartInterval === "monthly") {
      const groups: Record<string, number> = {};
      completedPurchases.forEach((p) => {
        const d = new Date(p.createdAt);
        const key = d.toLocaleString("en-US", { month: "short", year: "numeric" });
        groups[key] = (groups[key] || 0) + p.amount;
      });

      const sorted = Object.entries(groups)
        .map(([label, amount]) => ({
          label,
          amount,
          dateVal: new Date(label).getTime(),
        }))
        .sort((a, b) => a.dateVal - b.dateVal);

      return sorted.map(({ label, amount }) => ({ label, amount }));
    } else {
      const groups: Record<string, number> = {};
      completedPurchases.forEach((p) => {
        const d = new Date(p.createdAt);
        const day = d.getDay();
        const diff = d.getDate() - day; // Adjust to Sunday of that week
        const sunday = new Date(d.setDate(diff));
        const key = `Wk of ${sunday.toLocaleString("en-US", { month: "short", day: "numeric" })}`;
        groups[key] = (groups[key] || 0) + p.amount;
      });

      const sorted = Object.entries(groups)
        .map(([label, amount]) => {
          const dateStr = label.replace("Wk of ", "");
          const dateVal = new Date(`${dateStr}, ${new Date().getFullYear()}`).getTime();
          return { label, amount, dateVal };
        })
        .sort((a, b) => a.dateVal - b.dateVal);

      return sorted.map(({ label, amount }) => ({ label, amount }));
    }
  }, [completedPurchases, chartInterval]);

  // SVG Chart Computations
  const chartParams = useMemo(() => {
    if (revenueTrend.length === 0) return null;
    const maxVal = Math.max(...revenueTrend.map((d) => d.amount), 100);
    const chartWidth = 500;
    const chartHeight = 220;
    const padding = { top: 20, right: 20, bottom: 35, left: 50 };
    const graphWidth = chartWidth - padding.left - padding.right;
    const graphHeight = chartHeight - padding.top - padding.bottom;

    const points = revenueTrend.map((d, i) => {
      const x =
        padding.left +
        (revenueTrend.length > 1
          ? (i / (revenueTrend.length - 1)) * graphWidth
          : graphWidth / 2);
      const y = padding.top + graphHeight - (d.amount / maxVal) * graphHeight;
      return { x, y, label: d.label, amount: d.amount };
    });

    const linePath =
      points.length > 1
        ? `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`
        : "";

    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x.toFixed(1)},${(padding.top + graphHeight).toFixed(1)} L ${points[0].x.toFixed(1)},${(padding.top + graphHeight).toFixed(1)} Z`
        : "";

    const yTicksCount = 4;
    const yGridLines = Array.from({ length: yTicksCount + 1 }).map((_, i) => {
      const val = (maxVal / yTicksCount) * i;
      const y = padding.top + graphHeight - (val / maxVal) * graphHeight;
      return { val, y };
    });

    return { points, linePath, areaPath, yGridLines, chartWidth, chartHeight, padding };
  }, [revenueTrend]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/admin");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6fb] px-4 py-8 text-[#252e3d] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Block */}
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="mt-2 text-3xl font-semibold text-[#252e3d] sm:text-4xl">
                Analytics & Overview
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Real-time executive performance, recruitment pipeline & financial activity.
              </p>
            </div>

            {/* Navigation Buttons with Live Counters */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="rounded-xl bg-[#252e3d] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs"
              >
                Analytics
              </Link>
              <Link
                href="/admin/submissions"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <span>Submissions</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                  {submissions.length}
                </span>
              </Link>
              <Link
                href="/admin/directory"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <span>User Directory</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                  {uniqueDirectoryCount}
                </span>
              </Link>
              <Link
                href="/admin/knowledge"
                className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Chatbot & KB
              </Link>
              <Link
                href="/admin/interviews"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <span>Interviews</span>
                {totalInterviewsCount > 0 && (
                  <span className="rounded-full bg-[#f0efff] px-2 py-0.5 text-[10px] font-bold text-[#5a58ab] border border-[#5a58ab]/20">
                    {totalInterviewsCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-slate-100 pt-5 gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <IoCalendarOutline className="w-4 h-4 text-slate-400" />
              <span>Reporting Horizon:</span>
            </div>

            {/* Range Selector */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-full p-0.5 shadow-2xs">
              {[
                { key: "7d", label: "Last 7 Days" },
                { key: "30d", label: "Last 30 Days" },
                { key: "all", label: "All Time" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setRange(item.key as RangeFilter)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    range === item.key
                      ? "bg-[#252e3d] text-white shadow-2xs"
                      : "bg-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Database Resiliency Warning Banner */}
        {dbError && (
          <div className="p-5 bg-amber-50 border-l-4 border-amber-500 rounded-3xl text-amber-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
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

        {/* Zone 1: Executive Pulse Hero Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Revenue */}
          <button
            onClick={() => setActiveDrilldown("revenue")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-[#5a58ab]/60 hover:shadow-md hover:z-20 transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f0efff] text-[#5a58ab] group-hover:scale-105 transition-transform">
                  <IoWalletOutline className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Gross Revenue
                    </p>
                    <InfoTooltip
                      text="Total monetary value of all verified customer transactions processed via Stripe & PayU within the selected date range."
                      title="Gross Revenue"
                      position="bottom"
                      align="start"
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    {range === "7d" ? "Past 7 days" : range === "30d" ? "Past 30 days" : "All time"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#f0efff] text-[#5a58ab] px-2.5 py-0.5">
                Sales
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                ${grossRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Avg Order: <strong className="text-slate-700">${aov.toFixed(0)}</strong></span>
                <span className="font-semibold text-[#5a58ab] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Detail &rarr;
                </span>
              </div>
            </div>
          </button>

          {/* Paid Purchases */}
          <button
            onClick={() => setActiveDrilldown("orders")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-500/60 hover:shadow-md hover:z-20 transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                  <IoCartOutline className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Completed Orders
                    </p>
                    <InfoTooltip
                      text="Total count of successfully paid candidate service purchases that have passed payment gateway verification."
                      title="Completed Orders"
                      position="bottom"
                      align="start"
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-500">Verified purchases</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5">
                Orders
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                {totalOrders}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{completedPurchases.length > 0 ? "Stripe & PayU verified" : "No orders in range"}</span>
                <span className="font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Detail &rarr;
                </span>
              </div>
            </div>
          </button>

          {/* Inquiries */}
          <button
            onClick={() => setActiveDrilldown("total_submissions")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-500/60 hover:shadow-md hover:z-20 transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                  <IoMailOutline className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Candidate Inquiries
                    </p>
                    <InfoTooltip
                      text="Total inbound candidate submissions received across job applications and contact inquiries within the selected filter window."
                      title="Candidate Inquiries"
                      position="bottom"
                      align="start"
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-500">Total pipeline</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5">
                Leads
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                {submissionAnalytics.total}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  <strong className="text-slate-700">{submissionAnalytics.jobSeekers}</strong> Job Seekers &bull; <strong className="text-slate-700">{submissionAnalytics.contact}</strong> Contact
                </span>
                <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Detail &rarr;
                </span>
              </div>
            </div>
          </button>

          {/* Conversion Rate */}
          <button
            onClick={() => setActiveDrilldown("conversion")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-amber-500/60 hover:shadow-md hover:z-20 transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                  <IoTrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Funnel Conversion
                    </p>
                    <InfoTooltip
                      text="Percentage of total service catalog page views that converted into completed paid purchases."
                      title="Funnel Conversion Rate"
                      position="bottom"
                      align="end"
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-500">Views to purchase</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5">
                Funnel
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                {overallConversionRate.toFixed(1)}%
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>From <strong className="text-slate-700">{totalViews}</strong> service views</span>
                <span className="font-semibold text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Detail &rarr;
                </span>
              </div>
            </div>
          </button>
        </section>

        {/* Zone 2: Action Center ("Needs Your Attention") */}
        <section className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-[#f8f9ff] via-[#ffffff] to-[#f6f8ff] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#5a58ab]">
                  Operational Hub &bull; Action Items
                </h3>
                <InfoTooltip
                  text="Real-time administrative alerts for unreviewed resumes and mock interview appointments requiring action."
                  title="Operational Hub"
                  position="top"
                />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Tasks requiring administrative review or follow-up
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Pending Resumes */}
              <Link
                href="/admin/directory"
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-[#5a58ab]/40 hover:bg-slate-50 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <IoDocumentTextOutline className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span><span className="font-bold text-slate-900">{pendingResumesCount}</span> Candidate Resumes</span>
                    <InfoTooltip text="Candidate profiles with uploaded resumes awaiting recruiter review." title="Candidate Resumes" position="top" />
                  </div>
                  <span className="block text-[10px] text-slate-400 font-normal">Review in Directory &rarr;</span>
                </div>
              </Link>

              {/* Pending Interviews */}
              <Link
                href="/admin/interviews"
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-[#5a58ab]/40 hover:bg-slate-50 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <IoCalendarOutline className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span><span className="font-bold text-slate-900">{pendingInterviewsCount}</span> Mock Bookings</span>
                    <InfoTooltip text="Paid or requested mock interviews awaiting interview slot confirmation." title="Mock Bookings" position="top" />
                  </div>
                  <span className="block text-[10px] text-slate-400 font-normal">Awaiting scheduling &rarr;</span>
                </div>
              </Link>

              {/* Quick Action Button */}
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(true)}
                  className="flex items-center gap-2 rounded-2xl bg-[#5a58ab] hover:bg-[#4d4a96] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  <IoAddOutline className="w-4 h-4 stroke-[3]" />
                  <span>Create Candidate Interview</span>
                </button>
                <InfoTooltip
                  text="Generate a unique, tokenized interview invitation link for an individual candidate to take an AI or human mock interview."
                  title="Create Interview Link"
                  position="bottom"
                  align="end"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Zone 3: Two-Column Performance Engine (60 / 40 Split) */}
        <section className="grid gap-6 lg:grid-cols-5">
          {/* Revenue Chart (3 cols = 60%) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Gross Revenue Trajectory
                    </h3>
                    <InfoTooltip
                      text="Visual plot of sales trends aggregated by weekly or monthly intervals to analyze revenue momentum and peak purchase periods."
                      title="Revenue Trajectory"
                      position="top"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Performance trends grouped by {chartInterval} timeline.
                  </p>
                </div>
                <div className="flex bg-slate-100 rounded-xl p-0.5">
                  <button
                    onClick={() => setChartInterval("weekly")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                      chartInterval === "weekly"
                        ? "bg-white text-slate-800 shadow-2xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setChartInterval("monthly")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                      chartInterval === "monthly"
                        ? "bg-white text-slate-800 shadow-2xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {chartParams ? (
                <div className="relative pt-2">
                  <svg
                    viewBox={`0 0 ${chartParams.chartWidth} ${chartParams.chartHeight}`}
                    className="w-full h-auto overflow-visible"
                  >
                    <defs>
                      <linearGradient id="glow-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5a58ab" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#5a58ab" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    {/* Y-axis grid lines & ticks */}
                    {chartParams.yGridLines.map((line, idx) => (
                      <g key={idx}>
                        <line
                          x1={chartParams.padding.left}
                          y1={line.y}
                          x2={chartParams.chartWidth - chartParams.padding.right}
                          y2={line.y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={chartParams.padding.left - 10}
                          y={line.y + 4}
                          textAnchor="end"
                          className="text-[10px] font-semibold fill-slate-400"
                        >
                          ${line.val.toFixed(0)}
                        </text>
                      </g>
                    ))}

                    {/* Guide indicator line */}
                    {hoveredPointIndex !== null && chartParams.points[hoveredPointIndex] && (
                      <line
                        x1={chartParams.points[hoveredPointIndex].x}
                        y1={chartParams.padding.top}
                        x2={chartParams.points[hoveredPointIndex].x}
                        y2={chartParams.chartHeight - chartParams.padding.bottom}
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Gradient glow shape */}
                    {chartParams.areaPath && (
                      <path d={chartParams.areaPath} fill="url(#glow-grad)" />
                    )}

                    {/* Trend line */}
                    {chartParams.linePath && (
                      <path
                        d={chartParams.linePath}
                        fill="none"
                        stroke="#5a58ab"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Point triggers */}
                    {chartParams.points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="14"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPointIndex(idx)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hoveredPointIndex === idx ? "6" : "4"}
                          fill="#ffffff"
                          stroke="#5a58ab"
                          strokeWidth="2.5"
                          className="pointer-events-none transition-all duration-200"
                        />
                      </g>
                    ))}

                    {/* X-axis labels */}
                    {chartParams.points.map((p, idx) => {
                      const step = Math.max(Math.ceil(chartParams.points.length / 5), 1);
                      if (idx % step !== 0 && idx !== chartParams.points.length - 1) return null;
                      return (
                        <text
                          key={idx}
                          x={p.x}
                          y={chartParams.chartHeight - 12}
                          textAnchor="middle"
                          className="text-[10px] font-semibold fill-slate-400"
                        >
                          {p.label}
                        </text>
                      );
                    })}
                  </svg>

                  {/* Tooltip */}
                  {hoveredPointIndex !== null && chartParams.points[hoveredPointIndex] && (
                    <div
                      className="absolute z-10 pointer-events-none rounded-xl bg-[#252e3d] p-3 text-xs text-white shadow-lg border border-slate-700/50 transition-all duration-150"
                      style={{
                        left: `${(chartParams.points[hoveredPointIndex].x / chartParams.chartWidth) * 100}%`,
                        top: `${(chartParams.points[hoveredPointIndex].y / chartParams.chartHeight) * 100 - 15}%`,
                        transform: "translate(-50%, -100%)",
                      }}
                    >
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        {chartParams.points[hoveredPointIndex].label}
                      </div>
                      <div className="mt-1 font-bold text-sm text-[#a8a6f3]">
                        ${chartParams.points[hoveredPointIndex].amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                  No sales recorded within this range filter.
                </div>
              )}
            </div>
          </div>

          {/* Top 5 Services (2 cols = 40%) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Top 5 Revenue Drivers
                    </h3>
                    <InfoTooltip
                      text="The top 5 best-performing service offerings ranked by total dollar sales generated within the selected timeframe."
                      title="Top Revenue Drivers"
                      position="top"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Highest generating premium packages
                  </p>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5a58ab] bg-[#f0efff] px-2.5 py-1 rounded-full">
                  Ranked
                </span>
              </div>

              {top5Services.length === 0 ? (
                <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                  No service revenue to rank yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {top5Services.map((service, index) => {
                    const share = grossRevenue > 0 ? (service.revenue / grossRevenue) * 100 : 0;
                    return (
                      <div key={service.name} className="flex flex-col">
                        <div className="flex justify-between items-center text-sm mb-1.5">
                          <div className="flex items-center gap-2 max-w-[65%]">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                              #{index + 1}
                            </span>
                            <span className="font-semibold text-slate-800 text-xs truncate" title={service.name}>
                              {service.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 text-xs">
                              ${service.revenue.toFixed(0)}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 ml-1">
                              ({service.purchases})
                            </span>
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#5a58ab] to-[#8c8ae6] transition-all duration-500"
                            style={{ width: `${Math.max(share, 4)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                          <span>{share.toFixed(1)}% of total revenue</span>
                          <span>Price: ${service.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>View all service metrics:</span>
              <button
                type="button"
                onClick={() => setActiveTab("funnels")}
                className="font-bold text-[#5a58ab] hover:underline cursor-pointer"
              >
                Inspect Funnels &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* Zone 4: Tabbed Detailed Analysis */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
              <button
                onClick={() => setActiveTab("pipeline")}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === "pipeline"
                    ? "bg-white text-[#252e3d] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Candidate Pipeline & Signals
              </button>
              <button
                onClick={() => setActiveTab("funnels")}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === "funnels"
                    ? "bg-white text-[#252e3d] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Service Funnels & Drop-off
              </button>
              <button
                onClick={() => setActiveTab("demographics")}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === "demographics"
                    ? "bg-white text-[#252e3d] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Audience & Demographics
              </button>
            </div>
          </div>

          {/* Sub-tab 1: Pipeline */}
          {activeTab === "pipeline" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Micro KPI Row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <button
                  onClick={() => setActiveDrilldown("total_submissions")}
                  className="text-left rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60 hover:border-[#605dba]/50 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-[#605dba]">Total</p>
                    <InfoTooltip text="Aggregated submissions across all candidate inquiries and job applications." title="Total Inquiries" position="top" />
                  </div>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">{submissionAnalytics.total}</p>
                  <span className="text-[9px] text-slate-400 mt-2 block uppercase font-bold tracking-wider">Detail &rarr;</span>
                </button>
                <button
                  onClick={() => setActiveDrilldown("contacts")}
                  className="text-left rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60 hover:border-[#605dba]/50 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-[#605dba]">Contact Form</p>
                    <InfoTooltip text="Employer and visitor queries submitted via the Contact Us form." title="Contact Form Inquiries" position="top" />
                  </div>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">{submissionAnalytics.contact}</p>
                  <span className="text-[9px] text-slate-400 mt-2 block uppercase font-bold tracking-wider">Detail &rarr;</span>
                </button>
                <button
                  onClick={() => setActiveDrilldown("job_seekers")}
                  className="text-left rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60 hover:border-[#605dba]/50 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-[#605dba]">Job Seekers</p>
                    <InfoTooltip text="Candidate profiles and resume submissions applying for job placement." title="Job Seekers" position="top" />
                  </div>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">{submissionAnalytics.jobSeekers}</p>
                  <span className="text-[9px] text-slate-400 mt-2 block uppercase font-bold tracking-wider">Detail &rarr;</span>
                </button>
                <button
                  onClick={() => setActiveDrilldown("last_24h")}
                  className="text-left rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60 hover:border-[#605dba]/50 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-[#605dba]">Last 24h</p>
                    <InfoTooltip text="Submissions logged within the rolling last 24 hours to monitor real-time intake." title="Last 24h Inquiries" position="top" />
                  </div>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">{submissionAnalytics.last24Hours}</p>
                  <span className="text-[9px] text-slate-400 mt-2 block uppercase font-bold tracking-wider">Detail &rarr;</span>
                </button>
                <button
                  onClick={() => setActiveDrilldown("unique_emails")}
                  className="text-left rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60 hover:border-[#605dba]/50 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-[#605dba]">Unique Emails</p>
                    <InfoTooltip text="Distinct individual candidate email addresses excluding repeated submissions." title="Unique Emails" position="top" />
                  </div>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">{submissionAnalytics.uniqueEmails}</p>
                  <span className="text-[9px] text-slate-400 mt-2 block uppercase font-bold tracking-wider">Detail &rarr;</span>
                </button>
                <button
                  onClick={() => setActiveDrilldown("unique_ips")}
                  className="text-left rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60 hover:border-[#605dba]/50 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-[#605dba]">Unique IPs</p>
                    <InfoTooltip text="Distinct visitor network addresses to verify geographic and organic reach." title="Unique IPs" position="top" />
                  </div>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">{submissionAnalytics.uniqueIps}</p>
                  <span className="text-[9px] text-slate-400 mt-2 block uppercase font-bold tracking-wider">Detail &rarr;</span>
                </button>
              </div>

              {/* Signals & 7 Day Trend */}
              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Lead Quality & Intent Signals
                    </h3>
                    <InfoTooltip
                      text="High-intent indicators provided by candidates, showing how many included phone numbers, company names, descriptions, or resumes."
                      title="Intent Signals"
                      position="top"
                    />
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>Phone number provided:</span>
                      <span className="font-semibold">
                        {submissionAnalytics.conversionSignals.withPhone} ({percent(submissionAnalytics.conversionSignals.withPhone, submissionAnalytics.total)})
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>Company name provided:</span>
                      <span className="font-semibold">
                        {submissionAnalytics.conversionSignals.withCompany} ({percent(submissionAnalytics.conversionSignals.withCompany, submissionAnalytics.contact)})
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>Candidate description provided:</span>
                      <span className="font-semibold">
                        {submissionAnalytics.conversionSignals.withDescription} ({percent(submissionAnalytics.conversionSignals.withDescription, submissionAnalytics.jobSeekers)})
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>Resume file uploaded:</span>
                      <span className="font-semibold">
                        {submissionAnalytics.withResume} ({percent(submissionAnalytics.withResume, submissionAnalytics.jobSeekers)})
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>Repeat submitters:</span>
                      <span className="font-semibold">{submissionAnalytics.repeatSubmitters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Submissions in last 7 days:</span>
                      <span className="font-semibold">{submissionAnalytics.last7Days}</span>
                    </div>
                  </div>
                </section>

                <BarList
                  title="Daily Inquiries (Last 7 Days)"
                  subtitle="Daily inquiries count total inbound candidate interactions — measuring contact form requests and job applications received each day over the past week to track immediate recruitment acquisition momentum."
                  info="Day-by-day volume of inbound candidate applications and contact requests over the last 7 calendar days to monitor lead velocity."
                  items={submissionAnalytics.dailyTrend}
                />
              </div>
            </div>
          )}

          {/* Sub-tab 2: Funnels */}
          {activeTab === "funnels" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="mb-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5a58ab]">
                    Service Sales Funnels
                  </h3>
                  <InfoTooltip
                    text="Conversion funnel tracking candidate drop-off across each stage: Page Views -> Buy Button Clicks -> Completed Purchases."
                    title="Service Sales Funnels"
                    position="top"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Track drop-off friction across Views &rarr; Buy Clicks &rarr; Completed Checkouts.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(serviceStats).map(([name, stats]) => {
                  const ctr = stats.views > 0 ? (stats.clicks / stats.views) * 100 : 0;
                  const checkoutRate = stats.clicks > 0 ? (stats.purchases / stats.clicks) * 100 : 0;
                  const overallConv = stats.views > 0 ? (stats.purchases / stats.views) * 100 : 0;
                  const overallDropoff = 100 - overallConv;

                  let statusColor = "bg-slate-50 text-slate-600 border-slate-200";
                  let statusText = "No Traffic";
                  if (stats.views > 0) {
                    if (overallConv >= 3.0) {
                      statusColor = "bg-emerald-50 text-emerald-700 border-emerald-250";
                      statusText = "Excellent Conv";
                    } else if (overallConv >= 1.5) {
                      statusColor = "bg-[#fcfaff] text-[#5a58ab] border-[#5a58ab]/20";
                      statusText = "Healthy";
                    } else {
                      statusColor = "bg-rose-50 text-rose-700 border-rose-200";
                      statusText = "Low Conv";
                    }
                  }

                  return (
                    <article
                      key={name}
                      className="rounded-3xl border border-gray-300 p-6 bg-slate-50/20 hover:bg-white hover:shadow-xl hover:border-[#5a58ab]/30 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start border-b border-slate-100 pb-3.5 mb-4 gap-2">
                          <div className="max-w-[70%]">
                            <h4 className="font-extrabold text-slate-800 text-sm truncate" title={name}>
                              {name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
                              Service Price: ${stats.price}
                            </span>
                          </div>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>

                        <div className="relative mt-5 flex flex-col items-center">
                          <div className="absolute top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-200" />

                          {/* Step 1: Views */}
                          <div className="w-full bg-[#252e3d] text-white rounded-2xl p-3 flex items-center justify-between shadow-xs border border-slate-800 transition-all duration-200 hover:bg-slate-800 z-10">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-white/10 text-slate-300">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">1. Views</span>
                                  <InfoTooltip text="Total candidate visits and page impressions recorded for this service." title="Service Views" position="top" />
                                </div>
                                <span className="font-extrabold text-base tracking-tight leading-none block mt-0.5">{stats.views}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded">100%</span>
                          </div>

                          {/* CTR Indicator Badge */}
                          <div className="my-1.5 z-10 flex items-center gap-1">
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full shadow-2xs border ${
                              ctr >= 15 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : ctr >= 5 
                                ? "bg-amber-50 text-amber-700 border-amber-200" 
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                              {ctr.toFixed(1)}% CTR
                            </span>
                            <InfoTooltip text="Click-Through Rate: percentage of page viewers who clicked 'Buy Now'." title="Click-Through Rate" position="top" />
                          </div>

                          {/* Step 2: Clicks */}
                          <div className="w-[92%] bg-white border border-slate-200 hover:border-[#5a58ab]/40 rounded-2xl p-3 flex items-center justify-between shadow-2xs transition-all duration-200 z-10 group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-[#5a58ab]/10 text-[#5a58ab] group-hover:bg-[#5a58ab]/20 transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-bold text-[#5a58ab] uppercase tracking-wider block">2. Buy Clicks</span>
                                  <InfoTooltip text="Candidate clicks on the purchase CTA button to launch checkout." title="Buy Button Clicks" position="top" />
                                </div>
                                <span className="font-extrabold text-slate-800 text-base tracking-tight leading-none block mt-0.5">{stats.clicks}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{ctr.toFixed(0)}%</span>
                          </div>

                          {/* Checkout Indicator Badge */}
                          <div className="my-1.5 z-10 flex items-center gap-1">
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full shadow-2xs border ${
                              checkoutRate >= 50 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : checkoutRate >= 20 
                                ? "bg-amber-50 text-amber-700 border-amber-200" 
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                              {checkoutRate.toFixed(1)}% Checkout Completion
                            </span>
                            <InfoTooltip text="Percentage of candidates who clicked buy and completed the payment transaction." title="Checkout Completion Rate" position="top" />
                          </div>

                          {/* Step 3: Purchases */}
                          <div className="w-[84%] bg-emerald-600 text-white rounded-2xl p-3 flex items-center justify-between shadow-md border border-emerald-500/20 transition-all duration-200 hover:bg-emerald-700 z-10">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-white/20 text-white">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-bold text-emerald-200 uppercase tracking-wider block">3. Completed Sales</span>
                                  <InfoTooltip text="Verified paid transactions successfully processed." title="Completed Orders" position="top" />
                                </div>
                                <span className="font-extrabold text-base tracking-tight leading-none block mt-0.5">{stats.purchases}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-100 bg-emerald-500/30 px-2 py-0.5 rounded">{overallConv.toFixed(0)}%</span>
                          </div>
                        </div>

                        {/* Conversion Insights */}
                        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1.5 font-medium leading-relaxed">
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1">
                            <span className="text-xs">💡</span>
                            <span>Conversion Insights</span>
                          </div>
                          {stats.views === 0 ? (
                            <p>No traffic has been logged for this service yet.</p>
                          ) : (
                            <>
                              <p>
                                &bull; <strong className="text-slate-800">{(100 - ctr).toFixed(1)}%</strong> of visitors drop off without clicking "Buy Now".
                              </p>
                              {stats.clicks > 0 && (
                                <p>
                                  &bull; <strong className="text-slate-800">{(100 - checkoutRate).toFixed(1)}%</strong> of buyers abandon checkout.
                                </p>
                              )}
                              <p>
                                &bull; Overall conversion is <strong className="text-emerald-600">{overallConv.toFixed(1)}%</strong> ({stats.purchases} {stats.purchases === 1 ? "sale" : "sales"} from {stats.views} views).
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-4 flex flex-col gap-2.5">
                        <div>
                          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-1">
                            <div className="flex items-center gap-1">
                              <span>Total Drop-off</span>
                              <InfoTooltip text="Percentage of visitors who left without completing an order." title="Drop-off Rate" position="top" />
                            </div>
                            <span className="text-rose-600 font-extrabold">{overallDropoff.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallDropoff}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-1">
                            <div className="flex items-center gap-1">
                              <span>Conversion Rate</span>
                              <InfoTooltip text="Percentage of total visitors who converted into paying customers." title="Conversion Rate" position="top" />
                            </div>
                            <span className="text-emerald-600 font-extrabold">{overallConv.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallConv}%` }} />
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-tab 3: Demographics & Tech */}
          {activeTab === "demographics" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <BarList
                  title="Top Source Paths"
                  info="The initial URL paths where candidates first entered your website."
                  items={submissionAnalytics.topSources}
                />
                <BarList
                  title="Top Referrers"
                  info="External sites, search engines, or social platforms that referred traffic."
                  items={submissionAnalytics.topReferrers}
                />
                <BarList
                  title="Top Countries"
                  info="Geographic breakdown of candidate and visitor IP addresses."
                  items={submissionAnalytics.topCountries}
                />
                <BarList
                  title="Device Breakdown"
                  info="Visitor client hardware categories (Desktop, Mobile, Tablet)."
                  items={submissionAnalytics.deviceBreakdown}
                />
                <BarList
                  title="Browser Breakdown"
                  info="Web browsers used to access the platform (Chrome, Safari, Firefox, Edge, etc.)."
                  items={submissionAnalytics.browserBreakdown}
                />
                <BarList
                  title="OS Breakdown"
                  info="Operating systems of visitor devices (Windows, iOS, macOS, Android, Linux)."
                  items={submissionAnalytics.osBreakdown}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Candidate Interview Quick Action Modal */}
      <CreateCandidateInterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => {
          setIsInterviewModalOpen(false);
          router.refresh();
        }}
      />

      {/* Render Drilldown Popup Overlay */}
      {activeDrilldown && (
        <DrilldownView
          initialMetric={activeDrilldown}
          onClose={() => setActiveDrilldown(null)}
          submissions={submissions}
          purchases={purchases}
          funnelEvents={funnelEvents}
          submissionAnalytics={submissionAnalytics}
          grossRevenue={grossRevenue}
          totalOrders={totalOrders}
          aov={aov}
          overallConversionRate={overallConversionRate}
          serviceStats={serviceStats}
        />
      )}
    </main>
  );
}
