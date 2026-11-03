import { Suspense } from "react";
import { Link, Outlet } from "react-router";
import { ROUTES } from "../../constants/route.constant";
import styles from "./RootLayout.module.css";

export default function RootLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.brand}>
          fullStack-2
        </Link>
      </header>
      <main className={styles.main}>
        <Suspense fallback={<p className={styles.fallback}>Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
