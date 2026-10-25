import type { User } from "@/types/api";
import { apiRequest } from "./client";

export interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export function getCurrentUser(signal?: AbortSignal): Promise<User> {
  return apiRequest<User>("/users/me", { signal });
}

export function updateCurrentUser(
  input: UpdateProfileInput,
): Promise<User> {
  return apiRequest<User>("/users/me", {
    method: "PATCH",
    body: input,
  });
}
