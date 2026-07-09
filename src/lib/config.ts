import type { IconName } from "@/components/icons";

/*
 * ────────────────────────────────────────────────────────────────
 * SITE CONTENT — everything about the wedding lives here.
 * Entries marked TODO are placeholders; replace them with the
 * real details. Passwords live in .env.local, not here.
 * ────────────────────────────────────────────────────────────────
 */

export const couple = {
  a: "Hannah",
  b: "James",
} as const;

export const wedding = {
  /**
   * Ceremony date & time, written in the venue's local time.
   * (Parsed without a zone offset, so the countdown ticks in each
   * guest's local clock — same behavior as the original app.)
   */
  dateISO: "2027-04-17T17:00:00",
  /** IANA zone of the venue — used for the calendar invite. */
  timeZone: "America/New_York",
  rsvpBy: "March 1st, 2027",
  city: "Roswell, Georgia",
  venue: {
    name: "UUMAN",
    address: "11420 Crabapple Rd, Roswell, GA 30075",
    note: "On-site parking is available. The ceremony and reception are both held at the venue.",
  },
} as const;

export const weddingDate = new Date(wedding.dateISO);

export const dateLong = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(weddingDate);

export const dateShort = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(weddingDate);

export interface StoryChapter {
  year: string;
  title: string;
  text: string;
  icon: IconName;
}

export const story: StoryChapter[] = [
  {
    year: "2012",
    title: "Where It All Began",
    text: "Long before we knew where life would take us, our story began at Brookwood Grill, a restaurant where we both worked in 2012. At the time, we were just friends — laughing through shifts, getting to know each other, and building a connection that would quietly stay with us for years.",
    icon: "feast",
  },
  {
    year: "2017",
    title: "Finding Our Way Back",
    text: "After years of friendship and separate chapters of life, we reconnected in 2017. What started as simply hanging out again slowly became something more. We spent more time together, grew closer, and began to realize there had always been something special between us.",
    icon: "map",
  },
  {
    year: "2018",
    title: "From Friendship to Forever",
    text: "In 2018, our friendship turned into the beginning of our love story. We traveled together, spent more and more time together, and before long, Hannah was spending most of her days at James’s place.\n\nWhile Hannah was in Guatemala with her grandma, Mema, we finally said what had been growing between us for so long: “I love you.” That moment changed everything.\n\nBy Thanksgiving 2018, we made it official — and began the relationship that would become the foundation for the rest of our lives.",
    icon: "heart",
  },
  {
    year: "The Years Between",
    title: "Concerts, Adventures, and Home",
    text: "Since then, our love has been built through countless memories, big and small. We have traveled across the country, explored Puerto Rico, taken unforgettable trips together, and somehow managed to see Tash Sultana seven times and Ocean Alley six times — proof that some songs just become part of your story.\n\nThrough every adventure, every concert, every road trip, and every ordinary day in between, we kept choosing each other.",
    icon: "music",
  },
  {
    year: "December 2024",
    title: "The Easiest Yes",
    text: "In December 2024, after more than a decade of knowing each other and years of loving each other, we got engaged.\n\nWhat started as friendship in 2012 became the love of our lives — and now, we cannot wait to begin this next chapter together as husband and wife.",
    icon: "rings",
  },
];

export interface ScheduleItem {
  time: string;
  title: string;
  text: string;
  icon: IconName;
}

export const schedule: ScheduleItem[] = [
  {
    time: "5:00 PM",
    title: "Cocktail Hour",
    text: "Drinks and mingling in the garden to open the evening.",
    icon: "goblet",
  },
  {
    time: "6:00 PM",
    title: "Ceremony",
    text: "We tie the knot, surrounded by the people we love most.",
    icon: "rings",
  },
  {
    time: "7:00 PM",
    title: "Dinner & Reception",
    text: "Dinner, toasts, and dancing late into the evening.",
    icon: "feast",
  },
  {
    time: "11:00 PM",
    title: "Farewell",
    text: "The evening comes to a close.",
    icon: "snitch",
  },
];

export interface TravelItem {
  title: string;
  text: string;
  icon: IconName;
  link?: { label: string; href: string };
}

export const travel: TravelItem[] = [
  {
    title: "DoubleTree by Hilton",
    text: "DoubleTree by Hilton Hotel Atlanta – Roswell, at 1075 Holcomb Bridge Rd — a short drive from the venue.",
    icon: "bed",
    link: {
      label: "Book a room",
      href: "https://www.hilton.com/en/hotels/atlrsdt-doubletree-atlanta-roswell/",
    },
  },
  {
    title: "The Hotel at Avalon",
    text: "The Hotel at Avalon in nearby Alpharetta, at 9000 Avalon Blvd — with the Avalon district's shops and restaurants at your doorstep.",
    icon: "bed",
    link: {
      label: "Book a room",
      href: "https://www.marriott.com/en-us/hotels/atlre-the-hotel-at-avalon-autograph-collection/overview/",
    },
  },
];

export interface RegistryItem {
  name: string;
  text: string;
  /** Omitted while the link is still to come. */
  href?: string;
}

// TODO: add links when the funds/registry are set up.
export const registry: RegistryItem[] = [
  {
    name: "Home Fund",
    text: "Help us settle into our first home together.",
  },
  {
    name: "Honeymoon",
    text: "Contribute to our post-wedding adventure through Italy.",
  },
  {
    name: "Gift Registry",
    text: "A curated list for our new chapter — link coming soon.",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "What should I wear?",
    a: "Garden party attire — soft colors and florals encouraged, and consider the grass when choosing shoes. Cloaks are welcome but entirely optional.",
  },
  {
    q: "When should I RSVP by?",
    a: `Please send your reply by ${wedding.rsvpBy} so we can finish the seating chart without resorting to divination.`,
  },
  {
    q: "Anything else we should know?",
    a: "No long goodbyes — when it's time for you to head out, feel free to slip away; Irish exits are warmly encouraged. And if you'd like to stay and help tidy up after the last dance, we'd be so grateful.",
  },
  {
    q: "Do I need to know Harry Potter to enjoy the wedding?",
    a: "Not one bit. But if you catch the references, ten points to your house.",
  },
];

/** Party sizes offered on the RSVP form. */
export const MAX_PARTY_SIZE = 6;

export interface Photo {
  src: string;
  alt: string;
  /** CSS aspect-ratio used to crop the frame. */
  ratio: string;
}

/* Engagement-shoot photos recovered from the original site. */
export const heroPhoto: Photo = {
  src: "/photos/hero.webp",
  alt: "Hannah and James at their engagement shoot",
  ratio: "3/2",
};

export const galleryPhotos: Photo[] = [
  { src: "/photos/stairs.webp", alt: "Hannah and James on the stairs", ratio: "3/4" },
  { src: "/photos/sitting.webp", alt: "Hannah and James sitting together", ratio: "3/4" },
  { src: "/photos/selfie.webp", alt: "A selfie of Hannah and James", ratio: "3/4" },
  { src: "/photos/ring.webp", alt: "A close-up of the engagement ring", ratio: "3/4" },
  { src: "/photos/wide.webp", alt: "Hannah and James, engagement shoot", ratio: "4/3" },
];
