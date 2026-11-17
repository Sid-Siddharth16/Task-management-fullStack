import { ROLE_LABELS } from "../../../constants/auth.constant";
import type { Role } from "../../../types/auth.types";
import styles from "./RoleBadge.module.css";

export function RoleBadge({ role }: { role: Role }) {
  return <span className={`${styles.badge} ${styles[role]}`}>{ROLE_LABELS[role]}</span>;
}
