import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { Role } from "../../types/auth.types";

// UI-level role check: hides things the user can't use.
// It is NOT a security boundary; the backend enforces every permission.
export function Can({
  roles,
  children,
  fallback = null,
}: {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? children : fallback;
}
