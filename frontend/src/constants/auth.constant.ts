// Mirrors backend ROLES
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  MEMBER: "member",
} as const;

export const ROLE_LABELS = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
} as const;

// Mirrors backend password policy (validators/auth.validator.ts)
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// query param ProtectedRoute uses to send the user back after signing in
export const REDIRECT_PARAM = "redirect";
