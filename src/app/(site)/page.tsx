import { BotanicalDivider, LineBotanical } from "@/components/botanicals";
import { Countdown } from "@/components/countdown";
import { Icon } from "@/components/icons";
import { CardCorners, Flourish, SpineSprout } from "@/components/ornaments";
import { WalkerNames, WanderingFeet } from "@/components/wandering-feet";
import { Reveal } from "@/components/reveal";
import { RsvpForm } from "@/components/rsvp-form";
import { SectionHeading } from "@/components/section-heading";
import { walkerNames } from "@/lib/walkers";
import {
  couple,
  dateLong,
  faqs,
  galleryPhotos,
  heroPhoto,
  registry,
  schedule,
  story,
  travel,
  wedding,
} from "@/lib/config";

const STARS: Array<{ left: string; top: string; size: number; delay: number }> = [
  { left: "7%", top: "16%", size: 16, delay: 0 },
  { left: "14%", top: "38%", size: 11, delay: 1200 },
  { left: "22%", top: "12%", size: 13, delay: 2400 },
  { left: "33%", top: "26%", size: 9, delay: 600 },
  { left: "64%", top: "14%", size: 12, delay: 1800 },
  { left: "76%", top: "30%", size: 10, delay: 300 },
  { left: "85%", top: "12%", size: 15, delay: 2100 },
  { left: "92%", top: "34%", size: 11, delay: 900 },
  { left: "48%", top: "9%", size: 10, delay: 1500 },
];

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${wedding.venue.name}, ${wedding.venue.address}`,
)}`;

