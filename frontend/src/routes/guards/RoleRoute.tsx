import { Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import ForbiddenPage from "../../pages/Forbidden";
import type { Role } from "../../types/auth.types";

// Must be nested inside ProtectedRoute. Shows a 403 page instead of redirecting
// so the URL stays meaningful. UX only; the API enforces the same rule.
export function RoleRoute({ allow }: { allow: Role[] }) {
  const { hasRole } = useAuth();
  return hasRole(...allow) ? <Outlet /> : <ForbiddenPage />;
}
