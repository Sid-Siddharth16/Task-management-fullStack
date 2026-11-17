import { PASSWORD_MIN_LENGTH } from "../constants/auth.constant";

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export const getPasswordRequirements = (password: string): PasswordRequirement[] => [
  {
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    met: password.length >= PASSWORD_MIN_LENGTH,
  },
  { label: "Contains a letter", met: /[a-zA-Z]/.test(password) },
  { label: "Contains a number", met: /\d/.test(password) },
];

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;
export const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;

// Lightweight heuristic for UI feedback only; the backend enforces the real policy
export function getPasswordStrength(password: string): StrengthLevel {
  if (!password) return 0;
  let score = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (!getPasswordRequirements(password).every((r) => r.met)) score = Math.min(score, 1);
  return Math.min(score, 4) as StrengthLevel;
}
