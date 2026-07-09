# Hannah & James — Wedding Website

A password-gated wedding site with a light Marauder's Map theme: parchment,
gold, and green ink. Built with Next.js 16 (App Router), React 19, and
Tailwind CSS v4.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll land on the gate. Both passwords are
set in `.env.local` (copy `.env.example` to get started; they are never
hardcoded in the source):

- **`GUEST_PASSWORD`** → the main site
- **`ADMIN_PASSWORD`** → same site plus `/admin` (RSVP dashboard and SMS
  invitations)

## Make it yours

1. **`src/lib/config.ts`** — the single source of truth for all content:
   names, date, venue, schedule, story timeline, travel notes, registry
   links, FAQs, and the photo manifest (registry links are still TBD).
2. **`.env.local`** — set `GUEST_PASSWORD`, `ADMIN_PASSWORD`, and
   `SESSION_SECRET` (`openssl rand -hex 32`) before sharing the link, plus
   the Twilio variables if you use SMS invitations (see `.env.example`).
3. **Palette & type** — design tokens live in the `@theme` block of
   `src/app/globals.css` (fonts are wired up in `src/app/layout.tsx`).
4. **Photos** — engagement photos live in `public/photos/` and are listed
   in `config.ts`. Note: files in `public/` are served **without** the
   password gate.

## How it works

- **Auth** — the gate sets an HMAC-signed, httpOnly session cookie
  (`src/lib/session.ts`). `src/proxy.ts` redirects anonymous visitors to
  `/login`; pages and server actions re-verify with `src/lib/auth.ts`.
  Guests and admins are just two passwords mapped to two roles.
- **RSVPs** — stored in Supabase Postgres when `DATABASE_URL` is set
  (tables auto-create on first use), or in `data/rsvps.json` without it
  (`src/lib/rsvp-store.ts`). Replying again with the same name updates
  the earlier reply. `/admin` shows stats, the full table, song
  requests, and a CSV export.
- **SMS invitations** — `/admin/invites` keeps a guest list and sends
  templated, personalized texts through Twilio (`src/lib/twilio.ts`);
  every campaign is logged with per-recipient results. Same storage
  rule: Postgres with `DATABASE_URL`, JSON files in `data/` without.
  Sending stays disabled until the Twilio env vars are set.
- **Calendar** — `/calendar.ics` serves a proper invite with the venue's
  time zone.
- **Privacy** — every page sends `noindex`, and the whole site sits behind
  the gate.

## Deploying

```bash
npm run build
npm start
```

Set `GUEST_PASSWORD`, `ADMIN_PASSWORD`, `SESSION_SECRET`, and
`DATABASE_URL` (plus the Twilio variables and `SITE_URL` for SMS
invitations) in the host's environment. With `DATABASE_URL` pointing at
Supabase, nothing touches local disk, so serverless hosts (Vercel and
friends) work fine — use Supabase's pooled connection string (port 6543)
there. Without `DATABASE_URL`, the stores write JSON files to `data/`,
which needs a persistent filesystem (a VPS, Railway, Fly.io, render.com
disk, etc.).

## Layout

```
src/
├── proxy.ts                  # session gate for every route
├── lib/
│   ├── config.ts             # ← all wedding content
│   ├── session.ts            # signed-cookie tokens (Web Crypto)
│   ├── auth.ts               # passwords, require{Session,Admin}
│   ├── db.ts                 # Supabase Postgres client + schema
│   ├── rsvp-store.ts         # RSVP store (Postgres or JSON file)
│   ├── invitee-store.ts      # guest list + SMS campaign log
│   ├── sms-templates.ts      # save-the-date / invitation / reminder texts
│   └── twilio.ts             # thin Twilio REST client
├── components/               # nav, wandering footprints, countdown, RSVP form…
└── app/
    ├── login/                # the "I solemnly swear" gate
    └── (site)/               # everything behind the gate
        ├── page.tsx          # hero, story, photos, schedule, travel, RSVP, registry, FAQ
        ├── calendar.ics/     # add-to-calendar route
        └── admin/            # RSVP dashboard + CSV export + SMS invitations
```
