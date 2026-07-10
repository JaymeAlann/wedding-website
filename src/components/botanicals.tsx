"use client";

import { useEffect, useRef, type CSSProperties } from "react";
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
  }, []);

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
