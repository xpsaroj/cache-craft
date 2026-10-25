import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters.")
    .max(100, "Use 100 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(255, "Use 255 characters or fewer.")
    .email("Enter a valid email address."),
});

export type ProfileValues = z.infer<typeof profileSchema>;
