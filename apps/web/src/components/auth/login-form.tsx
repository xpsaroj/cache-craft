"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-provider";
import { useNextPath } from "@/lib/hooks/use-next-path";
import { useToast } from "@/lib/toast/toast-provider";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";
import { roleHomePath } from "@/lib/utils/navigation";

export function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const nextPath = useNextPath();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      const user = await login(values);

      toast({
        title: "Signed in",
        description: `Welcome back, ${user.name}.`,
        variant: "success",
      });
      router.replace(nextPath ?? roleHomePath(user.role));
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  const registerHref = nextPath
    ? `/register?next=${encodeURIComponent(nextPath)}`
    : "/register";

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to reserve a seat and manage your bookings."
      footer={
        <p>
          New to CacheCraft?{" "}
          <Link
            href={registerHref}
            className="font-medium text-brand-strong underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError ? (
          <Alert variant="error" title="Sign in failed">
            {serverError}
          </Alert>
        ) : null}

        <FormField
          id="login-email"
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
          id="login-password"
          label="Password"
          error={errors.password?.message}
          required
        >
          {(fieldProps) => (
            <div className="relative">
              <Input
                {...fieldProps}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
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

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isSubmitting}
        >
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
