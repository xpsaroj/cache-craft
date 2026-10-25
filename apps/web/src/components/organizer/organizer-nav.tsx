"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/organizer", label: "Overview" },
  { href: "/organizer/events", label: "All events" },
  { href: "/organizer/events/new", label: "Create event" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/organizer") {
    return pathname === "/organizer";
  }

  if (href === "/organizer/events") {
    return (
      pathname === "/organizer/events" ||
      (pathname.startsWith("/organizer/events/") &&
        pathname !== "/organizer/events/new")
    );
  }

  return pathname === href;
}

export function OrganizerNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Organizer"
      className="-mb-px flex gap-6 overflow-x-auto"
    >
      {links.map((link) => {
        const active = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-12 shrink-0 items-center border-b-2 text-sm font-medium transition-colors",
              active
                ? "border-brand text-ink"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
