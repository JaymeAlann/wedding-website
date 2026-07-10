import { couple } from "@/lib/config";
import { listRsvps } from "@/lib/rsvp-store";

/** The couple, plus everyone who has RSVP'd yes — the map's walkers. */
export async function walkerNames(): Promise<string[]> {
  const walkers: string[] = [couple.a, couple.b];
  try {
    const rsvps = await listRsvps();
    for (const rsvp of rsvps) {
      if (rsvp.attending) walkers.push(rsvp.name);
    }
  } catch {
    // The pages must render even if the database is unreachable.
  }
  const seen = new Set<string>();
  return walkers.filter((name) => {
    const key = name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
