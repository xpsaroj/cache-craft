"use client";

import { useSyncExternalStore } from "react";

import { safeNextPath } from "@/lib/utils/navigation";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("popstate", onStoreChange);

  return () => window.removeEventListener("popstate", onStoreChange);
}

function getSnapshot(): string | null {
  return safeNextPath(new URLSearchParams(window.location.search).get("next"));
}

function getServerSnapshot(): string | null {
  return null;
}

export function useNextPath(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
