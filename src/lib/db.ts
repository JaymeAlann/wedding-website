import postgres from "postgres";

/*
 * Supabase Postgres connection, used by the stores whenever
 * DATABASE_URL is set; without it they fall back to their JSON files
 * (handy for local dev). Tables are created on first use, so there's
 * no separate migration step.
 */

type Sql = ReturnType<typeof postgres>;

let client: Sql | undefined;
let schemaReady: Promise<void> | undefined;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function sql(): Sql {
  client ??= postgres(process.env.DATABASE_URL!.trim(), {
    max: 5,
    // Supabase's transaction pooler (port 6543) doesn't support
    // prepared statements; disabling them works on direct
    // connections too.
    prepare: false,
    ssl: "require",
    // The schema bootstrap's `if not exists` statements emit chatty
    // "already exists, skipping" NOTICEs on every boot — drop them.
    onnotice: () => {},
  });
  return client;
}

/** The connection, with the schema guaranteed to exist. */
export async function db(): Promise<Sql> {
  schemaReady ??= ensureSchema();
  await schemaReady;
  return sql();
}

async function ensureSchema(): Promise<void> {
  const s = sql();
  await s`
    create table if not exists rsvps (
      id uuid primary key,
      name text not null,
      email text not null default '',
      attending boolean not null,
      party_size int not null default 0,
      guest_names text not null default '',
      dietary text not null default '',
      song text not null default '',
      message text not null default '',
      created_at timestamptz not null,
      updated_at timestamptz not null
    )`;
  // Replying again with the same name (case/whitespace-insensitive)
  // updates the earlier reply instead of duplicating it.
  await s`
    create unique index if not exists rsvps_normalized_name_idx
      on rsvps ((lower(regexp_replace(trim(name), '\\s+', ' ', 'g'))))`;
  await s`
    create table if not exists invitees (
      id uuid primary key,
      name text not null,
      phone text not null unique,
      tag text not null default 'Friends',
      plus_one boolean not null default true,
      created_at timestamptz not null
    )`;
  // For tables created before the +1 override existed.
  await s`
    alter table invitees add column if not exists plus_one boolean not null default true`;
  await s`
    create table if not exists campaigns (
      id uuid primary key,
      template_label text not null,
      message text not null,
      sent_at timestamptz not null,
      results jsonb not null
    )`;
}
