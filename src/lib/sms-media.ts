/**
 * Server-approved media choices for invitation campaigns. The client submits
 * only a key; the server resolves the public path so an arbitrary URL can
 * never be relayed through the Twilio account.
 */
export const SMS_MEDIA_OPTIONS = [
  {
    key: "none",
    label: "Text only",
    description: "Send as a standard SMS",
    publicPath: null,
  },
  {
    key: "saveTheDate",
    label: "Save the Date",
    description: "Attach the announcement card",
    publicPath: "/photos/save-the-date.jpg",
  },
  {
    key: "invitation",
    label: "Formal Invitation",
    description: "Attach the detailed invitation",
    publicPath: "/photos/wedding-invite.jpg",
  },
] as const;

export type SmsMediaKey = (typeof SMS_MEDIA_OPTIONS)[number]["key"];

export function smsMediaOption(key: string) {
  return (
    SMS_MEDIA_OPTIONS.find((option) => option.key === key) ??
    SMS_MEDIA_OPTIONS[0]
  );
}
