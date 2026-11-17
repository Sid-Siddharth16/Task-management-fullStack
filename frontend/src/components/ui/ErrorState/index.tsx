import type { ReactNode } from "react";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  code: string;
  title: string;
  text: ReactNode;
  actions?: ReactNode;
  // fill the viewport (pages rendered outside the app shell)
  fullPage?: boolean;
  role?: "alert";
  children?: ReactNode;
}

export function ErrorState({
  code,
  title,
  text,
  actions,
  fullPage,
  role,
  children,
}: ErrorStateProps) {
  return (
    <section role={role} className={`${styles.wrapper} ${fullPage ? styles.fullPage : ""}`}>
      <p className={styles.code} aria-hidden="true">
        {code}
      </p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{text}</p>
      {actions && <div className={styles.actions}>{actions}</div>}
      {children}
    </section>
  );
}
