import type { Metadata } from "next";
import { couple, dateShort, wedding } from "@/lib/config";
import { CardCorners, Flourish } from "@/components/ornaments";
import { WanderingFeet } from "@/components/wandering-feet";
import { listRsvps } from "@/lib/rsvp-store";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Welcome" };

// The map's walkers grow with the RSVP list, so render fresh.
export const dynamic = "force-dynamic";

/** The couple, plus everyone who has RSVP'd yes — the map's walkers. */
async function walkerNames(): Promise<string[]> {
  const walkers: string[] = [couple.a, couple.b];
  try {
    const rsvps = await listRsvps();
    for (const rsvp of rsvps) {
      if (rsvp.attending) walkers.push(rsvp.name);
    }
  } catch {
    // The gate must open even if the database is unreachable.
  }
  const seen = new Set<string>();
  return walkers.filter((name) => {
    const key = name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const walkers = await walkerNames();

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16">
      <WanderingFeet count={Math.min(walkers.length, 8)} names={walkers} />

      <div className="relative w-full max-w-md bg-parchment/90 shadow-lifted ornate-frame">
        <CardCorners />
        <div className="px-7 py-12 text-center sm:px-12">
          <p className="font-script text-4xl leading-tight text-gold-deep">
            I solemnly swear
          </p>
          <h1 className="mt-2 font-display text-lg uppercase tracking-[0.22em] text-ink">
            that I am up to no good
          </h1>

          <Flourish className="mx-auto mt-5 w-44 text-gold" />

          <p className="mt-5 text-balance italic text-ink-soft">
            Give the password, and the wedding of {couple.a}&nbsp;&amp;&nbsp;
            {couple.b} — {dateShort}, {wedding.city} — shall reveal itself.
          </p>

          <LoginForm from={from} />

          <p className="mt-7 text-base italic text-fern">
            Lost the password? Owl the couple — or check the back of your
            invitation.
          </p>
        </div>
      </div>
    </main>
  );
}
