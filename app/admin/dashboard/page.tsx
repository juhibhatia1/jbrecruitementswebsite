import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsDashboard from "@/app/components/admin/analytics-dashboard";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import { getAllSubmissions } from "@/lib/submissions-store";
import { prisma } from "@/lib/prisma";

import type { AdminSubmission } from "@/lib/submission-types";

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminSessionToken(token)) {
    redirect("/admin");
  }

  let submissions: AdminSubmission[] = [];
  let purchases: any[] = [];
  let funnelEvents: any[] = [];
  let totalInterviewsCount = 0;
  let dbError: string | null = null;

  try {
    const [fetchedSubmissions, fetchedPurchases, fetchedFunnelEvents, fetchedInterviewsCount] = await Promise.all([
      getAllSubmissions(),
      prisma.purchase.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.funnelEvent.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.candidateApplication.count().catch(() => 0),
    ]);

    submissions = fetchedSubmissions;
    totalInterviewsCount = fetchedInterviewsCount || 0;

    // Serialize Dates to strings for Client Component compatibility
    purchases = fetchedPurchases.map((p) => ({
      id: p.id,
      candidateName: p.candidateName,
      candidateEmail: p.candidateEmail,
      serviceName: p.serviceName,
      amount: p.amount,
      currency: p.currency,
      gatewayTransactionId: p.gatewayTransactionId,
      status: p.status,
      country: p.country,
      mockInterviewStatus: p.mockInterviewStatus,
      mockInterviewDate: p.mockInterviewDate ? p.mockInterviewDate.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    funnelEvents = fetchedFunnelEvents.map((f) => ({
      id: f.id,
      serviceName: f.serviceName,
      eventType: f.eventType,
      createdAt: f.createdAt.toISOString(),
    }));
  } catch (err: any) {
    console.error("Database connection error in admin dashboard:", err);
    dbError = "Database server is currently offline or sleeping. Please refresh in a few seconds to retry.";
  }

  return (
    <AnalyticsDashboard
      submissions={submissions}
      purchases={purchases}
      funnelEvents={funnelEvents}
      totalInterviewsCount={totalInterviewsCount}
      dbError={dbError}
    />
  );
}
