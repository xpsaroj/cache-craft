"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import type { UserRole } from "@/types/api";
import { useAuth } from "./auth-provider";

interface RequireAuthProps {
  children: ReactNode;
  role?: UserRole;
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!user) {
      const next = `${pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (role && user.role !== role) {
      router.replace(user.role === "ORGANIZER" ? "/organizer" : "/dashboard");
    }
  }, [status, user, role, router, pathname]);

  if (status === "loading" || !user) {
    return <PageLoading label="Checking your session" />;
  }

  if (role && user.role !== role) {
    return <PageLoading label="Redirecting" withSkeleton={false} />;
  }

  return <>{children}</>;
}
