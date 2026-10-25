import type { UserRole } from "@/types/api";

export function safeNextPath(value: string | null): string | null {
  if (!value) {
    return null;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export function roleHomePath(role: UserRole): string {
  return role === "ORGANIZER" ? "/organizer" : "/dashboard";
}
