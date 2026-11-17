import { Link } from "react-router";
import { APP_NAME } from "../../components/Logo";
import { buttonClass } from "../../components/ui/Button/buttonClass";
import { ErrorState } from "../../components/ui/ErrorState";
import { ROUTES } from "../../constants/route.constant";

export default function NotFoundPage() {
  return (
    <ErrorState
      fullPage
      code="404"
      title="We can't find that page"
      text="The link may be broken, or the page may have been moved."
      actions={
        <Link to={ROUTES.HOME} className={buttonClass()}>
          Go to {APP_NAME}
        </Link>
      }
    >
      <title>{`Page not found · ${APP_NAME}`}</title>
    </ErrorState>
  );
}
