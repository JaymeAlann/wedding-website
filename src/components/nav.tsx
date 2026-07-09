"use client";

import { useEffect, useState } from "react";
import { couple } from "@/lib/config";
import { Icon } from "@/components/icons";

// "/#…" (not "#…") so the links also work from /admin.
const links = [
  { href: "/#story", id: "story", label: "Our Story" },
  { href: "/#photos", id: "photos", label: "Photos" },
  { href: "/#schedule", id: "schedule", label: "The Day" },
  { href: "/#travel", id: "travel", label: "Travel" },
  { href: "/#registry", id: "registry", label: "Registry" },
  { href: "/#faq", id: "faq", label: "FAQ" },
];

export function Nav({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in the middle band of the viewport.
  useEffect(() => {
    const sections = [...links.map((l) => l.id), "rsvp"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const linkClass = (id: string) =>
    `font-display text-[0.8rem] uppercase tracking-[0.16em] transition-colors ${
      active === id
        ? "text-gold-ink underline decoration-gold underline-offset-8"
        : "text-ink-soft hover:text-ink"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-gold/25 bg-cream/85 shadow-soft backdrop-blur-md"
          : "border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <a
          href="/#top"
          onClick={() => setOpen(false)}
          className="flex items-baseline gap-1.5 font-display text-lg tracking-[0.18em] text-ink"
          aria-label={`${couple.a} and ${couple.b} — back to top`}
        >
          {couple.a[0]}
          <span className="font-script text-2xl leading-none text-gold-deep">&amp;</span>
          {couple.b[0]}
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.id}>
              <a href={link.href} className={linkClass(link.id)}>
                {link.label}
              </a>
            </li>
          ))}
          {isAdmin ? (
            <li>
              <a
                href="/admin"
                className="flex items-center gap-1.5 font-display text-[0.8rem] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-ink"
              >
                <Icon name="quill" className="h-4 w-4" />
                Admin
              </a>
            </li>
          ) : null}
          <li>
            <a
              href="/#rsvp"
              className={`bg-gold-deep px-5 py-2 font-display text-[0.8rem] uppercase tracking-[0.2em] text-cream transition-colors hover:bg-gold-ink ${
                active === "rsvp" ? "bg-gold-ink" : ""
              }`}
            >
              RSVP
            </a>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="cursor-pointer p-2 text-ink md:hidden"
        >
          <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
        </button>
      </nav>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-gold/20 bg-cream/95 backdrop-blur-md md:hidden"
        >
          <ul className="space-y-1 px-6 py-5">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 font-display text-sm uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {isAdmin ? (
              <li>
                <a
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block py-2.5 font-display text-sm uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  Admin
                </a>
              </li>
            ) : null}
            <li className="pt-3">
              <a
                href="/#rsvp"
                onClick={() => setOpen(false)}
                className="block bg-gold-deep px-5 py-3 text-center font-display text-sm uppercase tracking-[0.2em] text-cream transition-colors hover:bg-gold-ink"
              >
                RSVP
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
