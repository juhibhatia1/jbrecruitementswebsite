import "server-only";

import { prisma } from "./prisma";
import type {
  AdminSubmission,
  ContactSubmission,
  JobSeekerSubmission,
  SubmissionRequestMeta,
  SubmissionStore,
} from "./submission-types";

type ContactPayload = Omit<ContactSubmission, "id" | "createdAt" | "type"> & {
  requestMeta?: SubmissionRequestMeta;
};

type JobSeekerPayload = Omit<
  JobSeekerSubmission,
  "id" | "createdAt" | "type"
> & {
  requestMeta?: SubmissionRequestMeta;
};

export async function addContactSubmission(
  payload: ContactPayload,
): Promise<ContactSubmission> {
  const dbSubmission = await prisma.contactSubmission.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      company: payload.company || null,
      subject: payload.subject || null,
      message: payload.message,
      sourcePath: payload.requestMeta?.sourcePath || null,
      referrer: payload.requestMeta?.referrer || null,
      ipAddress: payload.requestMeta?.ipAddress || null,
      userAgent: payload.requestMeta?.userAgent || null,
      browser: payload.requestMeta?.browser || null,
      os: payload.requestMeta?.os || null,
      deviceType: payload.requestMeta?.deviceType || null,
      country: payload.requestMeta?.country || null,
      region: payload.requestMeta?.region || null,
      city: payload.requestMeta?.city || null,
    },
  });

  return {
    id: dbSubmission.id,
    type: "contact",
    createdAt: dbSubmission.createdAt.toISOString(),
    name: dbSubmission.name,
    email: dbSubmission.email,
    phone: dbSubmission.phone || undefined,
    company: dbSubmission.company || undefined,
    subject: dbSubmission.subject || undefined,
    message: dbSubmission.message,
    requestMeta: {
      sourcePath: dbSubmission.sourcePath || undefined,
      referrer: dbSubmission.referrer || undefined,
      ipAddress: dbSubmission.ipAddress || undefined,
      userAgent: dbSubmission.userAgent || undefined,
      browser: dbSubmission.browser || undefined,
      os: dbSubmission.os || undefined,
      deviceType:
        (dbSubmission.deviceType as SubmissionRequestMeta["deviceType"]) ||
        undefined,
      country: dbSubmission.country || undefined,
      region: dbSubmission.region || undefined,
      city: dbSubmission.city || undefined,
    },
  };
}

export async function addJobSeekerSubmission(
  payload: JobSeekerPayload,
): Promise<JobSeekerSubmission> {
  const dbSubmission = await prisma.jobSeekerSubmission.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      location: payload.location || null,
      description: payload.description || null,
      resumeUrl: payload.resumeUrl || null,
      resumeFileName: payload.resumeFileName || null,
      sourcePath: payload.requestMeta?.sourcePath || null,
      referrer: payload.requestMeta?.referrer || null,
      ipAddress: payload.requestMeta?.ipAddress || null,
      userAgent: payload.requestMeta?.userAgent || null,
      browser: payload.requestMeta?.browser || null,
      os: payload.requestMeta?.os || null,
      deviceType: payload.requestMeta?.deviceType || null,
      country: payload.requestMeta?.country || null,
      region: payload.requestMeta?.region || null,
      city: payload.requestMeta?.city || null,
    },
  });

  return {
    id: dbSubmission.id,
    type: "job-seeker",
    createdAt: dbSubmission.createdAt.toISOString(),
    name: dbSubmission.name,
    email: dbSubmission.email,
    phone: dbSubmission.phone || undefined,
    location: dbSubmission.location || undefined,
    description: dbSubmission.description || undefined,
    resumeUrl: dbSubmission.resumeUrl || undefined,
    resumeFileName: dbSubmission.resumeFileName || undefined,
    requestMeta: {
      sourcePath: dbSubmission.sourcePath || undefined,
      referrer: dbSubmission.referrer || undefined,
      ipAddress: dbSubmission.ipAddress || undefined,
      userAgent: dbSubmission.userAgent || undefined,
      browser: dbSubmission.browser || undefined,
      os: dbSubmission.os || undefined,
      deviceType:
        (dbSubmission.deviceType as SubmissionRequestMeta["deviceType"]) ||
        undefined,
      country: dbSubmission.country || undefined,
      region: dbSubmission.region || undefined,
      city: dbSubmission.city || undefined,
    },
  };
}

