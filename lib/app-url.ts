export function buildAppUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL(pathname, baseUrl).toString();
}
