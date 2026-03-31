export const ADMIN_SESSION_COOKIE = "jb_admin_session";

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123";

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export function getSessionToken(): string {
  return (
    process.env.ADMIN_SESSION_TOKEN ||
    `${getAdminUsername()}-jb-recruitment-admin-session`
  );
}

export function isValidAdminCredentials(
  username: string,
  password: string,
): boolean {
  return username === getAdminUsername() && password === getAdminPassword();
}

export function isValidAdminSessionToken(token?: string | null): boolean {
  if (!token) {
    return false;
  }

  return token === getSessionToken();
}
