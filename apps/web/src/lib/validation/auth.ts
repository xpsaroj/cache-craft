import { z } from "zod";

import { USER_ROLES } from "@/types/api";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(255, "Use 255 characters or fewer.")
  .email("Enter a valid email address.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters.")
    .max(100, "Use 100 characters or fewer."),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(128, "Use 128 characters or fewer."),
  role: z.enum(USER_ROLES),
});

export type RegisterValues = z.infer<typeof registerSchema>;
