import type { MouseEvent, Ref } from "react";
import { NavLink } from "react-router";
import { APP_NAME, LogoMark } from "../../components/Logo";
import { Icon } from "../../components/ui/Icon";
import { Lozenge } from "../../components/ui/Lozenge";
import { useAuth } from "../../hooks/useAuth";
import { getVisibleSections } from "./nav.config";
import { NavSearch } from "./NavSearch";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  id: string;
  hidden: boolean;
  onNavigate: () => void;
  ref?: Ref<HTMLElement>;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.item} ${isActive ? styles.itemActive : ""}`;

export function Sidebar({ id, hidden, onNavigate, ref }: SidebarProps) {
  const { hasRole } = useAuth();
  const sections = getVisibleSections(hasRole);

  // close the mobile drawer once a link is followed
  const onClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("a")) onNavigate();
  };

  return (
    <aside
      id={id}
      ref={ref}
      className={styles.sidebar}
      aria-label="Workspace navigation"
      inert={hidden}
      onClick={onClick}
    >
      <div className={styles.workspace}>
        <span className={styles.workspaceTile}>
          <LogoMark size={24} />
        </span>
        <div className={styles.workspaceText}>
          <strong>{APP_NAME}</strong>
          <span>Software workspace</span>
        </div>
      </div>

      <NavSearch className={styles.mobileSearch} onNavigate={onNavigate} />

      <nav className={styles.nav} aria-label="Main">
        {sections.map((section) => (
          <div key={section.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <ul className={styles.list}>
              {section.items.map((item) => (
                <li key={item.label}>
                  {item.to ? (
                    <NavLink to={item.to} className={linkClass} end>
                      <span className={styles.itemIcon}>
                        <Icon name={item.icon} size={16} />
                      </span>
                      <span className={styles.itemLabel}>{item.label}</span>
                    </NavLink>
                  ) : (
                    <span
                      className={`${styles.item} ${styles.itemDisabled}`}
                      aria-disabled="true"
                      title="Coming soon"
                    >
                      <span className={styles.itemIcon}>
                        <Icon name={item.icon} size={16} />
                      </span>
                      <span className={styles.itemLabel}>{item.label}</span>
                      <Lozenge>Soon</Lozenge>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <p className={styles.footer}>
        You&apos;re in a team-managed workspace. Boards and backlogs are on the way.
      </p>
    </aside>
  );
}
