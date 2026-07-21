import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  EMPLOYEE_SESSION_COOKIE,
  isValidEmployeeSessionToken,
} from "@/lib/employee-auth";
import { prisma } from "@/lib/prisma";
import type { InterviewEvaluationEvent, InterviewFinalReport } from "@/lib/interview/types";
import { EmployeeInterviewsDashboard } from "./interviews-dashboard";

export const dynamic = "force-dynamic";

type HumanBookingNotes = {
  jobRole?: string;
  yearsOfExperience?: string;
  applicationLink?: string;
  interviewBrief?: string;
  auditNotes?: string;
  interviewOutcome?: string;
};

type PurchaseRow = {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  serviceName: string;
  amount: number;
  currency: string;
  status: string;
  mockInterviewStatus: string | null;
  mockInterviewDate: string | null;
  deliveryStatus: string;
  deliveryDeadline: string | null;
  completionNotes: string | null;
  country: string | null;
  stripePaymentIntentId: string;
  createdAt: string;
  updatedAt: string;
};

type RawApplicationRow = {
  id: string;
  candidateEmail: string;
  candidateName: string;
  interviewPreference: "AI" | "MANUAL";
  status: string;
  scheduledAt: Date | null;
  createdAt: Date;
  template: {
    id: string;
    jobRole: string;
    experienceLevel: string;
    durationMinutes: number;
  };
  session: {
    id: string;
    status: string;
    finalReport: unknown;
    evaluationEvents: unknown;
    completedAt: Date | null;
  } | null;
};

export type CandidateInterviewBooking = {
  purchase: PurchaseRow;
  preference: "AI" | "MANUAL";
  relatedApplication: SerializedApplicationRow | null;
  details: HumanBookingNotes;
};

export type CandidateInterviewRecord = {
  email: string;
  name: string;
  phone: string | null;
  country: string | null;
  bookings: CandidateInterviewBooking[];
};

type SerializedApplicationRow = {
  id: string;
  candidateEmail: string;
  candidateName: string;
  interviewPreference: "AI" | "MANUAL";
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  template: {
    id: string;
    jobRole: string;
    experienceLevel: string;
    durationMinutes: number;
  };
  session: {
    id: string;
    status: string;
    finalReport: InterviewFinalReport | null;
    evaluationEvents: InterviewEvaluationEvent[];
    completedAt: string | null;
  } | null;
};

