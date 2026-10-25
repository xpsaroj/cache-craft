import type { AuthResponse, UserRole } from "@/types/api";
import { apiRequest } from "./client";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
  role: UserRole;
}

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function register(input: RegisterInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: input,
    auth: false,
  });
}
