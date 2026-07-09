/*
 * Thin Twilio SMS client over their REST API — no SDK dependency.
 * Credentials come from .env.local:
 *
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxx
 *   TWILIO_AUTH_TOKEN=xxxxxxxx
 *   TWILIO_FROM=+1XXXXXXXXXX            (your Twilio number)
 *   TWILIO_MESSAGING_SERVICE_SID=MGxxx  (optional, used instead of FROM)
 */

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function isTwilioConfigured(): boolean {
  return Boolean(
    env("TWILIO_ACCOUNT_SID") &&
      env("TWILIO_AUTH_TOKEN") &&
      (env("TWILIO_FROM") || env("TWILIO_MESSAGING_SERVICE_SID")),
  );
}

/**
 * Normalize a US-centric phone input to E.164.
 * Returns null when the input can't be a valid number.
 */
export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    const rest = digits.slice(1);
    return /^[1-9]\d{9,14}$/.test(rest) ? `+${rest}` : null;
  }
  if (/^\d{10}$/.test(digits)) return `+1${digits}`;
  if (/^1\d{10}$/.test(digits)) return `+${digits}`;
  return null;
}

export async function sendSms(
  to: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sid = env("TWILIO_ACCOUNT_SID");
  const params = new URLSearchParams({ To: to, Body: body });
  const messagingService = env("TWILIO_MESSAGING_SERVICE_SID");
  if (messagingService) params.set("MessagingServiceSid", messagingService);
  else params.set("From", env("TWILIO_FROM"));

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${sid}:${env("TWILIO_AUTH_TOKEN")}`,
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    return { ok: false, error: data?.message ?? `Twilio HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
