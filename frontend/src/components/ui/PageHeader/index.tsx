import type { ReactNode } from "react";
import { Link } from "react-router";
import styles from "./PageHeader.module.css";

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`}>
                {crumb.to ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  <span aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className={styles.row}>
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