export default async function EmployeeInterviewsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;
  if (!isValidEmployeeSessionToken(token)) redirect("/employee");

  const [purchases, applications] = await Promise.all([
    prisma.purchase.findMany({
      where: {
        OR: [
          { serviceName: { contains: "Mock Interview" } },
          { serviceName: "Mock Interview" },
        ],
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.candidateApplication.findMany({
      where: {
        interviewPreference: { in: ["AI", "MANUAL"] },
      },
      select: {
        id: true,
        candidateEmail: true,
        candidateName: true,
        interviewPreference: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
        template: {
          select: {
            id: true,
            jobRole: true,
            experienceLevel: true,
            durationMinutes: true,
          },
        },
        session: {
          select: {
            id: true,
            status: true,
            finalReport: true,
            evaluationEvents: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const appByEmail = new Map<string, RawApplicationRow[]>();
  applications.forEach((application) => {
    const key = application.candidateEmail.toLowerCase();
    const existing = appByEmail.get(key) ?? [];
    existing.push(application);
    appByEmail.set(key, existing);
  });

  const candidateMap = new Map<
    string,
    {
      email: string;
      name: string;
      phone: string | null;
      country: string | null;
      purchases: PurchaseRow[];
    }
  >();

  purchases.forEach((purchase) => {
    const normalizedPurchase: PurchaseRow = {
      ...purchase,
      mockInterviewDate: purchase.mockInterviewDate?.toISOString() || null,
      deliveryDeadline: purchase.deliveryDeadline?.toISOString() || null,
      createdAt: purchase.createdAt.toISOString(),
      updatedAt: purchase.updatedAt.toISOString(),
    };

    const key = purchase.candidateEmail.toLowerCase();
    const existing = candidateMap.get(key);
    if (existing) {
      existing.purchases.push(normalizedPurchase);
      if (!existing.phone && purchase.candidatePhone) existing.phone = purchase.candidatePhone;
      if (!existing.country && purchase.country) existing.country = purchase.country;
    } else {
      candidateMap.set(key, {
        email: purchase.candidateEmail,
        name: purchase.candidateName,
        phone: purchase.candidatePhone,
        country: purchase.country,
        purchases: [normalizedPurchase],
      });
    }
  });

  const candidateBookings: CandidateInterviewRecord[] = Array.from(candidateMap.values()).map((candidate) => {
    const bookings: CandidateInterviewBooking[] = candidate.purchases.map((purchase) => {
      const preference = purchase.serviceName.includes("AI") ? "AI" : "MANUAL";
      const relatedApplications = appByEmail.get(candidate.email.toLowerCase()) ?? [];
      const relatedApplication =
        relatedApplications
          .filter((application) => application.interviewPreference === preference)
          .sort(
            (left, right) =>
              Math.abs(new Date(left.createdAt).getTime() - new Date(purchase.createdAt).getTime()) -
              Math.abs(new Date(right.createdAt).getTime() - new Date(purchase.createdAt).getTime()),
          )[0] ?? null;

      return {
        purchase,
        preference,
        relatedApplication: relatedApplication
          ? serializeApplicationRow(relatedApplication)
          : null,
        details: parseHumanNotes(purchase.completionNotes),
      };
    });

    return {
      ...candidate,
      bookings,
    };
  });

  const allBookings = candidateBookings.flatMap((candidate) => candidate.bookings);
  const stats = {
    totalCandidates: candidateBookings.length,
    totalPaidBookings: allBookings.filter((booking) => booking.purchase.status === "COMPLETED").length,
    aiCount: allBookings.filter((booking) => booking.preference === "AI").length,
    humanCount: allBookings.filter((booking) => booking.preference === "MANUAL").length,
    completedCount: allBookings.filter(isBookingCompleted).length,
  };

  return <EmployeeInterviewsDashboard candidateBookings={candidateBookings} stats={stats} />;
}

function parseHumanNotes(notes: string | null): HumanBookingNotes {
  if (!notes) return {};
  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === "object") return parsed as HumanBookingNotes;
  } catch {
    // ignore invalid notes payloads
  }
  return {};
}

function isBookingCompleted(booking: CandidateInterviewBooking) {
  if (booking.preference === "AI") {
    return (
      booking.relatedApplication?.session?.status === "COMPLETED" ||
      booking.relatedApplication?.status === "INTERVIEW_COMPLETED" ||
      booking.purchase.deliveryStatus === "COMPLETED"
    );
  }

  return (
    booking.purchase.mockInterviewStatus === "COMPLETED" ||
    booking.purchase.deliveryStatus === "COMPLETED" ||
    Boolean(booking.details.interviewOutcome)
  );
}

function serializeApplicationRow(application: RawApplicationRow): {
  id: string;
  candidateEmail: string;
  candidateName: string;
  interviewPreference: "AI" | "MANUAL";
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  template: {
    id: string;
    jobRole: string;
    experienceLevel: string;
    durationMinutes: number;
  };
  session: {
    id: string;
    status: string;
    finalReport: InterviewFinalReport | null;
    evaluationEvents: InterviewEvaluationEvent[];
    completedAt: string | null;
  } | null;
} {
  return {
    ...application,
    scheduledAt: application.scheduledAt?.toISOString() || null,
    createdAt: application.createdAt.toISOString(),
    session: application.session
      ? {
          ...application.session,
          finalReport: application.session.finalReport as InterviewFinalReport | null,
          evaluationEvents: application.session.evaluationEvents as InterviewEvaluationEvent[],
          completedAt: application.session.completedAt?.toISOString() || null,
        }
      : null,
  };
}