export async function getSubmissionStore(): Promise<SubmissionStore> {
  const [contactSubmissions, jobSeekerSubmissions] = await Promise.all([
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobSeekerSubmission.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    contactSubmissions: contactSubmissions.map((cs) => ({
      id: cs.id,
      type: "contact" as const,
      createdAt: cs.createdAt.toISOString(),
      name: cs.name,
      email: cs.email,
      phone: cs.phone || undefined,
      company: cs.company || undefined,
      subject: cs.subject || undefined,
      message: cs.message,
      requestMeta: {
        sourcePath: cs.sourcePath || undefined,
        referrer: cs.referrer || undefined,
        ipAddress: cs.ipAddress || undefined,
        userAgent: cs.userAgent || undefined,
        browser: cs.browser || undefined,
        os: cs.os || undefined,
        deviceType:
          (cs.deviceType as SubmissionRequestMeta["deviceType"]) || undefined,
        country: cs.country || undefined,
        region: cs.region || undefined,
        city: cs.city || undefined,
      },
    })),
    jobSeekerSubmissions: jobSeekerSubmissions.map((js) => ({
      id: js.id,
      type: "job-seeker" as const,
      createdAt: js.createdAt.toISOString(),
      name: js.name,
      email: js.email,
      phone: js.phone || undefined,
      location: js.location || undefined,
      description: js.description || undefined,
      resumeUrl: js.resumeUrl || undefined,
      resumeFileName: js.resumeFileName || undefined,
      requestMeta: {
        sourcePath: js.sourcePath || undefined,
        referrer: js.referrer || undefined,
        ipAddress: js.ipAddress || undefined,
        userAgent: js.userAgent || undefined,
        browser: js.browser || undefined,
        os: js.os || undefined,
        deviceType:
          (js.deviceType as SubmissionRequestMeta["deviceType"]) || undefined,
        country: js.country || undefined,
        region: js.region || undefined,
        city: js.city || undefined,
      },
    })),
  };
}

export async function getAllSubmissions(): Promise<AdminSubmission[]> {
  const [contactSubmissions, jobSeekerSubmissions] = await Promise.all([
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobSeekerSubmission.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const allSubmissions: AdminSubmission[] = [
    ...contactSubmissions.map(
      (cs) =>
        ({
          id: cs.id,
          type: "contact",
          createdAt: cs.createdAt.toISOString(),
          name: cs.name,
          email: cs.email,
          phone: cs.phone || undefined,
          company: cs.company || undefined,
          subject: cs.subject || undefined,
          message: cs.message,
          requestMeta: {
            sourcePath: cs.sourcePath || undefined,
            referrer: cs.referrer || undefined,
            ipAddress: cs.ipAddress || undefined,
            userAgent: cs.userAgent || undefined,
            browser: cs.browser || undefined,
            os: cs.os || undefined,
            deviceType:
              (cs.deviceType as SubmissionRequestMeta["deviceType"]) ||
              undefined,
            country: cs.country || undefined,
            region: cs.region || undefined,
            city: cs.city || undefined,
          },
        }) as ContactSubmission,
    ),
    ...jobSeekerSubmissions.map(
      (js) =>
        ({
          id: js.id,
          type: "job-seeker",
          createdAt: js.createdAt.toISOString(),
          name: js.name,
          email: js.email,
          phone: js.phone || undefined,
          location: js.location || undefined,
          description: js.description || undefined,
          resumeUrl: js.resumeUrl || undefined,
          resumeFileName: js.resumeFileName || undefined,
          requestMeta: {
            sourcePath: js.sourcePath || undefined,
            referrer: js.referrer || undefined,
            ipAddress: js.ipAddress || undefined,
            userAgent: js.userAgent || undefined,
            browser: js.browser || undefined,
            os: js.os || undefined,
            deviceType:
              (js.deviceType as SubmissionRequestMeta["deviceType"]) ||
              undefined,
            country: js.country || undefined,
            region: js.region || undefined,
            city: js.city || undefined,
          },
        }) as JobSeekerSubmission,
    ),
  ];

  return allSubmissions.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
