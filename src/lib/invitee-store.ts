import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { db, isDbConfigured } from "./db";

/*
 * Guest-list + SMS campaign store. With DATABASE_URL set (Supabase
 * Postgres) everything lives in the `invitees` / `campaigns` tables;
 * otherwise it falls back to JSON files in data/ with atomic,
 * serialized writes — same scheme as rsvp-store.
 */

export interface Invitee {
  id: string;
  name: string;
  /** E.164, e.g. +14045551234 — normalized before saving. */
  phone: string;
  /** Free-form group label, e.g. "Friends", "Family". */
  tag: string;
  /** Whether their invitation covers a guest (default) or just them. */
  plusOne: boolean;
  createdAt: string;
}

export type InviteeInput = Omit<Invitee, "id" | "createdAt">;

export interface CampaignResult {
  name: string;
  phone: string;
  ok: boolean;
  /** Twilio's error message, when ok is false. */
  error?: string;
}

export interface Campaign {
  id: string;
  templateLabel: string;
  message: string;
  sentAt: string;
  results: CampaignResult[];
}

/* ── Postgres backend ──────────────────────────────────────────── */

interface InviteeRow {
  id: string;
  name: string;
  phone: string;
  tag: string;
  plus_one: boolean;
  created_at: Date;
  updated?: boolean;
}

interface CampaignRow {
  id: string;
  template_label: string;
  message: string;
  sent_at: Date;
  results: CampaignResult[];
}

function inviteeFromRow(row: InviteeRow): Invitee {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    tag: row.tag,
    plusOne: row.plus_one,
    createdAt: row.created_at.toISOString(),
  };
}

function campaignFromRow(row: CampaignRow): Campaign {
  return {
    id: row.id,
    templateLabel: row.template_label,
    message: row.message,
    sentAt: row.sent_at.toISOString(),
    results: row.results,
  };
}

async function dbListInvitees(): Promise<Invitee[]> {
  const sql = await db();
  const rows = await sql<InviteeRow[]>`
    select * from invitees order by name asc`;
  return rows.map(inviteeFromRow);
}

async function dbSaveInvitee(
  input: InviteeInput,
): Promise<{ invitee: Invitee; updated: boolean }> {
  const sql = await db();
  const [row] = await sql<InviteeRow[]>`
    insert into invitees (id, name, phone, tag, plus_one, created_at)
    values (
      ${randomUUID()}, ${input.name}, ${input.phone}, ${input.tag},
      ${input.plusOne}, now()
    )
    on conflict (phone)
    do update set
      name = excluded.name,
      tag = excluded.tag,
      plus_one = excluded.plus_one
    returning *, (xmax <> 0) as updated`;
  return { invitee: inviteeFromRow(row), updated: Boolean(row.updated) };
}

async function dbSetPlusOne(id: string, plusOne: boolean): Promise<boolean> {
  const sql = await db();
  try {
    const rows = await sql`
      update invitees set plus_one = ${plusOne}
      where id = ${id}::uuid returning id`;
    return rows.length > 0;
  } catch {
    return false; // not a valid uuid
  }
}

async function dbDeleteInvitee(id: string): Promise<boolean> {
  const sql = await db();
  try {
    const rows = await sql`
      delete from invitees where id = ${id}::uuid returning id`;
    return rows.length > 0;
  } catch {
    return false; // not a valid uuid
  }
}

async function dbListCampaigns(): Promise<Campaign[]> {
  const sql = await db();
  const rows = await sql<CampaignRow[]>`
    select * from campaigns order by sent_at desc`;
  return rows.map(campaignFromRow);
}

async function dbSaveCampaign(
  input: Omit<Campaign, "id" | "sentAt">,
): Promise<Campaign> {
  const sql = await db();
  const [row] = await sql<CampaignRow[]>`
    insert into campaigns (id, template_label, message, sent_at, results)
    values (
      ${randomUUID()}, ${input.templateLabel}, ${input.message}, now(),
      ${sql.json(input.results as unknown as Parameters<typeof sql.json>[0])}
    )
    returning *`;
  return campaignFromRow(row);
}

/* ── JSON-file backend (no DATABASE_URL) ───────────────────────── */

const INVITEES_FILE = path.join(process.cwd(), "data", "invitees.json");
const CAMPAIGNS_FILE = path.join(process.cwd(), "data", "campaigns.json");

