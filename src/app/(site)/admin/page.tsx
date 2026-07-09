import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { Icon, type IconName } from "@/components/icons";
import { Flourish } from "@/components/ornaments";
import { wedding } from "@/lib/config";
import { listRsvps } from "@/lib/rsvp-store";
import { DeleteRsvpButton } from "./delete-button";
import { AdminTabs } from "./tabs";

export const metadata: Metadata = { title: "RSVP Dashboard" };

// Replies live on disk, so always render fresh.
export const dynamic = "force-dynamic";

const receivedAt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: wedding.timeZone,
});

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: IconName;
}) {
  return (
    <div className="border border-gold/30 bg-white/50 px-5 py-5 shadow-soft">
      <div className="flex items-center gap-2 text-gold-ink">
        <Icon name={icon} className="h-4 w-4" />
        <span className="font-display text-[0.7rem] uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <div className="mt-2 font-serif text-4xl font-semibold text-ink">
        {value}
      </div>
    </div>
  );
}

export default async function AdminPage() {
  await requireAdmin();
  const rsvps = await listRsvps();

  const accepted = rsvps.filter((r) => r.attending);
  const declined = rsvps.filter((r) => !r.attending);
  const headcount = accepted.reduce((sum, r) => sum + r.partySize, 0);
  const dietaryCount = accepted.filter((r) => r.dietary).length;
  const songs = rsvps.filter((r) => r.song);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-28 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-script text-3xl text-gold-deep">
            The Marauder&rsquo;s Ledger
          </p>
          <h1 className="mt-1 font-display text-2xl uppercase tracking-[0.16em] text-ink">
            RSVP Dashboard
          </h1>
        </div>
        {rsvps.length > 0 ? (
          <a
            href="/admin/export.csv"
            download
            className="flex items-center gap-2 border border-gold-deep px-5 py-2.5 font-display text-xs uppercase tracking-[0.2em] text-gold-ink transition-colors hover:bg-gold-deep hover:text-cream"
          >
            <Icon name="download" className="h-4 w-4" />
            Export CSV
          </a>
        ) : null}
      </div>

      <Flourish className="mt-6 w-52 text-gold" />
      <AdminTabs active="/admin" />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Replies" value={rsvps.length} icon="owl" />
        <StatTile label="Seats attending" value={headcount} icon="users" />
        <StatTile label="Regrets" value={declined.length} icon="quill" />
        <StatTile label="Dietary notes" value={dietaryCount} icon="feast" />
      </div>

      {rsvps.length === 0 ? (
        <div className="mt-10 flex flex-col items-center border border-gold/30 bg-white/50 px-6 py-16 text-center shadow-soft">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-cream text-gold-ink">
            <Icon name="owl" className="h-9 w-9" />
          </div>
          <p className="mt-5 font-serif text-2xl italic text-ink">
            No owls yet.
          </p>
          <p className="mt-2 max-w-md text-ink-soft">
            Replies land here the moment a guest sends the RSVP form — no
            refresh rituals required.
          </p>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto border border-gold/30 bg-white/60 shadow-soft">
          <table className="w-full min-w-[56rem] text-left text-base">
            <thead className="border-b border-gold/30 bg-parchment/70">
              <tr>
                {["Guest", "Reply", "Seats", "Dietary", "Song", "Note", "Received", ""].map(
                  (heading, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 font-display text-[0.7rem] font-medium uppercase tracking-[0.16em] text-gold-ink"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15">
              {rsvps.map((rsvp) => (
                <tr key={rsvp.id} className="align-top">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-ink">{rsvp.name}</div>
                    {rsvp.email ? (
                      <div className="text-sm text-fern">{rsvp.email}</div>
                    ) : null}
                    {rsvp.guestNames ? (
                      <div className="text-sm italic text-fern">
                        with {rsvp.guestNames}
                      </div>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {rsvp.attending ? (
                      <span className="inline-flex items-center gap-1.5 border border-sage/60 bg-sage/15 px-2.5 py-1 text-sm text-fern">
                        <Icon name="check" className="h-3.5 w-3.5" />
                        Accepts
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 border border-blush-deep bg-blush px-2.5 py-1 text-sm text-ink/70">
                        <Icon name="close" className="h-3.5 w-3.5" />
                        Declines
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-ink">
                    {rsvp.attending ? rsvp.partySize : "—"}
                  </td>
                  <td className="max-w-52 px-4 py-3.5 text-ink-soft">
                    <div className="line-clamp-2" title={rsvp.dietary || undefined}>
                      {rsvp.dietary || "—"}
                    </div>
                  </td>
                  <td className="max-w-52 px-4 py-3.5 text-ink-soft">
                    <div className="line-clamp-2" title={rsvp.song || undefined}>
                      {rsvp.song || "—"}
                    </div>
                  </td>
                  <td className="max-w-64 px-4 py-3.5 italic text-ink-soft">
                    <div className="line-clamp-3" title={rsvp.message || undefined}>
                      {rsvp.message || "—"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-sm text-fern">
                    {receivedAt.format(new Date(rsvp.createdAt))}
                    {rsvp.updatedAt !== rsvp.createdAt ? (
                      <span className="block text-moss">
                        edited {receivedAt.format(new Date(rsvp.updatedAt))}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-3.5">
                    <DeleteRsvpButton id={rsvp.id} name={rsvp.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {songs.length > 0 ? (
        <div className="mt-8 border border-gold/30 bg-white/50 p-7 shadow-soft">
          <h2 className="flex items-center gap-2.5 font-display text-sm uppercase tracking-[0.18em] text-gold-ink">
            <Icon name="music" className="h-4.5 w-4.5" />
            The request line
          </h2>
          <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {songs.map((rsvp) => (
              <li key={rsvp.id} className="text-ink-soft">
                <span className="italic">&ldquo;{rsvp.song}&rdquo;</span>
                <span className="text-fern"> — {rsvp.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </main>
  );
}
