import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfileMenu } from "./ProfileMenu";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Mobile logo */}
        <div className={styles.mobileLogo}>
          <h1 className={styles.logoText}>
            <span className={styles.logoAccent}>Health</span>Metrics
          </h1>
        </div>

        {/* Search bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Search foods, exercises..."
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className={styles.actions}>
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className={styles.mobileSearchButton}
            aria-label="Search"
          >
            <Search className={styles.icon} />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className={styles.icon} />
          </Button>

          {/* Profile Menu */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
