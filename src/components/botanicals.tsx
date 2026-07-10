"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";
import { LEAF_D } from "./ornaments";

/*
 * The site's one botanical divider motif: a small wildflower at the
 * center of a section border with two leafy stems growing outward
 * along it. When it scrolls into view the stems draw themselves in,
 * leaves unfurl in walking order, and the flower blooms last — the
 * growth is pure CSS keyed off the .is-grown class (see globals.css);
 * this component only observes visibility. Stems use pathLength={1}
 * so the dash math is the same for every path. Everything inherits
 * one currentColor, like the rest of the line-art ornaments.
 */

/** Staggers one part of the plant along the growth timeline. */
function grownAt(delay: number): CSSProperties {
  return { "--grow-delay": `${delay}s` } as CSSProperties;
}

/** Adds .is-grown the first time the element scrolls into view. */
function useGrowOnView(ref: RefObject<SVGSVGElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-grown");
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

function Leaf({
  x,
  y,
  rotate = 0,
  size = 1,
  flip = false,
  delay,
}: {
  x: number;
  y: number;
  rotate?: number;
  size?: number;
  flip?: boolean;
  delay: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${
        flip ? -size : size
      } ${size})`}
    >
      <path className="botanical-leaf" style={grownAt(delay)} d={LEAF_D} />
    </g>
  );
}

function Berry({
  x,
  y,
  r = 1.5,
  delay,
}: {
  x: number;
  y: number;
  r?: number;
  delay: number;
}) {
  return (
    <circle
      className="botanical-leaf"
      style={grownAt(delay)}
      cx={x}
      cy={y}
      r={r}
    />
  );
}

/** One leafy stem, growing rightward from the center at (120, 20). */
function HalfSpray() {
  return (
    <>
      <path
        className="botanical-stem"
        pathLength={1}
        d="M120 20C136 16 150 26 166 21C182 16 196 24 212 17C219 14 225 12 230 9"
      />
      <Leaf x={132} y={19} rotate={-25} size={0.8} delay={0.5} />
      <Leaf x={166} y={21} rotate={126} size={0.7} delay={0.75} />
      <Leaf x={189} y={19.7} rotate={-30} size={0.8} delay={1} />
      <Leaf x={221.7} y={13} rotate={-45} size={0.6} delay={1.2} />
      <Berry x={154.3} y={22.6} delay={0.9} />
      <Berry x={200.3} y={20.3} r={1.3} delay={1.3} />
    </>
  );
}

/**
 * Center it on a section's border line (`left-1/2 top-0 -translate-x-1/2
 * -translate-y-1/2` inside a relative section) with a width and a text
 * color; the whole motif draws in currentColor.
 */
export function BotanicalDivider({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useGrowOnView(ref);

  return (
    <svg
      ref={ref}
      viewBox="0 0 240 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`botanical pointer-events-none ${className ?? ""}`}
    >
      <HalfSpray />
      <g transform="translate(240 0) scale(-1 1)">
        <HalfSpray />
      </g>
      {/* The wildflower blooms at the center once both stems have grown. */}
      <Berry x={120} y={20} r={1.8} delay={1.45} />
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k} transform={`translate(120 20) rotate(${k * 72})`}>
          <path
            className="botanical-petal"
            style={grownAt(1.5 + k * 0.1)}
            d="M0-2.2C2.6-4.8 3-9 0-11.5C-3-9-2.6-4.8 0-2.2Z"
          />
        </g>
      ))}
    </svg>
  );
}

/*
 * ── One-line botanicals ──────────────────────────────────────────
 * Larger statement pieces in the style of continuous single-line
 * ink drawings with a soft watercolor blob behind them. The whole
 * plant is one unbroken stroke, so the draw-in animation literally
 * sketches it as it scrolls into view; the wash blooms in afterward.
 * Washes stay inside the site palette (blush/gold/parchment vars).
 */

/** An irregular watercolor blob, centered on its own origin. */
const BLOB_D =
  "M0-30C20-34 36-20 34 2C32 22 12 32 -10 28C-28 24 -36 6 -30-12C-25-25 -14-28 0-30Z";

interface Wash {
  x: number;
  y: number;
  scale: number;
  /** CSS color — use the site's palette variables. */
  fill: string;
  opacity: number;
  delay: number;
}

interface LineArt {
  viewBox: string;
  washes: Wash[];
  /** Continuous strokes; each draws in over `duration` seconds. */
  strokes: Array<{ d: string; duration: number; delay: number }>;
}

const LINE_ART: Record<
  "eucalyptus" | "poppy" | "rose" | "rosemary" | "leafy" | "tulip",
  LineArt
> = {
  /** A seeded eucalyptus spray: round leaf loops up a swaying stem. */
  eucalyptus: {
    viewBox: "0 0 120 210",
    washes: [
      {
        x: 80,
        y: 112,
        scale: 1.05,
        fill: "var(--color-gold)",
        opacity: 0.24,
        delay: 2.2,
      },
      {
        x: 66,
        y: 130,
        scale: 0.85,
        fill: "var(--color-blush-deep)",
        opacity: 0.3,
        delay: 2.5,
      },
    ],
    strokes: [
      {
        d: "M60 206C55 196 53 188 54 178c12 2 19-8 14-16c-6-9-17-4-15 6c-2-11-1-16 1-24c-12 2-19-8-14-16c6-9 17-4 15 6c2-11 3-15 5-22c11 2 17-7 13-14c-5-8-15-4-14 5c0-10 2-14 4-20c-10 2-16-6-12-13c5-8 15-4 13 4c2-10 3-13 4-18c9 2 14-5 11-11c-4-7-13-3-11 4c0-9 1-12 2-16c-8 1-13-5-10-10c4-6 11-3 9 3c1-8 2-10 3-13c6 1 10-3 8-8c-3-5-9-2-8 2c1-6 2-9 4-12",
        duration: 3,
        delay: 0,
      },
    ],
  },

  /** A poppy: looped petals flowing into a stem with slender leaves. */
  poppy: {
    viewBox: "0 0 170 200",
    washes: [
      {
        x: 66,
        y: 46,
        scale: 1.1,
        fill: "var(--color-gold)",
        opacity: 0.22,
        delay: 2.2,
      },
      {
        x: 54,
        y: 56,
        scale: 0.8,
        fill: "var(--color-blush-deep)",
        opacity: 0.28,
        delay: 2.5,
      },
    ],
    strokes: [
      {
        d: "M64 58C44 64 30 46 44 32C56 20 74 22 74 38C76 22 94 20 102 32C110 44 100 58 86 56C96 60 96 74 84 76C72 78 62 70 64 58C66 52 70 50 72 46C68 72 78 86 84 98C92 112 100 124 105 138c10-4 19-13 22-22c-9 6-17 13-21 19C110 148 113 158 114 168c-11 2-20 9-24 17c10-4 19-10 23-14C115 182 116 190 116 198",
        duration: 3,
        delay: 0,
      },
    ],
  },

  /** A rose: petal loops fanned from a seam, one leaf on the stem. */
  rose: {
    viewBox: "0 0 140 210",
    washes: [
      {
        x: 72,
        y: 50,
        scale: 1.15,
        fill: "var(--color-blush-deep)",
        opacity: 0.34,
        delay: 2.2,
      },
      {
        x: 94,
        y: 152,
        scale: 0.55,
        fill: "var(--color-blush-deep)",
        opacity: 0.22,
        delay: 2.6,
      },
    ],
    strokes: [
      {
        d: "M74 205C71 190 76 178 72 164c-13 2-20-8-14-16c6-8 17-3 15 7c0-11-2-16-3-25C68 118 66 100 66 84C66 80 66 76 66 72C42 72 32 52 46 38C58 26 76 30 78 44C79 53 73 62 66 68C80 71 96 62 94 46C92 30 72 24 60 36C53 43 53 52 58 58C65 63 74 58 72 48C70 39 59 39 56 47C54 53 58 57 63 57",
        duration: 3,
        delay: 0,
      },
    ],
  },

  /** A rosemary sprig: needle pairs along a rising diagonal stem. */
  rosemary: {
    viewBox: "0 0 140 190",
    washes: [],
    strokes: [
      {
        d: "M24 184C28 178 32 172 36 166c-8-1-14-6-17-12c6 2 12 6 16 9C38 160 41 155 44 150c-9-2-16-8-19-15c7 2 14 7 18 11C46 142 50 134 54 126c10 1 18-3 23-10c-8 1-16 4-21 7c8-1 14-5 17-11c-6 1-12 4-16 8C58 118 62 110 66 102c-9-3-15-9-17-16c6 3 12 8 15 13C68 96 72 88 76 80c10 0 18-5 22-12c-8 2-15 5-20 9C80 72 84 64 88 56c-8-3-13-9-15-15c5 3 11 8 13 12c7 0 13-3 16-9c-6 1-11 4-14 7C92 50 96 42 100 36c9 0 16-5 19-11c-7 2-13 5-17 8C104 30 108 24 112 18",
        duration: 2.6,
        delay: 0,
      },
    ],
  },

  /** A leafy branch: lance leaves alternating up a straight stem. */
  leafy: {
    viewBox: "0 0 150 200",
    washes: [],
    strokes: [
      {
        d: "M76 196C74 184 75 174 75 164c14-1 25-10 28-22c-13 3-23 12-27 18C75 152 74 142 74 132c-14-2-25-11-28-23c13 3 23 12 27 19C74 120 74 110 75 100c13-1 23-10 26-21c-12 3-21 11-25 17C75 88 75 78 76 68c-13-2-22-10-25-21c12 3 21 11 24 17C76 58 76 48 77 40c11-1 19-8 22-18c-10 3-18 10-21 14C77 30 77 22 78 14",
        duration: 2.6,
        delay: 0,
      },
    ],
  },

  /** A tulip: pointed three-petal cup on a stem with two long leaves. */
  tulip: {
    viewBox: "0 0 120 200",
    washes: [
      {
        x: 66,
        y: 46,
        scale: 1,
        fill: "var(--color-blush-deep)",
        opacity: 0.3,
        delay: 2.2,
      },
    ],
    strokes: [
      {
        d: "M60 74C50 73 43 66 44 56C42 46 43 38 47 31C53 36 57 42 59 48C61 40 64 33 68 29C72 34 75 40 76 46C79 39 83 34 88 32C90 42 89 54 84 64C77 72 68 75 60 74C59 96 58 116 58 134c-14 4-24 16-26 32c12-8 20-18 24-26C57 152 58 164 59 178c13 3 22 12 25 26c-11-7-19-15-23-22C60 190 60 194 60 198",
        duration: 2.8,
        delay: 0,
      },
    ],
  },
};

export type LineBotanicalKind = keyof typeof LINE_ART;

/**
 * A hand-drawn one-line botanical with a watercolor wash. Position it
 * against something structural (a page corner, behind a card or photo
 * frame, the end of a timeline) with a width and a line color — e.g.
 * `text-ink/70`; the washes color themselves from the palette.
 */
export function LineBotanical({
  kind,
  className,
}: {
  kind: LineBotanicalKind;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  useGrowOnView(ref);

  const { viewBox, washes, strokes } = LINE_ART[kind];
  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`botanical pointer-events-none ${className ?? ""}`}
    >
      {washes.map((w, i) => (
        <g key={i} transform={`translate(${w.x} ${w.y}) scale(${w.scale})`}>
          <path
            className="botanical-wash"
            style={
              {
                ...grownAt(w.delay),
                "--wash-opacity": w.opacity,
                fill: w.fill,
              } as CSSProperties
            }
            stroke="none"
            d={BLOB_D}
          />
        </g>
      ))}
      {strokes.map((s, i) => (
        <path
          key={i}
          className="botanical-stem"
          pathLength={1}
          style={{ ...grownAt(s.delay), transitionDuration: `${s.duration}s` }}
          d={s.d}
        />
      ))}
    </svg>
  );
}
