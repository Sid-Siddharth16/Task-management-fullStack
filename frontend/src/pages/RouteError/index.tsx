import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { ENV } from "../../config/env.config";
import { ROUTES } from "../../constants/route.constant";
import styles from "../NotFound/NotFound.module.css";

// Router-level error boundary: catches render errors and failed lazy-chunk loads
export default function RouteErrorPage() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong while loading this page.";

  return (
    <section role="alert" className={styles.wrapper}>
      <h1 className={styles.code}>Oops</h1>
      <p className={styles.text}>{message}</p>
      {ENV.IS_DEV && error instanceof Error && <pre>{error.stack}</pre>}
      <Link to={ROUTES.HOME} reloadDocument>
        Reload app
      </Link>
    </section>
  );
}
