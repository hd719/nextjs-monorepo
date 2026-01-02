import { Link } from "@tanstack/react-router";
import { Home, Book, Dumbbell, TrendingUp, User } from "lucide-react";
import styles from "./BottomNav.module.css";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Book, label: "Diary", href: "/diary" },
  { icon: Dumbbell, label: "Exercise", href: "/exercise" },
  { icon: TrendingUp, label: "Progress", href: "/progress" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function BottomNav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={styles.navLink}
              activeProps={{
                className: styles.navLinkActive,
              }}
            >
              <Icon className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
