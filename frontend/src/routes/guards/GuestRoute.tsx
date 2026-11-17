import { Navigate, Outlet, useSearchParams } from "react-router";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { REDIRECT_PARAM } from "../../constants/auth.constant";
import { ROUTES } from "../../constants/route.constant";
import { useAuth } from "../../hooks/useAuth";
import { safeRedirect } from "../../utils/safeRedirect";

// Login/signup are for signed-out users only. Once signed in (including right after
// submitting the form) the user is sent on to where they were going.
export function GuestRoute() {
  const { status } = useAuth();
  const [searchParams] = useSearchParams();

  if (status === "loading") return <FullPageSpinner />;

  if (status === "authenticated") {
    return (
      <Navigate to={safeRedirect(searchParams.get(REDIRECT_PARAM), ROUTES.DASHBOARD)} replace />
    );
  }

  return <Outlet />;
}
