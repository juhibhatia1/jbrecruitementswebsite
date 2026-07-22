const PROD_FALLBACK_URL = "https://jbrecruitments.com";
const DEV_FALLBACK_URL = "http://localhost:3000";

export function getAppBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl =
    configuredUrl && configuredUrl.trim().length > 0
      ? configuredUrl
      : process.env.NODE_ENV === "production"
        ? PROD_FALLBACK_URL
        : DEV_FALLBACK_URL;

  return baseUrl.replace(/\/$/, "");
}

export function buildAppUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getAppBaseUrl()}${normalizedPath}`;
}
