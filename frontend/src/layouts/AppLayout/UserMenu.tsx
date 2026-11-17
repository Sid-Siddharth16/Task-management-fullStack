import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/ui/Icon";
import { RoleBadge } from "../../components/ui/RoleBadge";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/user.helper";
import styles from "./UserMenu.module.css";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const handleLogout = async () => {
    setSigningOut(true);
    await logout();
  };

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
      >
        <span className={styles.avatar} aria-hidden="true">
          {getInitials(user.name)}
        </span>
      </button>

      {open && (
        <div className={styles.dropdown} role="menu" aria-label="Account">
          <p className={styles.heading}>Account</p>
          <div className={styles.profile}>
            <span className={styles.avatarLarge} aria-hidden="true">
              {getInitials(user.name)}
            </span>
            <div className={styles.identity}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <div className={styles.roleRow}>
            <span>Workspace role</span>
            <RoleBadge role={user.role} />
          </div>
          <div className={styles.divider} role="separator" />
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={handleLogout}
            disabled={signingOut}
            autoFocus
          >
            <Icon name="logout" size={16} />
            {signingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
