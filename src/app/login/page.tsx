import type { Metadata } from "next";
import { couple, dateShort, wedding } from "@/lib/config";
import { CardCorners, Flourish } from "@/components/ornaments";
import { WanderingFeet } from "@/components/wandering-feet";
import { walkerNames } from "@/lib/walkers";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Welcome" };

// The map's walkers grow with the RSVP list, so render fresh.
export const dynamic = "force-dynamic";

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
