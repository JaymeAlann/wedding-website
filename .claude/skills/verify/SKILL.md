---
name: verify
description: Build, launch, and drive this wedding site end-to-end over HTTP (login gate, RSVP action, admin, ICS/CSV routes).
---

# Verifying the wedding website

Server-rendered Next.js 16 app; every flow is drivable with curl — no browser needed.

## Build & launch

```bash
npm run build            # Turbopack + TS check
PORT=3111 npm start      # production server (run in background)
```

Passwords come from `.env.local` (`GUEST_PASSWORD`, `ADMIN_PASSWORD`; defaults `revelio` / `marauders1885`).

## Driving server actions with curl (the tricky part)

Forms are React server actions with progressive enhancement — POST **multipart** to the page URL with the hidden `$ACTION_*` fields scraped from the rendered HTML:

- `useActionState` forms (login, RSVP) carry `$ACTION_REF_n`, `$ACTION_n:0`, `$ACTION_n:1`, `$ACTION_KEY`. Extract with regex `name="(\$ACTION[^"]*)"(?: value="([^"]*)")?` from the *specific* form (login form contains `id="password"`; RSVP form contains `rsvp-name`), HTML-unescape the values, replay all of them plus the visible fields via `--form-string`.
- Plain action forms (logout in the footer) carry a single `$ACTION_ID_<hash>` field with no value.
- Skip empty lines when building `--form-string` args — an empty arg makes curl fail with "badly used".
- Success responses are `303 See Other` (redirect actions set `Set-Cookie: mm_session=…`); validation errors re-render `200` with the error text in the HTML.
- The server logs `Missing origin header` warnings for curl POSTs — test artifact (browsers always send Origin), not a bug. Silence with `-H "Origin: http://localhost:3111"`.

## Flows worth driving

1. `GET /` no cookie → 307 `/login`; garbage cookie → 307 `/login`.
2. Login wrong password → 200 with "Not quite the right charm"; correct → 303 + `mm_session` cookie (guest role → `/`, admin → `/admin`).
3. `GET /` with cookie → all sections present (grep "Our Story", "Wands at the ready", …).
4. RSVP submit with cookie → check `data/rsvps.json`; same-name resubmit must UPDATE, not duplicate; empty name → "seating chart insists" error.
5. Guest cookie on `/admin` or `/admin/export.csv` → 307 `/`; admin cookie → 200 dashboard / CSV with BOM.
6. `GET /calendar.ics` with cookie → VCALENDAR with `DTSTART;TZID=`.
7. Logout POST → 303 + cookie expired to 1970.

Clean up after: `rm -f data/rsvps.json` and kill the server (`kill $(lsof -ti :3111)`).
