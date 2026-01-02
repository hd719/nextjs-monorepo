import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInner}>
            <Link to="/" className={styles.logoLink}>
              <div className={styles.logoIcon}>
                <Activity className={styles.iconSvg} />
              </div>
              <span className={styles.logoText}>HealthMetrics</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
