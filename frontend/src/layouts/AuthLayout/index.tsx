import { Suspense } from "react";
import { Link, Outlet } from "react-router";
import { APP_NAME, LogoMark } from "../../components/Logo";
import { Spinner } from "../../components/ui/Spinner";
import { ROUTES } from "../../constants/route.constant";
import styles from "./AuthLayout.module.css";

export default function AuthLayout() {
  return (
    <div className={styles.page}>
      <ArtLeft />
      <ArtRight />

      <main className={styles.main}>
        <div className={styles.card}>
          <Link to={ROUTES.HOME} className={styles.brand}>
            <LogoMark size={32} />
            <span>{APP_NAME}</span>
          </Link>
          <Suspense
            fallback={
              <div className={styles.cardFallback}>
                <Spinner size="lg" label="Loading…" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>

        <footer className={styles.footer}>
          <p>One workspace for planning, tracking and shipping work.</p>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {APP_NAME}
          </p>
        </footer>
      </main>
    </div>
  );
}

// Decorative corner illustrations (abstract boards and cards)
function ArtLeft() {
  return (
    <svg className={styles.artLeft} viewBox="0 0 400 300" aria-hidden="true" focusable="false">
      <rect x="40" y="70" width="190" height="200" rx="14" className={styles.artPanel} />
      <rect x="60" y="94" width="68" height="10" rx="5" className={styles.artBlue} />
      <rect x="60" y="120" width="150" height="40" rx="6" className={styles.artCard} />
      <rect x="60" y="170" width="150" height="40" rx="6" className={styles.artCard} />
      <rect x="60" y="220" width="110" height="34" rx="6" className={styles.artCard} />
      <rect x="72" y="134" width="70" height="8" rx="4" className={styles.artLine} />
      <rect x="72" y="184" width="96" height="8" rx="4" className={styles.artLine} />
      <circle cx="192" cy="140" r="8" className={styles.artPurple} />
      <circle cx="192" cy="190" r="8" className={styles.artGreen} />
      <rect x="250" y="150" width="120" height="120" rx="14" className={styles.artPanel} />
      <rect x="268" y="172" width="44" height="10" rx="5" className={styles.artGreen} />
      <rect x="268" y="196" width="84" height="30" rx="6" className={styles.artCard} />
      <path d="m280 246 10 10 22-22" className={styles.artCheck} />
    </svg>
  );
}

function ArtRight() {
  return (
    <svg className={styles.artRight} viewBox="0 0 400 300" aria-hidden="true" focusable="false">
      <circle cx="300" cy="120" r="70" className={styles.artPurpleSoft} />
      <rect x="150" y="90" width="200" height="180" rx="14" className={styles.artPanel} />
      <rect x="170" y="112" width="58" height="10" rx="5" className={styles.artPurple} />
      <rect x="170" y="140" width="76" height="110" rx="6" className={styles.artCard} />
      <rect x="256" y="140" width="76" height="70" rx="6" className={styles.artCard} />
      <rect x="180" y="152" width="48" height="8" rx="4" className={styles.artLine} />
      <rect x="266" y="152" width="40" height="8" rx="4" className={styles.artLine} />
      <rect x="180" y="170" width="30" height="8" rx="4" className={styles.artBlue} />
      <circle cx="60" cy="230" r="26" className={styles.artBlueSoft} />
    </svg>
  );
}
