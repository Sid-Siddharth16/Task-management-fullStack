import { useId, type ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  title?: ReactNode;
  // small text/lozenge next to the title
  meta?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  // drop body padding (tables, lists that run edge to edge)
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

// Dashboard "gadget": bordered panel with an optional header row
export function Card({ title, meta, actions, footer, flush, className, children }: CardProps) {
  const titleId = useId();
  return (
    <section
      className={`${styles.card} ${className ?? ""}`}
      aria-labelledby={title ? titleId : undefined}
    >
      {(title || actions) && (
        <header className={styles.header}>
          <div className={styles.heading}>
            {title && (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            )}
            {meta}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={flush ? styles.bodyFlush : styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
