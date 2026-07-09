import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

/*
 * File-backed guest-list store: data/invitees.json for the people we
 * plan to invite (name + mobile number), data/campaigns.json for a log
 * of every text-message campaign sent through Twilio. Same atomic
 * write + promise-queue scheme as rsvp-store.
 */

export interface Invitee {
  id: string;
  name: string;
  /** E.164, e.g. +14045551234 — normalized before saving. */
  phone: string;
  /** Free-form group label, e.g. "Friends", "Family". */
  tag: string;
  createdAt: string;
}

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

export function listInvitees(): Promise<Invitee[]> {
  return serialized(async () =>
    (await readJson<Invitee>(INVITEES_FILE)).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  );
}

/** Insert, or update the entry that already has this number. */
export function saveInvitee(input: {
  name: string;
  phone: string;
  tag: string;
}): Promise<{ invitee: Invitee; updated: boolean }> {
  return serialized(async () => {
    const invitees = await readJson<Invitee>(INVITEES_FILE);

    const existing = invitees.find((i) => i.phone === input.phone);
    if (existing) {
      existing.name = input.name;
      existing.tag = input.tag;
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

export function deleteInvitee(id: string): Promise<boolean> {
  return serialized(async () => {
    const invitees = await readJson<Invitee>(INVITEES_FILE);
    const next = invitees.filter((i) => i.id !== id);
    if (next.length === invitees.length) return false;
    await writeJson(INVITEES_FILE, next);
    return true;
  });
}

export function listCampaigns(): Promise<Campaign[]> {
  return serialized(async () =>
    (await readJson<Campaign>(CAMPAIGNS_FILE)).sort((a, b) =>
      b.sentAt.localeCompare(a.sentAt),
    ),
  );
}

export function saveCampaign(
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
