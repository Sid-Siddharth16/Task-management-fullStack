import {
  getPasswordRequirements,
  getPasswordStrength,
  STRENGTH_LABELS,
} from "../../../utils/passwordStrength";
import styles from "./PasswordStrength.module.css";

const LEVEL_CLASS = [styles.level0, styles.level1, styles.level2, styles.level3, styles.level4];

export function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const requirements = getPasswordRequirements(password);

  return (
    <div className={styles.wrapper}>
      <div className={styles.meterRow}>
        <div className={`${styles.meter} ${LEVEL_CLASS[strength]}`} aria-hidden="true">
          {[1, 2, 3, 4].map((segment) => (
            <span key={segment} className={segment <= strength ? styles.filled : undefined} />
          ))}
        </div>
        <span className={styles.label} aria-live="polite">
          {password ? STRENGTH_LABELS[strength] : ""}
        </span>
      </div>
      <ul className={styles.requirements}>
        {requirements.map((req) => (
          <li key={req.label} className={req.met ? styles.met : undefined}>
            <span aria-hidden="true">{req.met ? "✓" : "•"}</span>
            {req.label}
            <span className="visually-hidden">{req.met ? " (done)" : " (required)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
