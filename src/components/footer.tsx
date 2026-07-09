import { logout } from "@/app/(site)/actions";
import { couple, dateShort } from "@/lib/config";
import { Flourish } from "./ornaments";

export function Footer({ isAdmin }: { isAdmin: boolean }) {
  return (
    <footer className="border-t border-gold/25 bg-parchment/70 px-4 py-14 text-center">
      <p className="font-script text-4xl text-gold-deep">Mischief managed.</p>
      <p className="mt-4 font-display text-sm uppercase tracking-[0.22em] text-ink">
        {couple.a} &amp; {couple.b} · {dateShort}
      </p>
      <Flourish className="mx-auto mt-6 w-44 text-gold/70" />

      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-base italic text-fern">
        <span>Made with love, and a little magic.</span>
        {isAdmin ? (
          <a
            href="/admin"
            className="underline decoration-gold/50 underline-offset-4 transition-colors hover:text-ink"
          >
            RSVP dashboard
          </a>
        ) : null}
        <form action={logout} className="inline">
          <button
            type="submit"
            className="cursor-pointer italic underline decoration-gold/50 underline-offset-4 transition-colors hover:text-ink"
          >
            Sign out
          </button>
        </form>
      </div>
    </footer>
  );
}
