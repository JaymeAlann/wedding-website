"use client";

/*
 * Post-submit celebration: the reply letter drops into a parchment
 * envelope, the flap closes under a wax seal, and an owl swoops in and
 * carries it off — then the thank-you fades in. Pure CSS timeline; the
 * classes and delays live in globals.css next to the keyframes.
 */

function MailScene() {
  return (
    <svg
      viewBox="0 0 176 150"
      className="w-44"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* the letter — painted first so it slides in behind the envelope */}
      <g className="sendoff-letter">
        <rect x="40" y="6" width="96" height="76" rx="2" className="fill-cream" />
        <path d="M52 24h72M52 36h72M52 48h48" className="stroke-moss/70" />
        <path d="M52 64q8-7 16 0t16 0" className="stroke-gold-deep" />
      </g>

      {/* envelope body */}
      <rect x="18" y="66" width="140" height="72" rx="3" className="fill-parchment-deep" />
      <path d="M18 138l52-36M158 138l-52-36" className="stroke-current/60" />

      {/* flap starts folded open (scaleY(-1)) and closes over the letter */}
      <polygon points="18,66 158,66 88,124" className="sendoff-flap fill-parchment" />

      {/* wax seal */}
      <circle cx="88" cy="96" r="10" className="sendoff-seal fill-gold stroke-gold-deep" />
    </svg>
  );
}

function Owl() {
  return (
    <svg
      viewBox="0 0 132 96"
      className="w-24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <g className="sendoff-wing sendoff-wing-left">
        <path
          d="M50 46C36 28 18 22 4 28c8 14 24 26 46 32z"
          className="fill-cream"
        />
      </g>
      <g className="sendoff-wing sendoff-wing-right">
        <path
          d="M82 46c14-18 32-24 46-18-8 14-24 26-46 32z"
          className="fill-cream"
        />
      </g>
      <ellipse cx="66" cy="58" rx="17" ry="22" className="fill-cream" />
      <path d="M60 80l6 12 6-12" />
      <circle cx="66" cy="30" r="16" className="fill-cream" />
      <path d="M54 18l-4-10M78 18l4-10" />
      <circle cx="60" cy="28" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="72" cy="28" r="1.6" fill="currentColor" stroke="none" />
      <path d="M66 33l-3.5 5h7z" className="fill-gold" />
    </svg>
  );
}

export function OwlSendoff({
  name,
  attending,
  updated,
  onEdit,
}: {
  name: string;
  attending: boolean;
  updated: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="px-2 py-4 text-center" role="status">
      <div
        aria-hidden="true"
        className="relative mx-auto h-56 w-full overflow-hidden text-ink/70"
      >
        <div className="absolute left-1/2 top-14 -translate-x-1/2">
          <div className="sendoff-mail">
            <MailScene />
          </div>
        </div>
        <div className="absolute left-1/2 top-2 -translate-x-1/2">
          <div className="sendoff-owl">
            <Owl />
          </div>
        </div>
      </div>

      <div className="sendoff-text">
        <p className="font-script text-4xl text-gold-deep">Mischief managed!</p>
        <p className="mt-3 text-balance italic text-ink-soft">
          {`Thank you for RSVPing, ${name} — ${
            attending
              ? "your owl is on its way, and we can't wait to celebrate with you."
              : "you'll be missed dearly; we'll raise a glass in your honor."
          }${updated ? " (We've updated your earlier reply.)" : ""}`}
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="mt-6 cursor-pointer font-display text-xs uppercase tracking-[0.2em] text-fern underline underline-offset-4 transition-colors hover:text-ink"
        >
          Change your reply
        </button>
      </div>
    </div>
  );
}
