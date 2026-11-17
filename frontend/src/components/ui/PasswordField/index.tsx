import { useState } from "react";
import { TextField, type TextFieldProps } from "../TextField";
import styles from "./PasswordField.module.css";

export function PasswordField(props: Omit<TextFieldProps, "type" | "endAdornment">) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      // stop mobile keyboards from "fixing" passwords
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      endAdornment={
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}

const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.7 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.2M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m2 2 20 20" />
  </svg>
);
