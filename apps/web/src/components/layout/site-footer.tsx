import Link from "next/link";

import { Brand } from "@/components/layout/brand";
import { PageContainer } from "@/components/layout/page-container";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { href: "/events", label: "Browse events" },
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Create account" },
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/bookings", label: "My bookings" },
      { href: "/reservations", label: "My reservations" },
      { href: "/account", label: "Account settings" },
    ],
  },
  {
    title: "Organizers",
    links: [
      { href: "/organizer", label: "Organizer console" },
      { href: "/organizer/events/new", label: "Create an event" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <PageContainer className="py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Brand />
            <p className="mt-3 max-w-xs text-sm leading-6 text-ink-muted">
              Browse events, reserve seats, and keep every booking in one
              place.
            </p>
          </div>
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold tracking-wider text-ink-soft uppercase">
                {group.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CacheCraft</p>
          <p>Events, seats, and bookings without the clutter.</p>
        </div>
      </PageContainer>
    </footer>
  );
}
