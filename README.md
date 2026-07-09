# James & Hannah — Wedding Website

A password-gated wedding site with a light Marauder's Map theme: parchment,
gold, and green ink. Built with Next.js 16 (App Router), React 19, and
Tailwind CSS v4.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll land on the gate. Passwords (set in
`.env.local`):

- **Guests:** `revelio` → the main site
- **Admins:** `marauders1885` → same site plus the `/admin` RSVP dashboard

## Make it yours

1. **`src/lib/config.ts`** — the single source of truth for all content:
   names, date, venue, schedule, story timeline, travel notes, registry
   links, and FAQs (venue/story/registry entries are still placeholders).
2. **`.env.local`** — set your own `GUEST_PASSWORD`, `ADMIN_PASSWORD`, and
   `SESSION_SECRET` (`openssl rand -hex 32`) before sharing the link.
3. **Palette & type** — design tokens live in the `@theme` block of
   `src/app/globals.css` (fonts are wired up in `src/app/layout.tsx`).
4. **Photos** — drop images into `public/photos/` and drop them into the
   page wherever you like (`next/image` is available). The hero currently
   uses an illustrated castle so the site looks finished without photos.
   Note: files in `public/` are served **without** the password gate.

## How it works

- **Auth** — the gate sets an HMAC-signed, httpOnly session cookie
  (`src/lib/session.ts`). `src/proxy.ts` redirects anonymous visitors to
  `/login`; pages and server actions re-verify with `src/lib/auth.ts`.
  Guests and admins are just two passwords mapped to two roles.
- **RSVPs** — stored in `data/rsvps.json` via `src/lib/rsvp-store.ts`
  (atomic, serialized writes — plenty for guest-list traffic). Replying
  again with the same name updates the earlier reply. `/admin` shows
  stats, the full table, song requests, and a CSV export.
- **Calendar** — `/calendar.ics` serves a proper invite with the venue's
  time zone.
- **Privacy** — every page sends `noindex`, and the whole site sits behind
  the gate.

## Deploying

The RSVP store writes to local disk, so deploy somewhere with a persistent
filesystem (a VPS, Railway, Fly.io, render.com disk, etc.):

```bash
npm run build
npm start
```

Set `GUEST_PASSWORD`, `ADMIN_PASSWORD`, and `SESSION_SECRET` in the host's
environment. On serverless platforms (Vercel and friends) the filesystem is
ephemeral — swap `src/lib/rsvp-store.ts` for a hosted store (Vercel KV,
Postgres, Supabase…); it's the only file that touches disk.

## Layout

```
src/
├── proxy.ts                  # session gate for every route
├── lib/
│   ├── config.ts             # ← all wedding content
│   ├── session.ts            # signed-cookie tokens (Web Crypto)
│   ├── auth.ts               # passwords, require{Session,Admin}
│   └── rsvp-store.ts         # JSON-file RSVP store
├── components/               # nav, hero castle, countdown, RSVP form…
└── app/
    ├── login/                # the "I solemnly swear" gate
    └── (site)/               # everything behind the gate
        ├── page.tsx          # hero, story, schedule, travel, RSVP, registry, FAQ
        ├── calendar.ics/     # add-to-calendar route
        └── admin/            # dashboard + CSV export
```
