import { type AuthenticatedSession, authenticateUserByRole, signSessionToken, verifySessionToken } from "@/lib/auth-users";

export const ADMIN_SESSION_COOKIE = "jb_admin_session";
const ADMIN_ROLE = "ADMIN";

export async function authenticateAdminCredentials(
  email: string,
  password: string,
): Promise<AuthenticatedSession | null> {
  return authenticateUserByRole(ADMIN_ROLE, email, password);
}

export function generateAdminSessionToken(session: AuthenticatedSession): string {
  return signSessionToken({
    userId: session.userId,
    email: session.email,
    role: ADMIN_ROLE,
    fullName: session.fullName,
  });
}

export function isValidAdminSessionToken(token?: string | null): boolean {
  const payload = verifySessionToken(token);
  return payload !== null && payload.role === ADMIN_ROLE;
}
