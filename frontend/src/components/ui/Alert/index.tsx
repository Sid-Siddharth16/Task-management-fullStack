import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon";
import styles from "./Alert.module.css";

type AlertVariant = "error" | "success" | "info" | "warning";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
}

const ICONS: Record<AlertVariant, IconName> = {
  error: "error",
  success: "checkCircle",
  info: "info",
  warning: "error",
};

export function Alert({ variant = "info", title, children }: AlertProps) {
  return (
    // errors interrupt screen readers; success/info are announced politely
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`${styles.alert} ${styles[variant]}`}
    >
      <span className={styles.icon}>
        <Icon name={ICONS[variant]} size={20} />
      </span>
      <div className={styles.body}>
        {title && <strong className={styles.title}>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}
