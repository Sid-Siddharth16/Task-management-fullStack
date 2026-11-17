import { Link } from "react-router";
import { APP_NAME } from "../../components/Logo";
import { buttonClass } from "../../components/ui/Button/buttonClass";
import { ErrorState } from "../../components/ui/ErrorState";
import { ROUTES } from "../../constants/route.constant";

export default function ForbiddenPage() {
  return (
    <ErrorState
      code="403"
      title="You don't have access to this page"
      text="You don't have permission to view this page. Ask a workspace admin if you think you should."
      actions={
        <Link to={ROUTES.DASHBOARD} className={buttonClass()}>
          Back to dashboard
        </Link>
      }
    >
      <title>{`Access denied · ${APP_NAME}`}</title>
    </ErrorState>
  );
}
