import { APP_NAME } from "../../components/Logo";
import { Card } from "../../components/ui/Card";
import { Icon, type IconName } from "../../components/ui/Icon";
import { Lozenge } from "../../components/ui/Lozenge";
import { PageHeader } from "../../components/ui/PageHeader";
import { ROUTES } from "../../constants/route.constant";
import SystemStatus from "../Home";
import styles from "./Admin.module.css";

const UPCOMING: { title: string; text: string; icon: IconName }[] = [
  {
    title: "User management",
    text: "Invite people, change roles, deactivate accounts.",
    icon: "users",
  },
  { title: "Security", text: "Session policies and sign-in activity.", icon: "lock" },
  { title: "Email", text: "Delivery settings for notifications and resets.", icon: "mail" },
];

// Admin-only (guarded by RoleRoute in the router and by authorize() on the API)
export default function AdminPage() {
  return (
    <div className={styles.page}>
      <title>{`Admin · ${APP_NAME}`}</title>
      <PageHeader
        breadcrumbs={[
          { label: APP_NAME, to: ROUTES.DASHBOARD },
          { label: "Administration" },
          { label: "Admin console" },
        ]}
        title="Admin console"
        description="Workspace-wide settings and system health."
      />

      <div className={styles.grid}>
        <SystemStatus />

        <Card
          title="Workspace settings"
          meta={<Lozenge appearance="new">Coming next</Lozenge>}
          flush
        >
          <ul className={styles.list}>
            {UPCOMING.map((item) => (
              <li key={item.title} className={styles.item}>
                <span className={styles.itemIcon}>
                  <Icon name={item.icon} size={16} />
                </span>
                <div className={styles.itemText}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
