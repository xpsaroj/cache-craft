"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { safeNextPath, roleHomePath } from "@/lib/utils/navigation";
import { useAuth } from "./auth-provider";

export function GuestOnly({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !user) {
      return;
    }

    const next = safeNextPath(
      new URLSearchParams(window.location.search).get("next"),
    );

    router.replace(next ?? roleHomePath(user.role));
  }, [status, user, router]);

  if (status === "loading") {
    return <PageLoading label="Checking your session" withSkeleton={false} />;
  }

  if (status === "authenticated") {
    return <PageLoading label="Redirecting" withSkeleton={false} />;
  }

  return <>{children}</>;
}
