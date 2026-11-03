import { Link } from "react-router";
import { ROUTES } from "../../constants/route.constant";
import styles from "./NotFound.module.css";

export default function NotFoundPage() {
  return (
    <section className={styles.wrapper}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.text}>This page doesn't exist.</p>
      <Link to={ROUTES.HOME}>Go home</Link>
    </section>
  );
}
