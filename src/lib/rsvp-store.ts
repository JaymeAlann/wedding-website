import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { db, isDbConfigured } from "./db";

/*
 * RSVP store. With DATABASE_URL set (Supabase Postgres) replies live in
 * the `rsvps` table; otherwise they fall back to data/rsvps.json with
 * atomic, serialized writes (fine for local dev on one server).
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

/* ── Postgres backend ──────────────────────────────────────────── */

interface RsvpRow {
  id: string;
  name: string;
  email: string;
  attending: boolean;
  party_size: number;
  guest_names: string;
  dietary: string;
  song: string;
  message: string;
  created_at: Date;
  updated_at: Date;
  updated?: boolean;
}

function fromRow(row: RsvpRow): Rsvp {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    attending: row.attending,
    partySize: row.party_size,
    guestNames: row.guest_names,
    dietary: row.dietary,
    song: row.song,
    message: row.message,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function dbList(): Promise<Rsvp[]> {
  const sql = await db();
  const rows = await sql<RsvpRow[]>`
    select * from rsvps order by created_at desc`;
  return rows.map(fromRow);
}

async function dbSave(
  input: RsvpInput,
): Promise<{ rsvp: Rsvp; updated: boolean }> {
  const sql = await db();
  // Conflict target must match the expression index in db.ts.
  const [row] = await sql<RsvpRow[]>`
    insert into rsvps (
      id, name, email, attending, party_size, guest_names,
      dietary, song, message, created_at, updated_at
    ) values (
      ${randomUUID()}, ${input.name}, ${input.email}, ${input.attending},
      ${input.partySize}, ${input.guestNames}, ${input.dietary},
      ${input.song}, ${input.message}, now(), now()
    )
    on conflict ((lower(regexp_replace(trim(name), '\\s+', ' ', 'g'))))
    do update set
      name = excluded.name,
      email = excluded.email,
      attending = excluded.attending,
      party_size = excluded.party_size,
      guest_names = excluded.guest_names,
      dietary = excluded.dietary,
      song = excluded.song,
      message = excluded.message,
      updated_at = now()
    returning *, (xmax <> 0) as updated`;
  return { rsvp: fromRow(row), updated: Boolean(row.updated) };
}

async function dbDelete(id: string): Promise<boolean> {
  const sql = await db();
  try {
    const rows = await sql`
      delete from rsvps where id = ${id}::uuid returning id`;
    return rows.length > 0;
  } catch {
    return false; // not a valid uuid
  }
}

/* ── JSON-file backend (no DATABASE_URL) ───────────────────────── */

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

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

function fileList(): Promise<Rsvp[]> {
  return serialized(async () =>
    (await readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

function fileSave(input: RsvpInput): Promise<{ rsvp: Rsvp; updated: boolean }> {
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

function fileDelete(id: string): Promise<boolean> {
  return serialized(async () => {
    const rsvps = await readAll();
    const next = rsvps.filter((r) => r.id !== id);
    if (next.length === rsvps.length) return false;
    await writeAll(next);
    return true;
  });
}

/* ── Public API ────────────────────────────────────────────────── */

export function listRsvps(): Promise<Rsvp[]> {
  return isDbConfigured() ? dbList() : fileList();
}

/** Insert, or update an earlier reply from the same name. */
export function saveRsvp(
  input: RsvpInput,
): Promise<{ rsvp: Rsvp; updated: boolean }> {
  return isDbConfigured() ? dbSave(input) : fileSave(input);
}

export function deleteRsvp(id: string): Promise<boolean> {
  return isDbConfigured() ? dbDelete(id) : fileDelete(id);
}
