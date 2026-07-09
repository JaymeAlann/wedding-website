"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  /** Marauder's Map-style ribbon naming the walker, when known. */
  name?: string;
}

function randomSpot(name?: string): Spot {
  return {
    left: 2 + Math.random() * 78,
    top: 4 + Math.random() * 72,
    rotate: Math.floor(Math.random() * 360),
    width: 84 + Math.floor(Math.random() * 56),
    flip: Math.random() < 0.5,
    // Named trails run darker so the ribbon has something to belong to.
    opacity: name ? 0.1 + Math.random() * 0.05 : 0.055 + Math.random() * 0.035,
    name,
  };
}

/**
 * One trail that walks across a random patch of its container, fades
 * away, then reappears somewhere new each cycle. Positions are picked
 * client-side after mount, so the server render stays deterministic.
 * `claim`/`release` hand out walker names so no name is on screen
 * twice at once.
 */
function Wanderer({
  startMs,
  claim,
  release,
}: {
  startMs: number;
  claim?: () => string | undefined;
  release?: (name: string) => void;
}) {
  const [spot, setSpot] = useState<Spot | null>(null);
  const [generation, setGeneration] = useState(0);
  const heldName = useRef<string | undefined>(undefined);

  useEffect(() => {
    // With reduced motion the CSS shows the trail statically, so leave
    // it in one place instead of teleporting it every cycle.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const next = () => {
      if (heldName.current) release?.(heldName.current);
      heldName.current = claim?.();
      setSpot(randomSpot(heldName.current));
      setGeneration((g) => g + 1);
    };
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      next();
      if (!reduced) interval = setInterval(next, CYCLE_MS);
    }, startMs);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
      if (heldName.current) {
        release?.(heldName.current);
        heldName.current = undefined;
      }
    };
  }, [startMs, claim, release]);

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
        transform: `rotate(${spot.rotate}deg)${spot.flip ? " scaleX(-1)" : ""}`,
      }}
    >
      <div style={{ opacity: spot.opacity }}>
        <Footprints className="h-auto w-full" />
      </div>
      {spot.name ? (
        // The track walks the ribbon along the trail; the inner span
        // counter-rotates (and un-mirrors) so the name reads level
        // whichever way the feet are heading.
        <span className="footprint-tag-track">
          <span
            className="footprint-tag"
            style={{
              transform: `translate(-50%, -50%) scaleX(${spot.flip ? -1 : 1}) rotate(${-spot.rotate - 5}deg)`,
            }}
          >
            {spot.name}
          </span>
        </span>
      ) : null}
    </div>
  );
}

/**
 * A background layer of Marauder's Map footprints that wander to a new
 * random spot after every walk. Parent must be `relative`. With
 * `names`, each walk carries a ribbon naming its walker — every name
 * appears at most once on screen, and a capped number of trails still
 * shows everyone over time.
 */
export function WanderingFeet({
  count = 1,
  names,
}: {
  count?: number;
  names?: string[];
}) {
  const inUse = useRef(new Set<string>());

  const claim = useCallback(() => {
    if (!names?.length) return undefined;
    const available = names.filter((n) => !inUse.current.has(n));
    if (available.length === 0) return undefined;
    const name = available[Math.floor(Math.random() * available.length)];
    inUse.current.add(name);
    return name;
  }, [names]);

  const release = useCallback((name: string) => {
    inUse.current.delete(name);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: count }, (_, k) => (
        <Wanderer
          key={k}
          startMs={(k * CYCLE_MS) / count}
          claim={names ? claim : undefined}
          release={names ? release : undefined}
        />
      ))}
    </div>
  );
}
