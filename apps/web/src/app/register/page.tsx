import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { GuestOnly } from "@/lib/auth/guest-only";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a CacheCraft account to book seats or organize events.",
};

export default function RegisterPage() {
  return (
    <GuestOnly>
      <RegisterForm />
    </GuestOnly>
  );
}
