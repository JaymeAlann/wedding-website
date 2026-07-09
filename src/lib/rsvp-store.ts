import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

/*
 * File-backed RSVP store: data/rsvps.json. Writes are atomic
 * (tmp + rename) and serialized through a promise queue, which is
 * plenty for wedding-guest traffic on a single Node server. Swap this
 * module for a database if you deploy somewhere without a persistent
 * disk (see README).
 */

export interface Rsvp {
  id: string;
  name: string;
  email: string;
  attending: boolean;
  /** Seats taken including the respondent; 0 when declining. */
  partySize: number;
  guestNames: string;
  dietary: string;
  song: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export type RsvpInput = Omit<Rsvp, "id" | "createdAt" | "updatedAt">;

const DATA_FILE = path.join(process.cwd(), "data", "rsvps.json");

let queue: Promise<unknown> = Promise.resolve();

function serialized<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readAll(): Promise<Rsvp[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Rsvp[]) : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    // Corrupted file: fail loudly rather than silently overwriting replies.
    throw err;
  }
}

async function writeAll(rsvps: Rsvp[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rsvps, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

export function listRsvps(): Promise<Rsvp[]> {
  return serialized(async () =>
    (await readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** Insert, or update an earlier reply from the same name. */
export function saveRsvp(
  input: RsvpInput,
): Promise<{ rsvp: Rsvp; updated: boolean }> {
  return serialized(async () => {
    const rsvps = await readAll();
    const now = new Date().toISOString();

    const existing = rsvps.find((r) => normalize(r.name) === normalize(input.name));
    if (existing) {
      Object.assign(existing, input, { updatedAt: now });
      await writeAll(rsvps);
      return { rsvp: existing, updated: true };
    }

    const rsvp: Rsvp = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    rsvps.push(rsvp);
    await writeAll(rsvps);
    return { rsvp, updated: false };
  });
}

export function deleteRsvp(id: string): Promise<boolean> {
  return serialized(async () => {
    const rsvps = await readAll();
    const next = rsvps.filter((r) => r.id !== id);
    if (next.length === rsvps.length) return false;
    await writeAll(next);
    return true;
  });
}
