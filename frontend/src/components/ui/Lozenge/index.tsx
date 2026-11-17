import type { ReactNode } from "react";
import styles from "./Lozenge.module.css";

export type LozengeAppearance = "default" | "inprogress" | "success" | "removed" | "new" | "moved";

export function Lozenge({
  appearance = "default",
  children,
}: {
  appearance?: LozengeAppearance;
  children: ReactNode;
}) {
  return <span className={`${styles.lozenge} ${styles[appearance]}`}>{children}</span>;
}
