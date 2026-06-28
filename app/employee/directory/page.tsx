import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EmployeeDirectoryDashboard from "@/app/components/employee/employee-directory-dashboard";
import { EMPLOYEE_SESSION_COOKIE, isValidEmployeeSessionToken } from "@/lib/employee-auth";
import { getAllSubmissions } from "@/lib/submissions-store";

import type { AdminSubmission } from "@/lib/submission-types";

export const dynamic = "force-dynamic";

export default async function EmployeeDirectoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;

  if (!isValidEmployeeSessionToken(token)) {
    redirect("/employee");
  }

  let submissions: AdminSubmission[] = [];
  let serializedPurchases: any[] = [];
  let dbError: string | null = null;

  try {
    // Fetch all submissions consolidated
    submissions = await getAllSubmissions();

    // Fetch all purchases (both completed and pending)
    const purchases = await prisma.purchase.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Convert purchases Date objects to strings for Client Component compatibility
    serializedPurchases = purchases.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      mockInterviewDate: p.mockInterviewDate ? p.mockInterviewDate.toISOString() : null,
      deliveryDeadline: p.deliveryDeadline ? p.deliveryDeadline.toISOString() : null,
    }));
  } catch (err: any) {
    console.error("Database connection error in employee directory:", err);
    dbError = "Database server is offline or sleeping. Please refresh in a few seconds to retry.";
  }

  return (
    <EmployeeDirectoryDashboard
      submissions={submissions}
      purchases={serializedPurchases}
      dbError={dbError}
    />
  );
}
