import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Great_Vibes } from "next/font/google";
import "./globals.css";
import { couple, dateLong, wedding } from "@/lib/config";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${couple.a} & ${couple.b} — ${dateLong}`,
    template: `%s · ${couple.a} & ${couple.b}`,
  },
  description: `${couple.a} and ${couple.b} are getting married on ${dateLong} in ${wedding.city}. Schedule, travel details, and RSVP inside.`,
  // A wedding site is for guests, not search engines.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#faf6ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${cinzel.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="texture-parchment flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
