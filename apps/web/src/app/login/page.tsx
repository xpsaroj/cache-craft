import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { GuestOnly } from "@/lib/auth/guest-only";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your CacheCraft reservations and bookings.",
};

export default function LoginPage() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  );
}
