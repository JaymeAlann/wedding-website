import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
  verifyToken,
  type Role,
  type Session,
} from "./session";

/*
 * Passwords live only in the environment (.env.local / host config) —
 * no fallbacks, so a missing variable fails loudly instead of silently
 * accepting a known default. Checked lazily to keep builds env-free.
 */
function requiredEnv(name: "GUEST_PASSWORD" | "ADMIN_PASSWORD"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set — add it to .env.local (see .env.example).`);
  }
  return value;
}

/** Constant-time comparison; hashing first hides length differences. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): Role | null {
  if (safeEqual(input, requiredEnv("ADMIN_PASSWORD"))) return "admin";
  if (safeEqual(input, requiredEnv("GUEST_PASSWORD"))) return "guest";
  return null;
}

export async function createSession(role: Role): Promise<void> {
  const token = await createToken(role);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return verifyToken(cookieStore.get(SESSION_COOKIE)?.value);
}

/** The proxy redirects too, but pages and actions re-check here. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");
  return session;
}
