import type { AdminSubmission } from "./submission-types";

export interface AnalyticsBucket {
  label: string;
  count: number;
}

export interface AnalyticsSummary {
  total: number;
  contact: number;
  jobSeekers: number;
  last24Hours: number;
  last7Days: number;
  withResume: number;
  conversionSignals: {
    withPhone: number;
    withCompany: number;
    withDescription: number;
  };
  uniqueEmails: number;
  uniqueIps: number;
  repeatSubmitters: number;
  topSources: AnalyticsBucket[];
  topReferrers: AnalyticsBucket[];
  topCountries: AnalyticsBucket[];
  deviceBreakdown: AnalyticsBucket[];
  browserBreakdown: AnalyticsBucket[];
  osBreakdown: AnalyticsBucket[];
  dailyTrend: AnalyticsBucket[];
}

function increment(map: Map<string, number>, key?: string): void {
  if (!key) {
    return;
  }

  const normalized = key.trim();
  if (!normalized) {
    return;
  }

  map.set(normalized, (map.get(normalized) || 0) + 1);
}

function topBuckets(
  map: Map<string, number>,
  limit: number,
): AnalyticsBucket[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export function buildSubmissionAnalytics(
  submissions: AdminSubmission[],
): AnalyticsSummary {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const topSourcesMap = new Map<string, number>();
  const topReferrersMap = new Map<string, number>();
  const topCountriesMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const browserMap = new Map<string, number>();
  const osMap = new Map<string, number>();
  const dailyMap = new Map<string, number>();
  const emailMap = new Map<string, number>();
  const ipSet = new Set<string>();

  let contact = 0;
  let jobSeekers = 0;
  let last24Hours = 0;
  let last7Days = 0;
  let withResume = 0;
  let withPhone = 0;
  let withCompany = 0;
  let withDescription = 0;

  for (const submission of submissions) {
    const createdAt = new Date(submission.createdAt).getTime();

    if (submission.type === "contact") {
      contact += 1;
      if (submission.company) {
        withCompany += 1;
      }
    } else {
      jobSeekers += 1;
      if (submission.resumeUrl) {
        withResume += 1;
      }
      if (submission.description) {
        withDescription += 1;
      }
    }

    if (submission.phone) {
      withPhone += 1;
    }

    if (createdAt >= oneDayAgo) {
      last24Hours += 1;
    }

    if (createdAt >= sevenDaysAgo) {
      last7Days += 1;
    }

    increment(topSourcesMap, submission.requestMeta?.sourcePath);
    increment(topReferrersMap, submission.requestMeta?.referrer);
    increment(topCountriesMap, submission.requestMeta?.country);
    increment(deviceMap, submission.requestMeta?.deviceType || "unknown");
    increment(browserMap, submission.requestMeta?.browser || "Other");
    increment(osMap, submission.requestMeta?.os || "Other");

    const dayKey = new Date(submission.createdAt).toISOString().slice(0, 10);
    increment(dailyMap, dayKey);

    const email = submission.email.toLowerCase();
    increment(emailMap, email);

    if (submission.requestMeta?.ipAddress) {
      ipSet.add(submission.requestMeta.ipAddress);
    }
  }

  const repeatSubmitters = [...emailMap.values()].filter(
    (count) => count > 1,
  ).length;

  const sortedDays = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([date, count]) => ({ label: date, count }));

  return {
    total: submissions.length,
    contact,
    jobSeekers,
    last24Hours,
    last7Days,
    withResume,
    conversionSignals: {
      withPhone,
      withCompany,
      withDescription,
    },
    uniqueEmails: emailMap.size,
    uniqueIps: ipSet.size,
    repeatSubmitters,
    topSources: topBuckets(topSourcesMap, 6),
    topReferrers: topBuckets(topReferrersMap, 6),
    topCountries: topBuckets(topCountriesMap, 6),
    deviceBreakdown: topBuckets(deviceMap, 6),
    browserBreakdown: topBuckets(browserMap, 6),
    osBreakdown: topBuckets(osMap, 6),
    dailyTrend: sortedDays,
  };
}
