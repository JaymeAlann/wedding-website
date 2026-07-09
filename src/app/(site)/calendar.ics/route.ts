import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { couple, wedding } from "@/lib/config";

const EVENT_HOURS = 6;

/** RFC 5545 text escaping. */
function esc(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold lines longer than 74 octets (continuation lines start with a space). */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET() {
  if (!(await getSession())) redirect("/login");

  // "2027-04-17T17:00:00" → "20270417T170000" (venue-local wall time).
  const start = wedding.dateISO.replace(/[-:]/g, "").slice(0, 15);

  // Add the duration with UTC arithmetic purely for day rollover — the
  // components stay wall-clock time in the venue zone.
  const m = wedding.dateISO.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)!;
  const endDate = new Date(
    Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] + EVENT_HOURS, +m[5], +m[6]),
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  const end =
    `${endDate.getUTCFullYear()}${pad(endDate.getUTCMonth() + 1)}${pad(endDate.getUTCDate())}` +
    `T${pad(endDate.getUTCHours())}${pad(endDate.getUTCMinutes())}${pad(endDate.getUTCSeconds())}`;

  const summary = `${couple.a} & ${couple.b} — Wedding`;
  const location = `${wedding.venue.name}, ${wedding.venue.address}`;
  const description = `The wedding of ${couple.a} and ${couple.b}. ${wedding.venue.note}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Website//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    fold(`UID:wedding-${start}@${couple.a.toLowerCase()}-${couple.b.toLowerCase()}`),
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART;TZID=${wedding.timeZone}:${start}`,
    `DTEND;TZID=${wedding.timeZone}:${end}`,
    fold(`SUMMARY:${esc(summary)}`),
    fold(`LOCATION:${esc(location)}`),
    fold(`DESCRIPTION:${esc(description)}`),
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${couple.a.toLowerCase()}-${couple.b.toLowerCase()}-wedding.ics"`,
    },
  });
}
