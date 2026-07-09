import { requireAdmin } from "@/lib/auth";
import { listRsvps } from "@/lib/rsvp-store";

function cell(value: string | number | boolean): string {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  await requireAdmin();
  const rsvps = await listRsvps();

  const header = [
    "Name",
    "Email",
    "Attending",
    "Seats",
    "Guest names",
    "Dietary",
    "Song",
    "Message",
    "Received",
    "Updated",
  ];

  const rows = rsvps.map((r) =>
    [
      r.name,
      r.email,
      r.attending ? "yes" : "no",
      r.attending ? r.partySize : 0,
      r.guestNames,
      r.dietary,
      r.song,
      r.message,
      r.createdAt,
      r.updatedAt,
    ]
      .map(cell)
      .join(","),
  );

  // BOM so Excel opens it as UTF-8.
  const csv = `﻿${[header.join(","), ...rows].join("\r\n")}\r\n`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rsvps.csv"',
    },
  });
}