let queue: Promise<unknown> = Promise.resolve();

function serialized<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readJson<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    // Corrupted file: fail loudly rather than silently overwriting the list.
    throw err;
  }
}

async function writeJson(file: string, rows: unknown[]): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
  await fs.rename(tmp, file);
}

function fileListInvitees(): Promise<Invitee[]> {
  return serialized(async () =>
    (await readJson<Invitee>(INVITEES_FILE)).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  );
}

function fileSaveInvitee(
  input: InviteeInput,
): Promise<{ invitee: Invitee; updated: boolean }> {
  return serialized(async () => {
    const invitees = await readJson<Invitee>(INVITEES_FILE);

    const existing = invitees.find((i) => i.phone === input.phone);
    if (existing) {
      existing.name = input.name;
      existing.tag = input.tag;
      existing.plusOne = input.plusOne;
      await writeJson(INVITEES_FILE, invitees);
      return { invitee: existing, updated: true };
    }

    const invitee: Invitee = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    invitees.push(invitee);
    await writeJson(INVITEES_FILE, invitees);
    return { invitee, updated: false };
  });
}

function fileSetPlusOne(id: string, plusOne: boolean): Promise<boolean> {
  return serialized(async () => {
    const invitees = await readJson<Invitee>(INVITEES_FILE);
    const invitee = invitees.find((i) => i.id === id);
    if (!invitee) return false;
    invitee.plusOne = plusOne;
    await writeJson(INVITEES_FILE, invitees);
    return true;
  });
}

function fileDeleteInvitee(id: string): Promise<boolean> {
  return serialized(async () => {
    const invitees = await readJson<Invitee>(INVITEES_FILE);
    const next = invitees.filter((i) => i.id !== id);
    if (next.length === invitees.length) return false;
    await writeJson(INVITEES_FILE, next);
    return true;
  });
}

function fileListCampaigns(): Promise<Campaign[]> {
  return serialized(async () =>
    (await readJson<Campaign>(CAMPAIGNS_FILE)).sort((a, b) =>
      b.sentAt.localeCompare(a.sentAt),
    ),
  );
}

function fileSaveCampaign(
  input: Omit<Campaign, "id" | "sentAt">,
): Promise<Campaign> {
  return serialized(async () => {
    const campaigns = await readJson<Campaign>(CAMPAIGNS_FILE);
    const campaign: Campaign = {
      ...input,
      id: randomUUID(),
      sentAt: new Date().toISOString(),
    };
    campaigns.push(campaign);
    await writeJson(CAMPAIGNS_FILE, campaigns);
    return campaign;
  });
}

/* ── Public API ────────────────────────────────────────────────── */

export function listInvitees(): Promise<Invitee[]> {
  return isDbConfigured() ? dbListInvitees() : fileListInvitees();
}

/** Insert, or update the entry that already has this number. */
export function saveInvitee(
  input: InviteeInput,
): Promise<{ invitee: Invitee; updated: boolean }> {
  return isDbConfigured() ? dbSaveInvitee(input) : fileSaveInvitee(input);
}

/** Flip whether an invitation covers a guest. */
export function setPlusOne(id: string, plusOne: boolean): Promise<boolean> {
  return isDbConfigured() ? dbSetPlusOne(id, plusOne) : fileSetPlusOne(id, plusOne);
}

export function deleteInvitee(id: string): Promise<boolean> {
  return isDbConfigured() ? dbDeleteInvitee(id) : fileDeleteInvitee(id);
}

const normalizeName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * How many seats a reply from this name may claim: 2 with a +1
 * (also the default for names not on the list), 1 without.
 */
export async function allowedPartySize(name: string): Promise<number> {
  const invitees = await listInvitees();
  const match = invitees.find(
    (i) => normalizeName(i.name) === normalizeName(name),
  );
  return (match?.plusOne ?? true) ? 2 : 1;
}

export function listCampaigns(): Promise<Campaign[]> {
  return isDbConfigured() ? dbListCampaigns() : fileListCampaigns();
}

export function saveCampaign(
  input: Omit<Campaign, "id" | "sentAt">,
): Promise<Campaign> {
  return isDbConfigured() ? dbSaveCampaign(input) : fileSaveCampaign(input);
}
