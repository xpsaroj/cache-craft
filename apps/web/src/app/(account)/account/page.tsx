"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut } from "lucide-react";
import { useForm } from "react-hook-form";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/page-loading";
import { getErrorMessage, getFieldErrors } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-provider";
import { useToast } from "@/lib/toast/toast-provider";
import { profileSchema, type ProfileValues } from "@/lib/validation/account";
import { formatDate, getInitials } from "@/lib/utils/format";
import { ROLE_LABELS } from "@/lib/utils/status";

export default function AccountPage() {
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email });
    }
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      const updated = await updateProfile(values);
      reset({ name: updated.name, email: updated.email });
      toast({
        title: "Profile updated",
        description: "Your account details have been saved.",
        variant: "success",
      });
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      let mappedField = false;

      for (const fieldError of fieldErrors) {
        const key = fieldError.field.toLowerCase();
        const message = fieldError.messages[0];

        if (message && (key === "name" || key === "email")) {
          setError(key, { type: "server", message });
          mappedField = true;
        }
      }

      if (!mappedField) {
        setServerError(getErrorMessage(error));
      }
    }
  });

  const handleLogout = () => {
    logout();
    toast({ title: "Signed out", variant: "success" });
    router.replace("/");
  };

  if (!user) {
    return <PageLoading label="Loading your account" withSkeleton={false} />;
  }

  return (
    <PageContainer className="py-10">
      <PageHeader
        eyebrow="Account"
        title="Account settings"
        description="Update your profile details and review how you use CacheCraft."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section className="rounded-xl border border-line bg-surface p-6">
          <h2 className="text-base font-semibold text-ink">Profile</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            This information appears on your account and in organizer
            communications.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            {serverError ? (
              <Alert variant="error" title="Couldn't save your profile">
                {serverError}
              </Alert>
            ) : null}

            <FormField
              id="account-name"
              label="Full name"
              error={errors.name?.message}
              required
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  autoComplete="name"
                  {...register("name")}
                />
              )}
            </FormField>

            <FormField
              id="account-email"
              label="Email"
              error={errors.email?.message}
              required
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
              )}
            </FormField>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isDirty}
              >
                Save changes
              </Button>
              {isDirty ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    reset({ name: user.name, email: user.email })
                  }
                  disabled={isSubmitting}
                >
                  Discard
                </Button>
              ) : (
                <p className="text-xs text-ink-subtle">No unsaved changes</p>
              )}
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-line bg-surface p-6">
            <div className="flex items-center gap-3">
              <span
                className="flex size-11 items-center justify-center rounded-full bg-ink text-sm font-semibold text-ink-inverse"
                aria-hidden
              >
                {getInitials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {user.name}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {user.email}
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Role</dt>
                <dd>
                  <Badge tone={user.role === "ORGANIZER" ? "brand" : "neutral"}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Member since</dt>
                <dd className="font-medium text-ink">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-xs leading-5 text-ink-subtle">
              Roles are set when an account is created and can&apos;t be
              changed here.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="text-sm font-semibold text-ink">Session</h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              Sign out of this browser. You can sign back in at any time.
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={handleLogout}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </Button>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
