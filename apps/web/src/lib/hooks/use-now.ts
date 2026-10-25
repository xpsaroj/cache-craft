"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useNow(intervalMs = 30_000): number | null {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const timer = window.setInterval(onStoreChange, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return useSyncExternalStore<number | null>(
    subscribe,
    () => Date.now(),
    () => null,
  );
}
