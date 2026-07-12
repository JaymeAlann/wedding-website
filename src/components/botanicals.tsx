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
  /** Small filled details such as berry clusters and flower centers. */
  marks?: Array<{ cx: number; cy: number; r: number; delay: number }>;
}

const LINE_ART: Record<
  | "eucalyptus"
  | "poppy"
  | "rose"
  | "rosemary"
  | "leafy"
  | "tulip"
  | "cosmos"
  | "carnation"
  | "berrySpray"
  | "lavender"
  | "iris"
  | "anemone"
  | "gardenBunch"
  | "poppyPair",
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

  /** A loose garden cosmos with airy petals and forked, feathery leaves. */
  cosmos: {
    viewBox: "0 0 150 220",
    washes: [
      {
        x: 78,
        y: 54,
        scale: 1.08,
        fill: "var(--color-blush-deep)",
        opacity: 0.3,
        delay: 2.15,
      },
      {
        x: 61,
        y: 68,
        scale: 0.58,
        fill: "var(--color-gold)",
        opacity: 0.2,
        delay: 2.45,
      },
    ],
    strokes: [
      {
        d: "M76 216C74 194 76 171 74 148C72 123 70 98 73 72",
        duration: 2.3,
        delay: 0,
      },
      {
        d: "M74 157C62 148 51 144 39 145M58 149C53 139 45 132 36 128M48 140C42 142 35 141 29 138M74 130C85 121 95 117 106 118M91 122C96 111 104 104 114 100M100 112C108 113 115 110 120 106",
        duration: 1.65,
        delay: 0.55,
      },
      {
        d: "M73 72C56 76 43 66 46 54C49 44 59 41 68 47C62 37 68 27 78 29C87 30 91 39 87 48C94 40 106 41 110 50C114 59 107 68 97 69C105 76 101 87 91 89C81 91 74 84 74 75C70 85 58 87 52 79C47 72 52 64 61 62C52 59 50 49 57 43C65 37 74 42 77 50",
        duration: 2.2,
        delay: 1.05,
      },
    ],
    marks: [{ cx: 77, cy: 61, r: 3.2, delay: 1.9 }],
  },

  /** A softly ruffled carnation, inspired by pressed invitation florals. */
  carnation: {
    viewBox: "0 0 150 220",
    washes: [
      {
        x: 74,
        y: 55,
        scale: 1.16,
        fill: "var(--color-blush-deep)",
        opacity: 0.28,
        delay: 2.35,
      },
      {
        x: 58,
        y: 72,
        scale: 0.62,
        fill: "var(--color-parchment-deep)",
        opacity: 0.42,
        delay: 2.6,
      },
    ],
    strokes: [
      {
        d: "M72 216C70 192 71 170 68 149C66 128 69 104 72 82",
        duration: 2.35,
        delay: 0,
      },
      {
        d: "M69 156C56 154 45 147 38 137C51 137 61 142 69 151M68 128C80 123 91 113 96 102C83 105 74 113 68 123",
        duration: 1.7,
        delay: 0.55,
      },
      {
        d: "M72 83C62 86 53 81 53 72C43 72 38 63 43 56C36 49 41 39 50 39C49 29 59 24 67 30C72 20 84 21 88 30C98 25 107 33 104 43C114 46 115 57 107 63C111 73 102 82 92 79C88 89 77 91 72 83ZM55 66C58 57 64 53 72 55C65 48 68 39 76 37C83 36 88 41 88 48C94 43 102 48 101 56C100 64 92 68 85 65C87 73 78 79 71 75C66 72 65 67 68 62C63 67 57 70 55 66Z",
        duration: 2.5,
        delay: 1,
      },
    ],
  },

  /** A branching spray with dark berries, like the bolder stems in the reference. */
  berrySpray: {
    viewBox: "0 0 150 220",
    washes: [
      {
        x: 83,
        y: 109,
        scale: 0.78,
        fill: "var(--color-gold)",
        opacity: 0.2,
        delay: 2.25,
      },
    ],
    strokes: [
      {
        d: "M69 216C69 190 73 167 76 146C80 119 84 91 92 61",
        duration: 2.5,
        delay: 0,
      },
      {
        d: "M76 149C61 139 50 126 43 111M56 133C43 132 32 126 24 117M46 119C42 107 35 98 27 91M81 119C96 111 106 99 112 86M97 106C110 106 122 101 130 92M85 95C74 85 68 75 65 62M90 73C102 67 111 58 116 47",
        duration: 2.1,
        delay: 0.5,
      },
      {
        d: "M74 164C61 163 51 168 44 178C57 178 67 173 74 166M78 139C91 139 101 145 107 155C94 154 84 149 78 141M58 132C49 128 43 120 42 111M97 106C107 103 114 96 116 87",
        duration: 1.75,
        delay: 0.85,
      },
    ],
    marks: [
      { cx: 42, cy: 109, r: 3.5, delay: 1.25 },
      { cx: 27, cy: 89, r: 3.1, delay: 1.4 },
      { cx: 23, cy: 115, r: 3.7, delay: 1.55 },
      { cx: 112, cy: 84, r: 3.5, delay: 1.45 },
      { cx: 130, cy: 90, r: 3.2, delay: 1.6 },
      { cx: 65, cy: 59, r: 3.3, delay: 1.7 },
      { cx: 116, cy: 44, r: 3.5, delay: 1.85 },
      { cx: 93, cy: 58, r: 3.2, delay: 2 },
    ],
  },

  /** A slender lavender stem with paired leaves and a tapered flower spike. */
  lavender: {
    viewBox: "0 0 110 220",
    washes: [
      {
        x: 56,
        y: 70,
        scale: 0.72,
        fill: "var(--color-mist-deep)",
        opacity: 0.2,
        delay: 2.25,
      },
    ],
    strokes: [
      {
        d: "M48 217C52 191 53 167 53 144C54 116 56 86 57 47",
        duration: 2.55,
        delay: 0,
      },
      {
        d: "M53 166C41 159 33 149 29 138C40 143 48 151 53 161M53 143C64 136 73 126 77 115C66 120 58 128 53 138M55 116C46 109 40 100 37 91C45 95 52 103 55 111",
        duration: 1.8,
        delay: 0.5,
      },
      {
        d: "M57 49C47 50 44 42 51 37C44 34 46 25 54 26C49 20 55 13 61 17C61 10 70 9 72 16C78 12 84 19 80 25C87 26 87 35 80 38C85 44 79 52 72 48C70 56 61 57 58 50ZM56 72C48 72 46 65 52 61C47 57 50 50 57 51M58 92C50 91 49 84 55 80C50 76 53 70 59 71",
        duration: 2.15,
        delay: 0.95,
      },
    ],
    marks: [
      { cx: 61, cy: 19, r: 2, delay: 1.35 },
      { cx: 53, cy: 31, r: 2.2, delay: 1.48 },
      { cx: 74, cy: 29, r: 2.2, delay: 1.6 },
      { cx: 60, cy: 43, r: 2.3, delay: 1.72 },
      { cx: 76, cy: 43, r: 2.1, delay: 1.84 },
      { cx: 55, cy: 62, r: 2, delay: 1.96 },
      { cx: 67, cy: 57, r: 2.1, delay: 2.08 },
      { cx: 59, cy: 80, r: 1.9, delay: 2.2 },
    ],
  },

  /** A sculptural iris with upright petals and long invitation-style blades. */
  iris: {
    viewBox: "0 0 150 220",
    washes: [
      {
        x: 77,
        y: 58,
        scale: 1.12,
        fill: "var(--color-gold)",
        opacity: 0.2,
        delay: 2.35,
      },
      {
        x: 92,
        y: 67,
        scale: 0.68,
        fill: "var(--color-blush-deep)",
        opacity: 0.22,
        delay: 2.6,
      },
    ],
    strokes: [
      {
        d: "M74 218C72 191 73 165 74 140C75 114 76 91 77 76",
        duration: 2.5,
        delay: 0,
      },
      {
        d: "M73 184C54 170 43 149 39 123C57 138 68 155 73 178M74 160C91 142 103 120 110 96C91 111 80 132 74 153M72 203C59 194 50 181 45 166M75 190C88 176 97 160 102 143",
        duration: 2.05,
        delay: 0.55,
      },
      {
        d: "M77 77C67 70 62 61 65 51C68 42 76 36 79 27C85 35 89 44 87 53C97 45 108 49 110 58C112 68 102 76 92 77C102 80 105 91 98 97C89 104 79 95 78 81C74 94 61 99 54 91C48 83 56 74 67 75C57 70 53 60 59 52C65 45 74 48 78 57C77 47 72 40 66 34C75 33 82 38 85 47",
        duration: 2.45,
        delay: 1.05,
      },
    ],
    marks: [{ cx: 79, cy: 72, r: 2.7, delay: 2.05 }],
  },

  /** An open anemone on a bowed stem, with a dark stippled center. */
  anemone: {
    viewBox: "0 0 150 220",
    washes: [
      {
        x: 74,
        y: 57,
        scale: 1.14,
        fill: "var(--color-blush-deep)",
        opacity: 0.3,
        delay: 2.3,
      },
    ],
    strokes: [
      {
        d: "M83 217C80 193 78 170 79 147C80 121 77 97 75 78",
        duration: 2.45,
        delay: 0,
      },
      {
        d: "M79 154C64 147 51 136 43 122C58 126 71 136 79 149M79 128C93 122 104 112 111 99C97 103 86 112 79 123M63 139C55 143 47 144 39 142M95 115C103 116 111 113 117 108",
        duration: 1.8,
        delay: 0.55,
      },
      {
        d: "M75 79C61 87 46 80 45 67C44 56 53 49 64 53C54 44 58 31 69 28C79 25 87 34 84 45C89 33 103 31 110 40C117 49 111 60 100 63C111 66 113 79 105 86C96 93 85 87 82 77C80 88 66 92 58 84C51 76 57 65 68 63C57 60 55 48 62 41C70 34 80 40 80 51C84 42 94 40 100 47C106 55 100 65 91 66",
        duration: 2.35,
        delay: 1,
      },
    ],
    marks: [
      { cx: 77, cy: 62, r: 3.2, delay: 1.85 },
      { cx: 70, cy: 59, r: 1.45, delay: 1.98 },
      { cx: 84, cy: 57, r: 1.5, delay: 2.1 },
      { cx: 87, cy: 65, r: 1.4, delay: 2.22 },
      { cx: 72, cy: 68, r: 1.35, delay: 2.34 },
    ],
  },

  /** A generous three-bloom bouquet with open spacing and layered leaves. */
  gardenBunch: {
    viewBox: "0 0 240 340",
    washes: [
      {
        x: 168,
        y: 78,
        scale: 1.55,
        fill: "var(--color-parchment-deep)",
        opacity: 0.42,
        delay: 2.45,
      },
      {
        x: 89,
        y: 211,
        scale: 1.28,
        fill: "var(--color-blush-deep)",
        opacity: 0.24,
        delay: 2.7,
      },
      {
        x: 170,
        y: 174,
        scale: 0.72,
        fill: "var(--color-gold)",
        opacity: 0.16,
        delay: 2.9,
      },
    ],
    strokes: [
      {
        d: "M121 336C114 305 111 274 112 240C113 196 92 151 69 119M121 336C128 301 133 268 134 232C135 225 140 217 148 211M183 137C186 131 188 126 191 122M119 284C140 255 157 222 177 204",
        duration: 3.1,
        delay: 0,
      },
      {
        d: "M111 241C94 232 78 217 66 197M115 264C96 257 77 257 57 265M132 244C149 227 168 214 190 207M136 216C123 202 113 185 107 167M126 294C141 278 150 260 154 240",
        duration: 2.25,
        delay: 0.45,
      },
      {
        d: "M111 241C93 239 75 229 64 214C82 215 100 224 111 238ZM114 263C95 252 76 249 57 255C72 267 94 270 114 265ZM132 243C145 225 164 214 187 213C174 229 153 240 132 245ZM136 215C122 202 115 185 115 166C130 179 137 197 136 215ZM126 294C137 275 151 264 168 258C162 276 144 291 126 296Z",
        duration: 2.35,
        delay: 0.75,
      },
      {
        d: "M109 238L70 216M112 262L63 256M135 241L181 216M136 212L117 170M129 291L164 261",
        duration: 1.7,
        delay: 1,
      },
      {
        d: "M69 120C53 132 33 124 31 107C29 93 42 82 57 85C47 72 53 56 68 52C82 49 93 60 91 74C101 61 119 66 124 81C129 96 116 108 101 107C112 117 106 134 92 138C78 142 68 131 68 116C61 130 43 132 34 120C26 109 34 96 48 94C38 88 42 74 53 68C65 62 77 71 76 84C83 72 99 72 106 84C113 97 103 110 89 108",
        duration: 2.65,
        delay: 1.15,
      },
      {
        d: "M166 97C149 96 137 84 140 69C143 56 155 49 168 54C164 41 175 28 188 31C202 34 208 48 201 60C214 54 229 64 230 78C231 92 218 101 204 96C212 108 204 121 191 122C178 123 167 111 169 98C164 111 147 113 140 102C133 92 140 80 153 79C143 72 147 58 158 54C170 50 180 59 178 72C185 61 199 62 205 74C211 86 201 97 188 95",
        duration: 2.65,
        delay: 1.3,
      },
      {
        d: "M158 190C143 197 128 187 130 173C131 161 142 154 154 157C147 146 154 133 166 131C179 130 187 140 184 152C194 143 208 149 211 162C214 175 203 184 191 182C197 193 189 204 177 204C165 203 158 194 160 183C154 194 139 194 133 184C127 175 134 165 145 165C136 159 141 147 151 144C162 141 171 150 169 160C176 151 188 153 193 163C198 173 189 183 178 181",
        duration: 2.5,
        delay: 1.45,
      },
      {
        d: "M39 106C50 101 59 101 69 106M57 84C62 91 66 98 69 106M91 72C83 84 77 95 71 106M147 78C154 81 160 87 166 94M178 50C173 65 169 79 167 94M215 77C197 83 182 89 168 95M137 173C145 174 152 178 158 186M165 139C162 155 160 170 159 186M202 164C185 171 172 178 160 186",
        duration: 2.25,
        delay: 1.7,
      },
    ],
    marks: [
      { cx: 70, cy: 107, r: 3.9, delay: 1.95 },
      { cx: 167, cy: 95, r: 3.8, delay: 2.1 },
      { cx: 159, cy: 186, r: 3.7, delay: 2.25 },
      { cx: 61, cy: 103, r: 1.35, delay: 2.35 },
      { cx: 78, cy: 101, r: 1.35, delay: 2.45 },
      { cx: 159, cy: 89, r: 1.3, delay: 2.55 },
      { cx: 175, cy: 90, r: 1.3, delay: 2.65 },
      { cx: 151, cy: 181, r: 1.25, delay: 2.75 },
      { cx: 167, cy: 181, r: 1.25, delay: 2.85 },
    ],
  },

  /** A lighter two-poppy arrangement with long stems and ribbon-like leaves. */
  poppyPair: {
    viewBox: "0 0 220 320",
    washes: [
      {
        x: 91,
        y: 89,
        scale: 1.58,
        fill: "var(--color-blush-deep)",
        opacity: 0.27,
        delay: 2.35,
      },
      {
        x: 159,
        y: 71,
        scale: 1.05,
        fill: "var(--color-gold)",
        opacity: 0.2,
        delay: 2.6,
      },
      {
        x: 65,
        y: 211,
        scale: 0.92,
        fill: "var(--color-mist-deep)",
        opacity: 0.18,
        delay: 2.8,
      },
    ],
    strokes: [
      {
        d: "M111 318C109 283 108 250 101 218C94 183 85 150 79 118M112 318C125 282 137 247 142 210C148 167 154 124 158 94",
        duration: 3,
        delay: 0,
      },
      {
        d: "M103 234C81 228 60 215 46 196C68 200 87 211 103 229M99 211C112 190 119 168 119 145C103 162 98 184 99 205M128 252C149 235 165 213 174 189C152 203 137 223 128 246M140 214C157 207 174 196 186 181C165 184 150 194 140 208M108 279C88 271 69 270 50 277C70 285 89 284 108 283",
        duration: 2.35,
        delay: 0.45,
      },
      {
        d: "M79 119C57 126 35 115 31 95C27 77 42 62 60 66C46 54 50 34 67 27C84 20 99 33 98 50C107 35 128 36 137 52C147 69 136 86 119 90C133 99 131 120 116 129C100 138 84 127 80 111C75 127 53 132 41 119C30 106 38 88 55 84C40 78 41 60 53 51C68 42 82 52 82 68C88 52 106 48 117 60C128 73 119 91 103 94",
        duration: 2.65,
        delay: 0.95,
      },
      {
        d: "M158 95C141 101 126 90 128 74C130 60 142 52 155 57C145 46 151 30 165 26C180 22 191 33 188 47C198 38 214 44 217 58C221 72 210 84 196 82C204 94 196 109 183 112C170 115 159 105 159 92C153 104 137 106 130 95C123 85 130 73 143 72C132 65 136 51 147 46C159 42 169 51 167 63C174 53 188 54 194 65C200 76 191 87 179 86",
        duration: 2.55,
        delay: 1.15,
      },
      {
        d: "M48 94C58 89 68 87 79 90M58 75C68 78 75 83 80 91M96 50C90 64 85 77 81 91M139 73C146 73 152 78 159 84M168 37C164 52 161 68 160 84M201 60C187 67 174 76 161 85M46 196L101 229M119 145L100 205M174 189L140 208",
        duration: 2.05,
        delay: 1.5,
      },
    ],
    marks: [
      { cx: 80, cy: 91, r: 4.2, delay: 1.85 },
      { cx: 160, cy: 85, r: 4, delay: 2 },
      { cx: 69, cy: 86, r: 1.5, delay: 2.15 },
      { cx: 90, cy: 84, r: 1.5, delay: 2.27 },
      { cx: 151, cy: 78, r: 1.45, delay: 2.39 },
      { cx: 170, cy: 79, r: 1.5, delay: 2.51 },
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

  const { viewBox, washes, strokes, marks = [] } = LINE_ART[kind];
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
      {marks.map((mark, i) => (
        <circle
          key={`mark-${i}`}
          className="botanical-mark"
          style={grownAt(mark.delay)}
          cx={mark.cx}
          cy={mark.cy}
          r={mark.r}
          fill="currentColor"
          stroke="none"
        />
      ))}
    </svg>
  );
}