// The map's walkers grow with the RSVP list, so render fresh.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const walkers = await walkerNames();

  return (
    <WalkerNames names={walkers}>
    <main id="top">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-dvh flex-col overflow-hidden pt-16">
        <WanderingFeet count={4} />
        {/* Hand-drawn stems rooted in the hero's corners, like the
            corner sprays of a printed invitation suite. */}
        <LineBotanical
          kind="berrySpray"
          className="absolute -bottom-3 left-0 w-20 -rotate-[4deg] text-ink/70 sm:left-5 sm:w-36"
        />
        <LineBotanical
          kind="carnation"
          className="absolute -right-2 -bottom-2 w-24 rotate-[5deg] text-ink/70 sm:right-3 sm:w-40"
        />

        {STARS.map((star) => (
          <Icon
            key={`${star.left}-${star.top}`}
            name="sparkle"
            className="absolute animate-twinkle text-gold/70"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}ms`,
            }}
          />
        ))}

        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4 pt-10 text-center">
          <p className="font-script text-3xl text-gold-deep sm:text-4xl">
            Together with their families
          </p>

          <h1 className="mt-5 font-serif text-[clamp(3.2rem,10vw,6.5rem)] font-medium leading-[1.02] text-ink">
            {couple.a}
            <span className="mx-3 font-script text-[0.8em] text-gold-deep sm:mx-5">
              &amp;
            </span>
            {couple.b}
          </h1>

          <p className="mt-5 font-display text-xs uppercase tracking-[0.3em] text-ink-soft sm:text-sm">
            request the pleasure of your company
          </p>

          <Flourish className="mt-7 w-56 text-gold" />

          <p className="mt-7 font-display text-base uppercase tracking-[0.2em] text-ink sm:text-lg">
            {dateLong}
          </p>
          <p className="mt-2 text-lg italic text-fern">
            {wedding.venue.name} · {wedding.city}
          </p>

          <div className="mt-9">
            <Countdown targetISO={wedding.dateISO} />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#rsvp"
              className="bg-ink px-8 py-3.5 font-display text-sm uppercase tracking-[0.24em] text-cream transition-colors hover:bg-fern"
            >
              RSVP
            </a>
            <a
              href="/calendar.ics"
              download
              className="flex items-center gap-2.5 border border-gold-deep px-8 py-3.5 font-display text-sm uppercase tracking-[0.24em] text-gold-ink transition-colors hover:bg-gold-deep hover:text-cream"
            >
              <Icon name="calendar" className="h-4 w-4" />
              Add to calendar
            </a>
          </div>

          <a
            href="#story"
            aria-label="Scroll to our story"
            className="mt-12 animate-drift text-gold-ink transition-colors hover:text-ink"
          >
            <Icon name="chevronDown" className="h-7 w-7" />
          </a>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────────────── */}
      <section id="story" className="relative scroll-mt-20 px-4 py-20 sm:py-28">
        <WanderingFeet count={3} />
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionHeading
              eyebrow="Every great tale has a beginning"
              title="Our Story"
            />
            <p className="mx-auto mt-8 max-w-2xl text-balance text-center font-serif text-2xl italic leading-relaxed text-ink">
              Welcome to our wedding website! We&rsquo;re so glad you&rsquo;re
              here. Join us for a garden party celebration — an evening of good
              food, great company, and dancing under the trees.
            </p>
          </Reveal>

          <ol className="relative mx-auto mt-16 max-w-4xl">
            <div
              aria-hidden="true"
              className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-gold/40 sm:left-1/2"
            >
              {/* Leaves budding off the timeline as the tale grows. */}
              <SpineSprout className="absolute left-1/2 top-[15%] w-7 -translate-x-1/2 text-gold/80" />
              <SpineSprout className="absolute left-1/2 top-[47%] w-7 -translate-x-1/2 -scale-x-100 text-gold/80" />
              <SpineSprout className="absolute left-1/2 top-[85%] w-7 -translate-x-1/2 text-gold/80" />
              {/* The story ends in a bloom at "The Easiest Yes". */}
              <LineBotanical
                kind="rose"
                className="absolute bottom-0 left-1/2 w-20 -translate-x-1/2 translate-y-[88%] rotate-180 text-ink/60"
              />
            </div>
            {story.map((chapter, i) => (
              <li
                key={chapter.year}
                className="relative pb-14 pl-16 last:pb-0 sm:grid sm:grid-cols-2 sm:gap-x-20 sm:pl-0"
              >
                <div className="absolute left-5 top-0 z-10 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full border border-gold/60 bg-cream text-gold-ink shadow-soft sm:left-1/2">
                  <Icon name={chapter.icon} className="h-5 w-5" />
                </div>
                <Reveal
                  delay={60}
                  className={i % 2 === 0 ? "sm:pr-2 sm:text-right" : "sm:col-start-2 sm:pl-2"}
                >
                  <p className="font-display text-sm tracking-[0.2em] text-gold-ink">
                    {chapter.year}
                  </p>
                  <h3 className="mt-1.5 font-serif text-2xl font-medium italic text-ink">
                    {chapter.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-ink-soft">
                    {chapter.text}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Photos ───────────────────────────────────────────── */}
      <section
        id="photos"
        className="relative scroll-mt-20 border-y border-gold/20 bg-mist/40 px-4 py-20 sm:py-28"
      >
        <BotanicalDivider className="absolute left-1/2 top-0 w-48 -translate-x-1/2 -translate-y-1/2 text-gold/70 sm:w-56" />
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionHeading eyebrow="A few favorites" title="Photos" />
            <p className="mt-4 text-center italic text-fern">
              from our engagement shoot
            </p>
          </Reveal>

          <Reveal className="mt-14">
            <div className="relative mx-auto max-w-3xl">
              {/* A loose garden flower pressed behind the photo mat. */}
              <LineBotanical
                kind="cosmos"
                className="absolute -right-8 -top-12 w-28 rotate-[24deg] text-ink/60 sm:-right-14 sm:w-40"
              />
              <div className="-rotate-[0.6deg] border border-gold/30 bg-white p-3 shadow-lifted sm:p-4">
                <img
                  src={heroPhoto.src}
                  alt={heroPhoto.alt}
                  className="block w-full"
                  style={{ aspectRatio: heroPhoto.ratio, objectFit: "cover" }}
                />
              </div>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4">
            {galleryPhotos.map((photo, i) => (
              <Reveal
                key={photo.src}
                delay={i * 80}
                className={photo.ratio === "4/3" ? "col-span-2" : ""}
              >
                <div
                  className={`border border-gold/30 bg-white p-2.5 shadow-soft sm:p-3 ${
                    i % 2 === 0 ? "rotate-[0.8deg]" : "-rotate-[0.8deg]"
                  }`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="block h-auto w-full"
                    style={{ aspectRatio: photo.ratio, objectFit: "cover" }}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Day ──────────────────────────────────────────── */}
      <section
        id="schedule"
        className="relative scroll-mt-20 border-y border-gold/20 bg-parchment/60 px-4 py-20 sm:py-28"
      >
        <WanderingFeet count={2} />
        <BotanicalDivider className="absolute left-1/2 top-0 w-48 -translate-x-1/2 -translate-y-1/2 text-gold/70 sm:w-56" />
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow="The order of events" title="The Day" />
          </Reveal>
          {/* Lavender echoes the long, vertical rhythm of the schedule. */}
          <LineBotanical
            kind="lavender"
            className="absolute bottom-0 right-5 hidden w-20 -scale-x-100 text-ink/60 lg:block xl:right-12"
          />

          <ul className="mt-16">
            {schedule.map((item, i) => (
              <li key={item.time} className="flex gap-5 sm:gap-8">
                <div className="w-20 shrink-0 pt-1 text-right font-display text-sm tracking-[0.08em] text-gold-ink sm:w-24 sm:text-base">
                  {item.time}
                </div>
                <div
                  className={`relative flex-1 border-l border-gold/40 pl-6 sm:pl-8 ${
                    i === schedule.length - 1 ? "pb-2" : "pb-10"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border border-gold-deep bg-cream"
                  />
                  {i % 2 === 0 && i !== schedule.length - 1 ? (
                    // A sprout on the timeline between this stop and the next.
                    <SpineSprout
                      className={`absolute left-0 top-16 w-6 -translate-x-1/2 text-gold/80 ${
                        i % 4 === 2 ? "-scale-x-100" : ""
                      }`}
                    />
                  ) : null}
                  <Reveal delay={40}>
                    <h3 className="flex items-center gap-2.5 font-serif text-2xl font-medium italic text-ink">
                      <Icon
                        name={item.icon}
                        className="h-5 w-5 shrink-0 text-gold-ink"
                      />
                      {item.title}
                    </h3>
                    <p className="mt-1.5 max-w-prose text-ink-soft">{item.text}</p>
                  </Reveal>
                </div>
              </li>
            ))}
          </ul>

          <Reveal>
            <p className="mt-12 text-center italic text-fern">
              {wedding.venue.note}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Travel & Stay ────────────────────────────────────── */}
      <section id="travel" className="relative scroll-mt-20 px-4 py-20 sm:py-28">
        <WanderingFeet count={2} />
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionHeading
              eyebrow="Getting there & getting cozy"
              title="Travel & Stay"
            />
          </Reveal>

          <Reveal className="mt-14">
            <div className="relative mx-auto max-w-2xl">
              {/* A sculptural iris tucked behind the venue card. */}
              <LineBotanical
                kind="iris"
                className="absolute -right-10 -top-14 hidden w-28 rotate-[18deg] text-ink/60 sm:block"
              />
            <div className="flex flex-col items-center gap-1.5 border border-gold/30 bg-white/50 px-6 py-8 text-center shadow-soft">
              <Icon name="mapPin" className="h-6 w-6 text-gold-ink" />
              <h3 className="mt-2 font-serif text-2xl font-medium italic text-ink">
                {wedding.venue.name}
              </h3>
              <p className="text-ink-soft">{wedding.venue.address}</p>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 font-display text-xs uppercase tracking-[0.2em] text-gold-ink underline decoration-gold/60 underline-offset-4 transition-colors hover:text-ink"
              >
                Open in Maps
              </a>
            </div>
            </div>
          </Reveal>

          <div
            className={travel.length > 0 ? "mt-8 grid gap-6 md:grid-cols-2" : "hidden"}
          >
            {travel.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <div className="h-full border border-gold/25 bg-white/50 p-7 shadow-soft">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-cream text-gold-ink">
                    <Icon name={item.icon} className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="mt-4 font-serif text-2xl font-medium italic text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-ink-soft">{item.text}</p>
                  {item.link ? (
                    <a
                      href={item.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block font-display text-xs uppercase tracking-[0.2em] text-gold-ink underline decoration-gold/60 underline-offset-4 transition-colors hover:text-ink"
                    >
                      {item.link.label}
                    </a>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── RSVP ─────────────────────────────────────────────── */}
      <section
        id="rsvp"
        className="relative scroll-mt-20 border-y border-gold/20 bg-mist/50 px-4 py-20 sm:py-28"
      >
        <WanderingFeet count={2} />
        <BotanicalDivider className="absolute left-1/2 top-0 w-48 -translate-x-1/2 -translate-y-1/2 text-gold/70 sm:w-56" />
        <div className="mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-[1fr_1.15fr]">
          <Reveal className="lg:sticky lg:top-28">
            <div className="text-center lg:text-left">
              <p className="font-script text-3xl text-gold-deep sm:text-4xl">
                Wands at the ready
              </p>
              <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.16em] text-ink sm:text-3xl">
                RSVP
              </h2>
              <Flourish className="mx-auto mt-5 w-52 text-gold lg:mx-0" />
              <p className="mt-6 text-balance text-ink-soft">
                We would be honored to have you with us. Kindly send your reply
                by <strong className="font-medium">{wedding.rsvpBy}</strong> —
                the seating chart is a delicate bit of spellwork.
              </p>
              <p className="mt-4 italic text-fern">
                Plans changed? Reply again with the same name and we&rsquo;ll
                keep your latest answer.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative">
              {/* A berry spray tucked behind the reply card, stationery-style. */}
              <LineBotanical
                kind="berrySpray"
                className="absolute -left-12 -top-20 w-24 -rotate-[32deg] text-ink/60 sm:-left-16 sm:w-28"
              />
              <div className="ornate-frame relative bg-parchment/90 shadow-lifted">
                <CardCorners />
                <div className="px-6 py-9 sm:px-10 sm:py-11">
                  <RsvpForm />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Registry ─────────────────────────────────────────── */}
      <section id="registry" className="relative scroll-mt-20 px-4 py-20 sm:py-28">
        <WanderingFeet />
        {/* A ruffled flower rising from the section's bottom edge. */}
        <LineBotanical
          kind="carnation"
          className="absolute -bottom-1 left-6 hidden w-24 -rotate-[4deg] text-ink/60 lg:block xl:left-12"
        />
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading
              eyebrow="Your presence is the true present"
              title="Registry"
            />
            <p className="mx-auto mt-6 max-w-xl text-center text-ink-soft">
              Truly — having you there is everything. But for those who have
              asked, we&rsquo;ve gathered a few things here.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {registry.map((item, i) => (
              <Reveal key={item.name} delay={i * 90}>
                <div className="flex h-full flex-col items-center border border-gold/25 bg-white/50 p-8 text-center shadow-soft">
                  <Icon name="gift" className="h-6 w-6 text-gold-ink" />
                  <h3 className="mt-3 font-display text-base uppercase tracking-[0.18em] text-ink">
                    {item.name}
                  </h3>
                  <p className="mt-2 flex-1 italic text-ink-soft">{item.text}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 border border-gold-deep px-6 py-2.5 font-display text-xs uppercase tracking-[0.2em] text-gold-ink transition-colors hover:bg-gold-deep hover:text-cream"
                      aria-label={`Visit our ${item.name} registry`}
                    >
                      Visit
                    </a>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section
        id="faq"
        className="relative scroll-mt-20 border-t border-gold/20 bg-parchment/60 px-4 py-20 sm:py-28"
      >
        <WanderingFeet count={2} />
        <BotanicalDivider className="absolute left-1/2 top-0 w-48 -translate-x-1/2 -translate-y-1/2 text-gold/70 sm:w-56" />
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow="Answers, at a glance" title="Questions" />
          </Reveal>
          {/* An open bloom marks the garden's final section. */}
          <LineBotanical
            kind="anemone"
            className="absolute -bottom-1 left-4 hidden w-28 rotate-[5deg] text-ink/60 lg:block xl:left-10"
          />
          <Reveal className="mt-12">
            <div className="border-t border-gold/25">
              {faqs.map((faq) => (
                <details key={faq.q} className="group border-b border-gold/25">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left font-serif text-xl font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <Icon
                      name="chevronDown"
                      className="h-5 w-5 shrink-0 text-gold-ink transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <p className="max-w-prose pb-6 italic text-ink-soft">{faq.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
    </WalkerNames>
  );
}
