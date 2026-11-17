import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Spinner } from "../Spinner";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./buttonClass";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  iconBefore?: ReactNode;
  // square button with only an icon; pass aria-label
  iconOnly?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  iconBefore,
  iconOnly = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, fullWidth, iconOnly, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : iconBefore}
      {children !== undefined && children !== null && <span>{children}</span>}
    </button>
  );
}
