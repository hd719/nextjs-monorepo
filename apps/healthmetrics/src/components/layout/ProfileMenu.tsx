import { useState } from "react";
import { User, LogOut, Moon, Sun } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ui/theme-provider";
import { authClient } from "@/lib";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";

export function ProfileMenu() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);

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
    navigate({ to: ROUTES.PROFILE });
  };

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await authClient.signOut();
      navigate({ to: ROUTES.HOME });
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Logout failed. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Profile menu">
          <User className="profile-menu-icon" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "profile-menu-content",
          isDarkMode
            ? "profile-menu-content-dark"
            : "profile-menu-content-light"
        )}
      >
        <DropdownMenuLabel
          className={
            isDarkMode ? "profile-menu-label-dark" : "profile-menu-label-light"
          }
        >
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator
          className={
            isDarkMode
              ? "profile-menu-separator-dark"
              : "profile-menu-separator-light"
          }
        />
        {logoutError && (
          <div className="px-2 pb-2">
            <Alert variant="destructive">
              <AlertDescription>{logoutError}</AlertDescription>
            </Alert>
          </div>
        )}
        <DropdownMenuItem
          onClick={handleProfileClick}
          className={cn(
            "profile-menu-item",
            isDarkMode ? "profile-menu-item-dark" : "profile-menu-item-light"
          )}
        >
          <User className="profile-menu-item-icon" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleToggleTheme}
          className={cn(
            "profile-menu-item",
            isDarkMode ? "profile-menu-item-dark" : "profile-menu-item-light"
          )}
        >
          {isDarkMode ? (
            <>
              <Sun className="profile-menu-item-icon" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="profile-menu-item-icon" />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator
          className={
            isDarkMode
              ? "profile-menu-separator-dark"
              : "profile-menu-separator-light"
          }
        />
        <DropdownMenuItem
          onClick={handleLogout}
          className={cn(
            "profile-menu-item",
            isDarkMode ? "profile-menu-item-dark" : "profile-menu-item-light"
          )}
        >
          <LogOut className="profile-menu-item-icon" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
