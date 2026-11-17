import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { buttonClass } from "../../components/ui/Button/buttonClass";
import { ErrorState } from "../../components/ui/ErrorState";
import { ENV } from "../../config/env.config";
import { ROUTES } from "../../constants/route.constant";

// Router-level error boundary: catches render errors and failed lazy-chunk loads
export default function RouteErrorPage() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong while loading this page.";

  return (
    <ErrorState
      fullPage
      role="alert"
      code="Oops"
      title="Something went wrong"
      text={message}
      actions={
        <Link to={ROUTES.HOME} reloadDocument className={buttonClass()}>
          Reload app
        </Link>
      }
    >
      {ENV.IS_DEV && error instanceof Error && <pre>{error.stack}</pre>}
    </ErrorState>
  );
}
