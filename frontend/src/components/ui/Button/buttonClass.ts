import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

// Shared so router <Link>s can look exactly like buttons
export function buttonClass({
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconOnly?: boolean;
  className?: string;
} = {}) {
  return [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    iconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
