"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type ToastVariant = "success" | "error" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: number;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastVariant, LucideIcon> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const iconStyles: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-info",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);

    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const item: ToastItem = {
        ...input,
        id: (nextId.current += 1),
        variant: input.variant ?? "info",
      };

      setToasts((current) => [...current.slice(-2), item]);

      const timer = window.setTimeout(
        () => dismiss(item.id),
        input.duration ?? 4500,
      );

      timers.current.set(item.id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      for (const timer of activeTimers.values()) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-end gap-3 p-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-0"
      >
        {toasts.map((item) => {
          const Icon = icons[item.variant];

          return (
            <div
              key={item.id}
              role={item.variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm",
              )}
            >
              <Icon
                className={cn("mt-0.5 size-5 shrink-0", iconStyles[item.variant])}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm leading-5 text-ink-muted">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded p-1 text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
