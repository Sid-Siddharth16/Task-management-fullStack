import { Navigate, Outlet, useLocation } from "react-router";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { REDIRECT_PARAM } from "../../constants/auth.constant";
import { ROUTES } from "../../constants/route.constant";
import { useAuth } from "../../hooks/useAuth";

// Only signed-in users get past this. Everyone else is sent to /login and
// returned to the page they wanted afterwards.
export function ProtectedRoute() {
  const { status, signOutReason } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageSpinner label="Checking your session…" />;

  if (status === "unauthenticated") {
    // after an explicit logout, don't bounce back to the last page on next login
    const search =
      signOutReason === "logout"
        ? ""
        : `?${new URLSearchParams({
            [REDIRECT_PARAM]: `${location.pathname}${location.search}`,
          })}`;
    return <Navigate to={`${ROUTES.LOGIN}${search}`} replace />;
  }

  return <Outlet />;
}
