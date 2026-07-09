import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";

/**
 * Optimistic gate for every page: guests need a valid session cookie,
 * /admin needs the admin role. Pages and server actions still verify
 * for themselves in lib/auth.
 */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifyToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL("/login", req.nextUrl);
    if (pathname !== "/") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and public assets (images stay unauthenticated —
  // see README). Everything else, /calendar.ics included, is gated.
  matcher: [
    "/((?!_next/static|_next/image|icon.svg|.*\\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico|txt|xml|webmanifest)$).*)",
  ],
};
