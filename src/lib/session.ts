/*
 * Stateless session tokens: base64url(payload).base64url(hmac-sha256).
 * Web Crypto only, so the same code runs in the proxy and in server
 * actions regardless of runtime.
 */

export const SESSION_COOKIE = "mm_session";
export const SESSION_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export type Role = "guest" | "admin";

export interface Session {
  role: Role;
  exp: number;
}

// Required, with no fallback: a guessable default secret would let
// anyone forge an admin session cookie. Generate with
// `openssl rand -hex 32` (see .env.example). Checked lazily so builds
// don't need the environment.
function secret(): string {
  const value = process.env.SESSION_SECRET?.trim();
  if (!value) {
    throw new Error(
      "SESSION_SECRET is not set — add it to .env.local (see .env.example).",
    );
  }
  return value;
}

const encoder = new TextEncoder();

let keyPromise: Promise<CryptoKey> | undefined;

function hmacKey(): Promise<CryptoKey> {
  keyPromise ??= crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return keyPromise;
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(value: string): Uint8Array<ArrayBuffer> {
  const b64 =
    value.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (value.length % 4)) % 4);
  const bin = atob(b64);
  // Explicit ArrayBuffer so the result satisfies BufferSource under TS 5.9.
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function createToken(role: Role): Promise<string> {
  const payload = encoder.encode(
    JSON.stringify({ role, exp: Date.now() + SESSION_MAX_AGE_MS }),
  );
  const body = b64urlEncode(payload);
  const sig = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    encoder.encode(body),
  );
  return `${body}.${b64urlEncode(new Uint8Array(sig))}`;
}

export async function verifyToken(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      b64urlDecode(sig),
      encoder.encode(body),
    );
    if (!valid) return null;

    const session = JSON.parse(
      new TextDecoder().decode(b64urlDecode(body)),
    ) as Session;
    if (session.role !== "guest" && session.role !== "admin") return null;
    if (typeof session.exp !== "number" || session.exp < Date.now())
      return null;
    return session;
  } catch {
    return null; // malformed base64/JSON
  }
}
