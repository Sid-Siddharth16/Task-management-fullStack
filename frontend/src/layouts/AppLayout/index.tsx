import { Suspense, useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router";
import { Can } from "../../components/auth/Can";
import { APP_NAME, LogoMark } from "../../components/Logo";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { Spinner } from "../../components/ui/Spinner";
import { ROLES } from "../../constants/auth.constant";
import { ROUTES } from "../../constants/route.constant";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import styles from "./AppLayout.module.css";
import { NavSearch } from "./NavSearch";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";

const SIDEBAR_ID = "app-sidebar";
const COLLAPSED_KEY = "taskflow.sidebarCollapsed";
const MOBILE_QUERY = "(max-width: 768px)";

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
};

export default function AppLayout() {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  // desktop: persistent collapse; mobile: off-canvas drawer
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const sidebarVisible = isMobile ? drawerOpen : !collapsed;

  const toggleSidebar = () => {
    if (isMobile) {
      setDrawerOpen((v) => !v);
      return;
    }
    setCollapsed((v) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, v ? "0" : "1");
      } catch {
        // storage unavailable: collapse still works for this visit
      }
      return !v;
    });
  };

  const closeDrawer = () => setDrawerOpen(false);

  // drawer: move focus in, close on Escape, return focus to the toggle
  useEffect(() => {
    if (!isMobile || !drawerOpen) return;
    sidebarRef.current?.querySelector<HTMLElement>("a[href], input")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDrawerOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobile, drawerOpen]);

  return (
    <div
      className={styles.shell}
      data-sidebar={sidebarVisible ? "open" : "closed"}
      data-layout={isMobile ? "mobile" : "desktop"}
    >
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>

      <header className={styles.topNav}>
        <div className={styles.left}>
          <Button
            ref={toggleRef}
            variant="ghost"
            iconOnly
            onClick={toggleSidebar}
            aria-controls={SIDEBAR_ID}
            aria-expanded={sidebarVisible}
            aria-label={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
            iconBefore={<Icon name={isMobile ? "menu" : "chevronsLeft"} size={18} />}
            className={styles.toggle}
          />
          <Link to={ROUTES.DASHBOARD} className={styles.brand} aria-label={`${APP_NAME} home`}>
            <LogoMark size={24} />
            <span className={styles.brandName}>{APP_NAME}</span>
          </Link>
        </div>

        <div className={styles.center}>
          <NavSearch className={styles.search} shortcut />
          <Can roles={[ROLES.ADMIN, ROLES.MANAGER]}>
            <Button
              disabled
              title="Coming soon"
              iconBefore={<Icon name="plus" size={16} />}
              className={styles.create}
            >
              <span className={styles.createLabel}>Create</span>
            </Button>
          </Can>
        </div>

        <div className={styles.right}>
          <UserMenu />
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.sidebarSlot}>
          <Sidebar
            id={SIDEBAR_ID}
            ref={sidebarRef}
            hidden={!sidebarVisible}
            onNavigate={closeDrawer}
          />
        </div>
        {isMobile && drawerOpen && (
          <div className={styles.scrim} onClick={closeDrawer} aria-hidden="true" />
        )}

        <main id="main-content" className={styles.main} tabIndex={-1}>
          <div className={styles.mainInner}>
            <Suspense
              fallback={
                <div className={styles.fallback}>
                  <Spinner size="lg" label="Loading…" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
