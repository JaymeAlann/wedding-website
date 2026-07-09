"use client";

import { useEffect, useState } from "react";
import { Footprints } from "./ornaments";

/** One walk cycle — must match the .footstep animation in globals.css. */
const CYCLE_MS = 13_000;

interface Spot {
  left: number;
  top: number;
  rotate: number;
  width: number;
  flip: boolean;
  opacity: number;
}

function randomSpot(): Spot {
  return {
    left: 2 + Math.random() * 78,
    top: 4 + Math.random() * 72,
    rotate: Math.floor(Math.random() * 360),
    width: 84 + Math.floor(Math.random() * 56),
    flip: Math.random() < 0.5,
    opacity: 0.055 + Math.random() * 0.035,
  };
}

/**
 * One trail that walks across a random patch of its container, fades
 * away, then reappears somewhere new each cycle. Positions are picked
 * client-side after mount, so the server render stays deterministic.
 */
function Wanderer({ startMs }: { startMs: number }) {
  const [spot, setSpot] = useState<Spot | null>(null);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    // With reduced motion the CSS shows the trail statically, so leave
    // it in one place instead of teleporting it every cycle.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      setSpot(randomSpot());
      if (!reduced) {
        interval = setInterval(() => {
          setSpot(randomSpot());
          setGeneration((g) => g + 1);
        }, CYCLE_MS);
      }
    }, startMs);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [startMs]);

  if (!spot) return null;
  return (
    // Changing the key remounts the trail so the walk restarts from
    // the first footprint at the new spot.
    <div
      key={generation}
      className="absolute text-ink"
      style={{
        left: `${spot.left}%`,
        top: `${spot.top}%`,
        width: spot.width,
        opacity: spot.opacity,
        transform: `rotate(${spot.rotate}deg)${spot.flip ? " scaleX(-1)" : ""}`,
      }}
    >
      <Footprints className="h-auto w-full" />
    </div>
  );
}

/**
 * A background layer of Marauder's Map footprints that wander to a new
 * random spot after every walk. Parent must be `relative`.
 */
export function WanderingFeet({ count = 1 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: count }, (_, k) => (
        <Wanderer key={k} startMs={(k * CYCLE_MS) / count} />
      ))}
    </div>
  );
}
