"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Eye, EyeOff, Ticket } from "lucide-react";
import { useForm } from "react-hook-form";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getErrorMessage, getFieldErrors } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-provider";
import { useNextPath } from "@/lib/hooks/use-next-path";
import { useToast } from "@/lib/toast/toast-provider";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth";
import { cn } from "@/lib/utils/cn";
import { roleHomePath } from "@/lib/utils/navigation";

const roles = [
  {
    value: "CUSTOMER",
    label: "Customer",
    description: "Browse events, reserve seats, and manage bookings.",
    icon: Ticket,
  },
  {
    value: "ORGANIZER",
    label: "Organizer",
    description: "Create events, add seating, and publish listings.",
    icon: Building2,
  },
] as const;

export function RegisterForm() {
  const { register: registerAccount } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const nextPath = useNextPath();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CUSTOMER",
    },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      const user = await registerAccount(values);

      toast({
        title: "Account created",
        description: `Welcome to CacheCraft, ${user.name}.`,
        variant: "success",
      });
      router.replace(nextPath ?? roleHomePath(user.role));
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      let mappedField = false;

      for (const fieldError of fieldErrors) {
        const key = fieldError.field.toLowerCase();
        const message = fieldError.messages[0];

        if (
          message &&
          (key === "name" ||
            key === "email" ||
            key === "password" ||
            key === "role")
        ) {
          setError(key, { type: "server", message });
          mappedField = true;
        }
      }

      if (!mappedField) {
        setServerError(getErrorMessage(error));
      }
    }
  });

  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  return (
    <AuthShell
      title="Create your account"
      description="Choose how you'll use CacheCraft. You can browse events or start organizing right away."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="font-medium text-brand-strong underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError ? (
          <Alert variant="error" title="Account creation failed">
            {serverError}
          </Alert>
        ) : null}

        <FormField
          id="register-name"
          label="Full name"
          error={errors.name?.message}
          required
        >
          {(fieldProps) => (
            <Input
              {...fieldProps}
              autoComplete="name"
              placeholder="Ada Lovelace"
              {...register("name")}
            />
          )}
        </FormField>

        <FormField
          id="register-email"
          label="Email"
          error={errors.email?.message}
          required
        >
          {(fieldProps) => (
            <Input
              {...fieldProps}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
            />
          )}
        </FormField>

        <FormField
          id="register-password"
          label="Password"
          description="Use at least 8 characters."
          error={errors.password?.message}
          required
        >
          {(fieldProps) => (
            <div className="relative">
              <Input
                {...fieldProps}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute top-0 right-0 flex size-10 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
          )}
        </FormField>

        <fieldset>
          <legend className="text-sm font-medium text-ink">
            I&apos;m joining as
            <span className="ml-1 text-brand-strong" aria-hidden>
              *
            </span>
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <label
                  key={role.value}
                  className={cn(
                    "relative flex cursor-pointer flex-col rounded-lg border border-line-strong bg-surface p-3.5 transition-colors hover:border-ink-subtle",
                    "has-[:checked]:border-brand has-[:checked]:bg-brand-soft",
                    "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-strong",
                  )}
                >
                  <input
                    type="radio"
                    value={role.value}
                    className="sr-only"
                    {...register("role")}
                  />
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    <Icon className="size-4 text-ink-muted" aria-hidden />
                    {role.label}
                  </span>
                  <span className="mt-1 text-xs leading-5 text-ink-muted">
                    {role.description}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.role ? (
            <p role="alert" className="mt-1.5 text-sm text-danger">
              {errors.role.message}
            </p>
          ) : null}
        </fieldset>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isSubmitting}
        >
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
