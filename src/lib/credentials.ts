import { z } from "zod";

// bcrypt consumes at most 72 UTF-8 bytes, not 72 Unicode characters.
// Shared by registration/login and PostgreSQL seeding to avoid unusable seeded accounts.
export const passwordSchema = z
  .string()
  .min(12)
  .max(72)
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "Password must be at most 72 UTF-8 bytes",
  );
