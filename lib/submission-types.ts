export type SubmissionType = "contact" | "job-seeker";

export interface SubmissionRequestMeta {
  sourcePath?: string;
  referrer?: string;
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  deviceType?: "mobile" | "tablet" | "desktop" | "unknown";
  country?: string;
  region?: string;
  city?: string;
}

interface BaseSubmission {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  requestMeta?: SubmissionRequestMeta;
}

export interface ContactSubmission extends BaseSubmission {
  type: "contact";
  company?: string;
  subject?: string;
  message: string;
}

export interface JobSeekerSubmission extends BaseSubmission {
  type: "job-seeker";
  location?: string;
  description?: string;
  resumeUrl?: string;
  resumeFileName?: string;
}

export type AdminSubmission = ContactSubmission | JobSeekerSubmission;

export interface SubmissionStore {
  contactSubmissions: ContactSubmission[];
  jobSeekerSubmissions: JobSeekerSubmission[];
}
