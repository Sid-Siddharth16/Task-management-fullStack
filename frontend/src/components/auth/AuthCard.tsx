import type { ReactNode } from "react";
import { APP_NAME } from "../Logo";
import styles from "./AuthCard.module.css";

interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, footer, children }: AuthCardProps) {
  return (
    <section className={styles.card} aria-labelledby="auth-card-title">
      <title>{`${title} · ${APP_NAME}`}</title>
      <header className={styles.header}>
        <h1 id="auth-card-title" className={styles.title}>
          {title}
        </h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>
      {children}
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
