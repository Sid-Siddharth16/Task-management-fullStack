import styles from "./Spinner.module.css";

export function Spinner({ size = "md", label }: { size?: "sm" | "md" | "lg"; label?: string }) {
  return (
    <span className={`${styles.spinner} ${styles[size]}`} role={label ? "status" : undefined}>
      {label && <span className="visually-hidden">{label}</span>}
    </span>
  );
}

export function FullPageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className={styles.fullPage}>
      <Spinner size="lg" label={label} />
    </div>
  );
}
