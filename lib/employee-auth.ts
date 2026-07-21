import { type AuthenticatedSession, authenticateUserByRole, signSessionToken, verifySessionToken } from "@/lib/auth-users";

export const EMPLOYEE_SESSION_COOKIE = "jb_employee_session";
const EMPLOYEE_ROLE = "EMPLOYEE";

export async function authenticateEmployeeCredentials(
  email: string,
  password: string,
): Promise<AuthenticatedSession | null> {
  return authenticateUserByRole(EMPLOYEE_ROLE, email, password);
}

export function generateEmployeeSessionToken(
  session: AuthenticatedSession,
): string {
  return signSessionToken({
    userId: session.userId,
    email: session.email,
    role: EMPLOYEE_ROLE,
    fullName: session.fullName,
  });
}

export function isValidEmployeeSessionToken(token?: string | null): boolean {
  const payload = verifySessionToken(token);
  return payload !== null && payload.role === EMPLOYEE_ROLE;
}
