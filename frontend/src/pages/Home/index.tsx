import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Icon } from "../../components/ui/Icon";
import { ENV } from "../../config/env.config";
import { useApiStatus } from "../../hooks/useApiStatus";
import { formatUptime } from "./home.helper";
import styles from "./Home.module.css";

// System health gadget (used on the admin console)
export default function HomePage() {
  const apiStatus = useApiStatus();
  const loading = apiStatus.status === "loading";

  return (
    <Card
      title="Backend connection"
      meta={<StatusBadge state={apiStatus.status} />}
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={apiStatus.retry}
          disabled={loading}
          iconBefore={<Icon name="refresh" size={14} />}
        >
          {loading ? "Checking…" : "Check again"}
        </Button>
      }
    >
      <p className={styles.subtitle}>
        Requests go to <code>{ENV.API_BASE_URL}</code>
      </p>

      {loading && (
        <div className={styles.skeleton} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} />
          ))}
        </div>
      )}
      {loading && <p className="visually-hidden">Checking API…</p>}

      {apiStatus.status === "error" && (
        <div role="alert" className={styles.error}>
          <Icon name="error" size={20} />
          <div>
            <strong>Could not reach the API.</strong> {apiStatus.error.message}
            {apiStatus.error.status > 0 && (
              <span className={styles.muted}> (HTTP {apiStatus.error.status})</span>
            )}
          </div>
        </div>
      )}

      {apiStatus.status === "success" && (
        <dl className={styles.details}>
          <div>
            <dt>API</dt>
            <dd>{apiStatus.info.name}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{apiStatus.info.version}</dd>
          </div>
          <div>
            <dt>Environment</dt>
            <dd>{apiStatus.info.environment}</dd>
          </div>
          <div>
            <dt>Database</dt>
            <dd
              className={
                apiStatus.health.db === "connected" ? styles.textSuccess : styles.textDanger
              }
            >
              {apiStatus.health.db}
            </dd>
          </div>
          <div>
            <dt>Uptime</dt>
            <dd>{formatUptime(apiStatus.health.uptime)}</dd>
          </div>
          <div>
            <dt>Server time</dt>
            <dd>{new Date(apiStatus.info.timestamp).toLocaleString()}</dd>
          </div>
        </dl>
      )}
    </Card>
  );
}

function StatusBadge({ state }: { state: "loading" | "success" | "error" }) {
  const { label, className } = {
    loading: { label: "Checking", className: styles.badgeWarning },
    success: { label: "Connected", className: styles.badgeSuccess },
    error: { label: "Disconnected", className: styles.badgeDanger },
  }[state];

  return (
    <span className={`${styles.badge} ${className}`} data-testid="api-status-badge">
      {label}
    </span>
  );
}
