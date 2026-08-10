import { prisma } from "@/lib/prisma";
import { hashInterviewAccessToken } from "@/lib/interview/access-token";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Interview Lobby | JB Recruitment Solutions",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function InterviewLobbyPage({ params }: Props) {
  const { token } = await params;

  let tokenHash: string;
  try {
    tokenHash = hashInterviewAccessToken(token);
  } catch {
    return <ErrorView message="Server configuration error. Please contact support." />;
  }

  const application = await prisma.candidateApplication.findUnique({
    where: { accessTokenHash: tokenHash },
    include: {
      template: {
        select: {
          jobRole: true,
          experienceLevel: true,
          durationMinutes: true,
          difficultyLevel: true,
          interviewDescription: true,
          techStack: true,
          requiredSkills: true,
        },
      },
    },
  });

  if (!application) {
    return <ErrorView message="This interview link is invalid or has already been used." />;
  }

  if (application.accessTokenExpiresAt.getTime() < Date.now()) {
    return <ErrorView message="This interview link has expired. Please contact the recruiter to receive a new link." />;
  }

  if (application.status === "INTERVIEW_COMPLETED") {
    return (
      <CompletedView
        candidateName={application.candidateName}
        jobRole={application.template.jobRole}
      />
    );
  }

  if (
    application.status === "TOKEN_EXPIRED" ||
    application.status === "CANCELLED"
  ) {
    return <ErrorView message="This interview link is no longer available." />;
  }

  if (application.interviewPreference !== "AI") {
    return <ErrorView message="This link is not associated with an AI interview." />;
  }

  const { template } = application;
  const expiresIn = Math.ceil(
    (application.accessTokenExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <main className="mx-auto max-w-3xl px-4 md:px-6 pt-28 sm:pt-36 md:pt-32 pb-16 md:pb-24">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5a58ab] mb-2">
            AI Mock Interview
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#252e3d] mb-2">
            {template.jobRole}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span>{template.experienceLevel}</span>
            <span>·</span>
            <span>~{template.durationMinutes} minutes</span>
            <span>·</span>
            <span>{template.difficultyLevel}</span>
          </div>
        </div>

        {/* Description */}
        {template.interviewDescription && (
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 mb-6">
            <h2
              className="text-lg font-semibold text-[#252e3d] mb-2"
              style={{ fontFamily: "Crimson Text, serif" }}
            >
              What to Expect
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {template.interviewDescription}
            </p>
          </div>
        )}

        {/* Checklist */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 mb-6">
          <h2
            className="text-lg font-semibold text-[#252e3d] mb-4"
            style={{ fontFamily: "Crimson Text, serif" }}
          >
            Before You Start
          </h2>
          <ul className="space-y-3">
            {[
              "Use Chrome or Edge for best compatibility",
              "Find a quiet environment with minimal background noise",
              "Ensure your microphone is connected and working",
              "Close other browser tabs to avoid audio interruptions",
              "Have a stable internet connection",
              `This link expires in ${expiresIn} day${expiresIn !== 1 ? "s" : ""} — start when you're ready`,
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#5a58ab]/40 text-[#5a58ab] text-xs">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Tech / skills */}
        {(template.techStack.length > 0 || template.requiredSkills.length > 0) && (
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 mb-8">
            {template.techStack.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Topics Covered
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.techStack.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-[#f0efff] text-[#5a58ab] px-2.5 py-1 text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.requiredSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Key Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-gray-100 text-gray-600 px-2.5 py-1 text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-5">
            Hi <strong>{application.candidateName}</strong> — when you're ready, click below to enter the interview room.
          </p>
          <div className="mx-auto mb-6 max-w-sm rounded-lg bg-blue-50 p-4 text-left border border-blue-100">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Interview Tips
            </h4>
            <ul className="text-xs text-blue-700 space-y-1.5 list-disc list-inside">
              <li>This is a live, conversational AI interview.</li>
              <li>Please use a <strong>quiet environment</strong> to avoid background noise interruptions.</li>
              <li>For the best experience, we strongly recommend using <strong>headphones</strong>.</li>
              <li>Take the interview on a <strong>laptop or desktop computer</strong> rather than a mobile device.</li>
            </ul>
          </div>
          <Link
            href={`/live-interview/${token}`}
            className="inline-block rounded-xl bg-[#5a58ab] px-8 py-3.5 text-base font-semibold text-white transition hover:bg-[#4a49a0]"
          >
            Start Interview
          </Link>
          <p className="mt-4 text-xs text-gray-400">
            Clicking Start will open the live interview room and begin the session.
          </p>
        </div>
      </main>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#F9F9FB] px-4"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="max-w-sm text-center">
        <p
          className="text-xl font-semibold text-[#252e3d] mb-3"
          style={{ fontFamily: "Crimson Text, serif" }}
        >
          Link Unavailable
        </p>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <Link
          href="/job-seekers"
          className="inline-block rounded-xl border border-[#e0e0e0] bg-white px-5 py-2.5 text-sm font-semibold text-[#252e3d] transition hover:bg-gray-50"
        >
          Back to Job Seekers
        </Link>
      </div>
    </div>
  );
}

function CompletedView({ candidateName, jobRole }: { candidateName: string; jobRole: string }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#F9F9FB] px-4"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="max-w-sm text-center">
        <p
          className="text-xl font-semibold text-[#252e3d] mb-2"
          style={{ fontFamily: "Crimson Text, serif" }}
        >
          Interview Completed
        </p>
        <p className="text-sm text-gray-600 mb-6">
          {candidateName}, you have already completed your AI mock interview practice for{" "}
          <strong>{jobRole}</strong>. Your performance report will be emailed to you.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl border border-[#e0e0e0] bg-white px-5 py-2.5 text-sm font-semibold text-[#252e3d] transition hover:bg-gray-50"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
