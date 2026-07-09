import type { SVGProps } from "react";

/*
 * Hand-drawn-style line icons, 24×24, stroke-based so they inherit
 * currentColor. Kept in one map so config can reference them by name.
 */
const paths = {
  sparkle: (
    <path d="M12 4l1.6 6.4L20 12l-6.4 1.6L12 20l-1.6-6.4L4 12l6.4-1.6z" />
  ),
  wand: (
    <>
      <path d="M4 20L16.5 7.5" />
      <path d="M19.5 2.5v3M18 4h3" />
      <path d="M14 3.5l.4 1.6M20.5 9.5l-1.6-.4" />
    </>
  ),
  rings: (
    <>
      <circle cx="9.5" cy="13.5" r="5.5" />
      <circle cx="14.5" cy="10.5" r="5.5" />
      <path d="M14.5 3.5l-1.2 1.5h2.4z" />
    </>
  ),
  goblet: (
    <>
      <path d="M7.5 3h9l-.6 5.5a4 4 0 0 1-7.8 0L7.5 3z" />
      <path d="M12 13v6M8.5 21h7" />
    </>
  ),
  feast: (
    <>
      <path d="M4 17a8 8 0 0 1 16 0" />
      <path d="M2.5 20h19M12 9v-1.5" />
      <circle cx="12" cy="6.5" r="1" />
    </>
  ),
  music: (
    <>
      <path d="M9 17.5V6l9-2v11" />
      <circle cx="6.8" cy="17.5" r="2.2" />
      <circle cx="15.8" cy="15" r="2.2" />
    </>
  ),
  snitch: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M8.8 11.2C6.4 8.6 3.4 8.9 2.4 10.8M8.9 12.9c-2 1.5-4.2 1.3-5.5.2" />
      <path d="M15.2 11.2c2.4-2.6 5.4-2.3 6.4-.4M15.1 12.9c2 1.5 4.2 1.3 5.5.2" />
    </>
  ),
  owl: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8 4.5L6.5 2M16 4.5L17.5 2" />
      <circle cx="10" cy="8.5" r="0.4" fill="currentColor" />
      <circle cx="14" cy="8.5" r="0.4" fill="currentColor" />
      <path d="M12 10.5l-1 1.2h2z" />
      <path d="M7.5 13.5c-.8 3.5 1 8 4.5 8s5.3-4.5 4.5-8" />
    </>
  ),
  quill: (
    <>
      <path d="M20 4c-6.5.3-11.5 4.5-13.5 11L4 21l6-2.5C16.5 16.5 19.7 10.5 20 4z" />
      <path d="M6.5 17.5C10 12 13.5 8.5 17.5 6.5" />
    </>
  ),
  map: (
    <>
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </>
  ),
  heart: (
    <path d="M12 20.5C6.2 16.2 3.5 12.9 3.5 9.4 3.5 6.9 5.4 5 7.9 5c1.6 0 3.1.8 4.1 2.1C13 5.8 14.5 5 16.1 5c2.5 0 4.4 1.9 4.4 4.4 0 3.5-2.7 6.8-8.5 11.1z" />
  ),
  bed: (
    <>
      <path d="M3 5v14M3 9h15a3 3 0 0 1 3 3v7" />
      <path d="M3 16h18M6.5 9v-.5" />
    </>
  ),
  car: (
    <>
      <path d="M4.5 16.5H3v-4l2-5h12.5l3.5 5v4h-1.5" />
      <path d="M3 12.5h18M9.5 16.5h5" />
      <circle cx="7" cy="16.5" r="1.8" />
      <circle cx="17" cy="16.5" r="1.8" />
    </>
  ),
  gift: (
    <>
      <path d="M4.5 11.5v9h15v-9" />
      <path d="M3 8h18v3.5H3zM12 8v12.5" />
      <path d="M12 8c-1.8-3.2-6.5-3.8-6.5-.8 0 2.2 4 1.6 6.5.8zm0 0c1.8-3.2 6.5-3.8 6.5-.8 0 2.2-4 1.6-6.5.8z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8.5 2.5V7M15.5 2.5V7" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11M7 10.5l5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.3a3.5 3.5 0 0 1 0 6.4M17.5 14.3c2.6.8 4.5 3 4.5 5.7" />
    </>
  ),
  logOut: (
    <>
      <path d="M9.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3.5" />
      <path d="M15 8l4 4-4 4M19 12H9.5" />
    </>
  ),
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  check: <path d="M5 13l4.5 4.5L19 7" />,
  mapPin: (
    <>
      <path d="M12 21.5S5 15.2 5 10a7 7 0 0 1 14 0c0 5.2-7 11.5-7 11.5z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
