import { ENV } from "../../config/env.config";
import { useApiStatus } from "../../hooks/useApiStatus";
import { formatUptime } from "./home.helper";
import styles from "./Home.module.css";

export default function HomePage() {
  const apiStatus = useApiStatus();

  return (
    <section className={styles.card} aria-labelledby="api-status-title">
      <div className={styles.cardHeader}>
        <h1 id="api-status-title" className={styles.title}>
          Backend connection
        </h1>
        <StatusBadge state={apiStatus.status} />
      </div>

      <p className={styles.subtitle}>
        Requests go to <code>{ENV.API_BASE_URL}</code>
      </p>

      {apiStatus.status === "loading" && <p className={styles.muted}>Checking API…</p>}

      {apiStatus.status === "error" && (
        <div role="alert" className={styles.error}>
          <strong>Could not reach the API.</strong> {apiStatus.error.message}
          {apiStatus.error.status > 0 && (
            <span className={styles.muted}> (HTTP {apiStatus.error.status})</span>
          )}
        </div>
      )}

      {apiStatus.status === "success" && (
        <dl className={styles.details}>
          <dt>API</dt>
          <dd>{apiStatus.info.name}</dd>
          <dt>Version</dt>
          <dd>{apiStatus.info.version}</dd>
          <dt>Environment</dt>
          <dd>{apiStatus.info.environment}</dd>
          <dt>Database</dt>
          <dd
            className={apiStatus.health.db === "connected" ? styles.textSuccess : styles.textDanger}
          >
            {apiStatus.health.db}
          </dd>
          <dt>Uptime</dt>
          <dd>{formatUptime(apiStatus.health.uptime)}</dd>
          <dt>Server time</dt>
          <dd>{new Date(apiStatus.info.timestamp).toLocaleString()}</dd>
        </dl>
      )}

      <button
        type="button"
        className={styles.button}
        onClick={apiStatus.retry}
        disabled={apiStatus.status === "loading"}
      >
        {apiStatus.status === "loading" ? "Checking…" : "Check again"}
      </button>
    </section>
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
