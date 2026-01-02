import { User, Settings, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import styles from "./ProfileMenu.module.css";

export function ProfileMenu() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Helper to determine if we're in dark mode (for showing correct icon)
  const getIsDarkMode = () => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    // If theme is "system", check system preference
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  };

  const isDarkMode = getIsDarkMode();

  const handleToggleTheme = () => {
    // Toggle between light and dark
    setTheme(isDarkMode ? "light" : "dark");
  };

  const handleProfileClick = () => {
    navigate({ to: "/profile" });
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      navigate({ to: "/" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Profile menu">
          <User className={styles.menuIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          styles.menuContent,
          isDarkMode ? styles.menuContentDark : styles.menuContentLight
        )}
      >
        <DropdownMenuLabel
          className={isDarkMode ? styles.menuLabelDark : styles.menuLabelLight}
        >
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator
          className={isDarkMode ? styles.separatorDark : styles.separatorLight}
        />
        <DropdownMenuItem
          onClick={handleProfileClick}
          className={cn(
            styles.menuItem,
            isDarkMode ? styles.menuItemDark : styles.menuItemLight
          )}
        >
          <User className={styles.itemIcon} />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleProfileClick}
          className={cn(
            styles.menuItem,
            isDarkMode ? styles.menuItemDark : styles.menuItemLight
          )}
        >
          <Settings className={styles.itemIcon} />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleToggleTheme}
          className={cn(
            styles.menuItem,
            isDarkMode ? styles.menuItemDark : styles.menuItemLight
          )}
        >
          {isDarkMode ? (
            <>
              <Sun className={styles.itemIcon} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className={styles.itemIcon} />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator
          className={isDarkMode ? styles.separatorDark : styles.separatorLight}
        />
        <DropdownMenuItem
          onClick={handleLogout}
          className={cn(
            styles.menuItem,
            isDarkMode ? styles.menuItemDark : styles.menuItemLight
          )}
        >
          <LogOut className={styles.itemIcon} />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
