"use client";

import { useEffect, useState } from "react";

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function remaining(target: Date): Parts | null {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor(s / 3600) % 24,
    minutes: Math.floor(s / 60) % 60,
    seconds: s % 60,
  };
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="w-18 border border-gold/40 bg-cream/70 px-1 py-3 text-center shadow-soft backdrop-blur-sm sm:w-20">
      <div className="font-display text-2xl text-ink sm:text-3xl">{value}</div>
      <div className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-gold-ink">
        {label}
      </div>
    </div>
  );
}

export function Countdown({ targetISO }: { targetISO: string }) {
  // null = date passed, undefined = not mounted yet (SSR-safe placeholder).
  const [parts, setParts] = useState<Parts | null | undefined>(undefined);

  useEffect(() => {
    const target = new Date(targetISO);
    const tick = () => setParts(remaining(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  if (parts === null) {
    return (
      <p className="font-script text-3xl text-gold-deep">
        Mischief managed — we&rsquo;re married!
      </p>
    );
  }

  const show = (n?: number) =>
    n === undefined ? "–" : String(n).padStart(2, "0");

  return (
    <div>
      <div className="flex items-start justify-center gap-2.5 sm:gap-4" aria-hidden="true">
        <Unit value={parts ? String(parts.days) : "–"} label="Days" />
        <Unit value={show(parts?.hours)} label="Hours" />
        <Unit value={show(parts?.minutes)} label="Minutes" />
        <Unit value={show(parts?.seconds)} label="Seconds" />
      </div>
      <p className="sr-only" role="status">
        {parts ? `${parts.days} days until the wedding.` : "Counting down to the wedding."}
      </p>
    </div>
  );
}
