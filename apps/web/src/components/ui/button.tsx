import {
  forwardRef,
  type ButtonHTMLAttributes,
} from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand hover:bg-brand-strong hover:text-ink-inverse",
  secondary: "bg-ink text-ink-inverse hover:bg-ink-soft",
  outline:
    "border border-line-strong bg-surface text-ink hover:bg-surface-muted",
  ghost: "text-ink hover:bg-surface-muted",
  destructive: "bg-danger text-white hover:bg-danger/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "size-10",
};

export function buttonVariants(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={buttonVariants(variant, size, className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : null}
        {children}
      </button>
    );
  },
);
