"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/bookings", label: "Bookings" },
  { href: "/reservations", label: "Reservations" },
  { href: "/account", label: "Account" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="-mb-px flex gap-6 overflow-x-auto"
    >
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

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
