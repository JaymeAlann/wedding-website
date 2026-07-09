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

const GUEST_PASSWORD = process.env.GUEST_PASSWORD ?? "revelio";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "marauders1885";

/** Constant-time comparison; hashing first hides length differences. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): Role | null {
  if (safeEqual(input, ADMIN_PASSWORD)) return "admin";
  if (safeEqual(input, GUEST_PASSWORD)) return "guest";
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
