"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CalendarClock,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Ticket,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-provider";
import { useToast } from "@/lib/toast/toast-provider";
import { cn } from "@/lib/utils/cn";
import { getInitials } from "@/lib/utils/format";

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface MenuLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate?: () => void;
}

function MenuLink({ href, label, icon: Icon, onNavigate }: MenuLinkProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
    >
      <Icon className="size-4 text-ink-muted" aria-hidden />
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return <SiteHeaderContent key={pathname} />;
}

function SiteHeaderContent() {
  const { status, user, logout } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    toast({ title: "Signed out", variant: "success" });
    router.push("/");
  };

  const desktopLinks = [
    { href: "/events", label: "Events" },
    ...(user?.role === "ORGANIZER"
      ? [{ href: "/organizer", label: "Organizer" }]
      : []),
  ];

  const accountLinks: MenuLinkProps[] = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/bookings", label: "My bookings", icon: Ticket },
        {
          href: "/reservations",
          label: "My reservations",
          icon: CalendarClock,
        },
        { href: "/account", label: "Account", icon: UserRound },
        ...(user.role === "ORGANIZER"
          ? [
              {
                href: "/organizer",
                label: "Organizer console",
                icon: Building2,
              },
            ]
          : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <PageContainer>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Brand />
            <nav
              aria-label="Primary"
              className="hidden items-center gap-1 md:flex"
            >
              {desktopLinks.map((link) => {
                const active = isActivePath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-surface-muted text-ink"
                        : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {status === "loading" ? (
              <Skeleton className="h-8 w-32" />
            ) : user ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-muted"
                >
                  <span
                    className="flex size-7 items-center justify-center rounded-full bg-ink text-xs font-semibold text-ink-inverse"
                    aria-hidden
                  >
                    {getInitials(user.name)}
                  </span>
                  <span className="hidden max-w-32 truncate font-medium text-ink lg:block">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-ink-muted transition-transform",
                      menuOpen ? "rotate-180" : undefined,
                    )}
                    aria-hidden
                  />
                </button>

                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute top-full right-0 mt-2 w-64 rounded-lg border border-line bg-surface p-1.5 shadow-lg"
                  >
                    <div className="border-b border-line px-2.5 pt-1.5 pb-2.5">
                      <p className="truncate text-sm font-medium text-ink">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {user.email}
                      </p>
                    </div>
                    <div className="pt-1.5">
                      {accountLinks.map((link) => (
                        <MenuLink
                          key={link.href}
                          {...link}
                          onNavigate={() => setMenuOpen(false)}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 border-t border-line pt-1.5">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
                      >
                        <LogOut
                          className="size-4 text-ink-muted"
                          aria-hidden
                        />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants("ghost", "sm")}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className={buttonVariants("primary", "sm")}
                >
                  Create account
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-muted md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </PageContainer>

      {mobileOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-line bg-surface md:hidden"
        >
          <PageContainer className="py-4">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {desktopLinks.map((link) => {
                const active = isActivePath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-surface-muted text-ink"
                        : "text-ink-soft hover:bg-surface-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {user ? (
              <>
                <div className="mt-4 border-t border-line pt-4">
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span
                      className="flex size-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-ink-inverse"
                      aria-hidden
                    >
                      {getInitials(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {accountLinks.map((link) => (
                    <MenuLink
                      key={link.href}
                      {...link}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
                  >
                    <LogOut className="size-4 text-ink-muted" aria-hidden />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
                <Link
                  href="/login"
                  className={buttonVariants("outline", "md")}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className={buttonVariants("primary", "md")}
                >
                  Create account
                </Link>
              </div>
            )}
          </PageContainer>
        </div>
      ) : null}
    </header>
  );
}
