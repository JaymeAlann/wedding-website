/* Tab-style links between the two halves of the host dashboard. */

const tabs = [
  { href: "/admin", label: "RSVPs" },
  { href: "/admin/invites", label: "SMS Invitations" },
] as const;

export function AdminTabs({ active }: { active: (typeof tabs)[number]["href"] }) {
  return (
    <nav aria-label="Admin sections" className="mt-8 border-b border-gold/25">
      <ul className="flex gap-7">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <a
              href={tab.href}
              aria-current={tab.href === active ? "page" : undefined}
              className={`block pb-2.5 font-display text-xs uppercase tracking-[0.18em] transition-colors ${
                tab.href === active
                  ? "-mb-px border-b-2 border-gold-deep text-ink"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
