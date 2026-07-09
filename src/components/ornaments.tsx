/* Decorative SVG flourishes shared across the site. All aria-hidden. */

export function Flourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M112 12h-42c-14 0-22-6-34-6-10 0-16 4-26 6" />
      <circle cx="7" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <g transform="translate(240 0) scale(-1 1)">
        <path d="M112 12h-42c-14 0-22-6-34-6-10 0-16 4-26 6" />
        <circle cx="7" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </g>
      <path d="M120 7.2l4.8 4.8-4.8 4.8-4.8-4.8z" />
    </svg>
  );
}

/**
 * Scrollwork for one corner of a parchment card. Drawn for the top-left;
 * rotate via className (e.g. "rotate-90" for top-right).
 */
export function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 52C4 20 20 4 52 4" />
      <path d="M4 42C4 18 18 4 42 4" />
      <path d="M52 4c2.6.5 3.6 3.3 1.8 4.8-1.9 1.5-4.6-.3-3.4-2.6" />
      <path d="M4 52c.5 2.6 3.3 3.6 4.8 1.8 1.5-1.9-.3-4.6-2.6-3.4" />
      <path d="M16.5 16.5l3.4 3.4-3.4 3.4-3.4-3.4z" />
    </svg>
  );
}

/** All four corners at once, inset inside a relatively-positioned card. */
export function CardCorners({ className }: { className?: string }) {
  const base = `pointer-events-none absolute h-9 w-9 sm:h-11 sm:w-11 ${className ?? "text-gold/70"}`;
  return (
    <>
      <CornerOrnament className={`${base} left-2.5 top-2.5`} />
      <CornerOrnament className={`${base} right-2.5 top-2.5 rotate-90`} />
      <CornerOrnament className={`${base} bottom-2.5 right-2.5 rotate-180`} />
      <CornerOrnament className={`${base} bottom-2.5 left-2.5 -rotate-90`} />
    </>
  );
}

function Foot({
  x,
  y,
  r,
  delay,
}: {
  x: number;
  y: number;
  r: number;
  delay: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${r})`}
      className="footstep"
      style={{ animationDelay: `${delay}s` }}
    >
      <ellipse cx="0" cy="-2.4" rx="2.1" ry="3.4" />
      <ellipse cx="0" cy="3.9" rx="1.5" ry="1.9" />
    </g>
  );
}

/**
 * A trail of wandering footprints, à la the Marauder's Map: each print
 * appears in walking order, lingers, then vanishes behind the walker.
 */
export function Footprints({ className }: { className?: string }) {
  const steps: Array<[number, number, number]> = [
    [14, 158, 14],
    [30, 146, 18],
    [24, 124, 26],
    [42, 112, 30],
    [38, 90, 38],
    [58, 80, 44],
    [56, 58, 52],
    [78, 50, 58],
    [80, 28, 66],
    [102, 22, 72],
  ];
  return (
    <svg
      viewBox="0 0 120 170"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {steps.map(([x, y, r], i) => (
        <Foot key={`${x}-${y}`} x={x} y={y} r={r} delay={i * 0.55} />
      ))}
    </svg>
  );
}
