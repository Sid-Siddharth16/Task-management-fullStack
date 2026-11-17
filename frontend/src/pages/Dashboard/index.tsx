import { Link } from "react-router";
import { Can } from "../../components/auth/Can";
import { APP_NAME } from "../../components/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Icon, type IconName } from "../../components/ui/Icon";
import { Lozenge, type LozengeAppearance } from "../../components/ui/Lozenge";
import { PageHeader } from "../../components/ui/PageHeader";
import { RoleBadge } from "../../components/ui/RoleBadge";
import { ROLES } from "../../constants/auth.constant";
import { ROUTES } from "../../constants/route.constant";
import { useAuth } from "../../hooks/useAuth";
import type { Role } from "../../types/auth.types";
import { getFirstName, getInitials } from "../../utils/user.helper";
import styles from "./Dashboard.module.css";

const PERMISSIONS: Record<Role, string[]> = {
  admin: ["Manage users and roles", "Create and archive projects", "Assign and track tasks"],
  manager: ["Create and manage projects", "Assign tasks to members", "View team members"],
  member: [
    "View projects you belong to",
    "Work on tasks assigned to you",
    "Comment and update status",
  ],
};

const STATS: { label: string; value: number; icon: IconName; tone: string }[] = [
  { label: "Assigned to me", value: 0, icon: "task", tone: styles.toneBlue },
  { label: "In progress", value: 0, icon: "clock", tone: styles.tonePurple },
  { label: "Done this week", value: 0, icon: "checkCircle", tone: styles.toneGreen },
];

const BOARD_COLUMNS: { title: string; appearance: LozengeAppearance }[] = [
  { title: "To do", appearance: "default" },
  { title: "In progress", appearance: "inprogress" },
  { title: "Done", appearance: "success" },
];

const greeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className={styles.page}>
      <title>{`Dashboard · ${APP_NAME}`}</title>

      <PageHeader
        breadcrumbs={[{ label: APP_NAME, to: ROUTES.DASHBOARD }, { label: "Dashboard" }]}
        title={`${greeting()}, ${getFirstName(user.name)}`}
        description="Here's what's happening across your workspace."
        actions={
          <Can roles={[ROLES.ADMIN, ROLES.MANAGER]}>
            <Button disabled title="Coming soon" iconBefore={<Icon name="plus" size={16} />}>
              New project
            </Button>
          </Can>
        }
      />

      <section className={styles.stats} aria-label="Task summary">
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={`${styles.statIcon} ${stat.tone}`}>
              <Icon name={stat.icon} size={20} />
            </span>
            <div className={styles.statText}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </div>
        ))}
      </section>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <Card title="Assigned to me" meta={<Lozenge>0</Lozenge>} flush>
            <div className={styles.tableHead} aria-hidden="true">
              <span>Summary</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Due</span>
            </div>
            <EmptyState
              title="You have no assigned work"
              text="Issues assigned to you will show up here, sorted by priority."
            />
          </Card>

          <Card
            title="Board overview"
            meta={<span className={styles.metaText}>All projects</span>}
            flush
          >
            <div className={styles.board} role="list" aria-label="Board columns">
              {BOARD_COLUMNS.map((column) => (
                <div key={column.title} className={styles.column} role="listitem">
                  <div className={styles.columnHeader}>
                    <Lozenge appearance={column.appearance}>{column.title}</Lozenge>
                    <span className={styles.columnCount}>0</span>
                  </div>
                  <div className={styles.columnEmpty}>No issues</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className={styles.sideCol} aria-label="About you">
          <Card title="Profile">
            <div className={styles.profile}>
              <span className={styles.avatar} aria-hidden="true">
                {getInitials(user.name)}
              </span>
              <div className={styles.profileText}>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>
            <dl className={styles.details}>
              <div>
                <dt>Role</dt>
                <dd>
                  <RoleBadge role={user.role} />
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <Lozenge appearance={user.isActive ? "success" : "removed"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Lozenge>
                </dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </Card>

          <Card
            title="Your access"
            footer={
              <>
                <Can roles={[ROLES.ADMIN]}>
                  <Link to={ROUTES.ADMIN} className={styles.footerLink}>
                    Open admin console
                    <Icon name="arrowRight" size={14} />
                  </Link>
                </Can>
                <Can roles={[ROLES.MANAGER, ROLES.MEMBER]}>
                  <p className={styles.muted}>Need more access? Ask a workspace admin.</p>
                </Can>
              </>
            }
          >
            <ul className={styles.permissions}>
              {PERMISSIONS[user.role].map((permission) => (
                <li key={permission}>
                  <span className={styles.permissionIcon}>
                    <Icon name="check" size={14} strokeWidth={2.5} />
                  </span>
                  {permission}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.empty}>
      <svg
        className={styles.emptyArt}
        width="120"
        height="88"
        viewBox="0 0 120 88"
        aria-hidden="true"
      >
        <rect x="14" y="10" width="92" height="68" rx="8" className={styles.artBack} />
        <rect x="24" y="22" width="72" height="12" rx="3" className={styles.artRow} />
        <rect x="24" y="40" width="72" height="12" rx="3" className={styles.artRow} />
        <rect x="24" y="58" width="44" height="12" rx="3" className={styles.artRow} />
        <circle cx="30" cy="28" r="3" className={styles.artDot} />
        <circle cx="30" cy="46" r="3" className={styles.artDot} />
        <circle cx="94" cy="68" r="14" className={styles.artBadge} />
        <path
          d="m88 68 4 4 8-8"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.muted}>{text}</p>
    </div>
  );
}
