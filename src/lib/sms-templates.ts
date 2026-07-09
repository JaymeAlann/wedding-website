import { couple, dateShort, wedding } from "./config";

/*
 * SMS starting points carried over from the original app. {first_name}
 * is replaced per-recipient at send time; the admin can edit the text
 * freely before sending. Server-only: the invitation embeds the guest
 * password from the environment.
 */

export interface SmsTemplate {
  key: string;
  label: string;
  text: string;
}

const names = `${couple.a} & ${couple.b}`;
const siteUrl = process.env.SITE_URL?.trim() || "[your-site-url]";
const guestPassword = process.env.GUEST_PASSWORD?.trim() || "[guest password]";

export function smsTemplates(): SmsTemplate[] {
  return [
    {
      key: "saveTheDate",
      label: "Save the Date",
      text: `Save the Date ♡ ${names} are getting married ${dateShort} in Roswell, GA. A formal invitation with all the details will follow soon. We can't wait to celebrate with you, {first_name}!`,
    },
    {
      key: "invitation",
      label: "Invitation + Instructions",
      text: `{first_name}, you're invited! ${names} — ${dateShort} at ${wedding.venue.name}, ${wedding.venue.address}. Cocktail hour begins at 5:00pm, ceremony to follow. Please RSVP by March 1 at ${siteUrl} (password: ${guestPassword}).`,
    },
    {
      key: "reminder",
      label: "RSVP Reminder",
      text: `{first_name}, a friendly reminder from ${names} — we haven't received your RSVP yet! Please respond by March 1 at ${siteUrl} so we can save you a seat on ${dateShort}.`,
    },
  ];
}

/** "Hannah & Jim Smith" → "Hannah", matching the original app. */
export function firstName(name: string): string {
  return name.split(/[\s&]/)[0] || "friend";
}
