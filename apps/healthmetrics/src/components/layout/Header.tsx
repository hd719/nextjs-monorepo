import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfileMenu } from "./ProfileMenu";

export function Header() {
  return (
    <header className="header-container">
      <div className="header-inner">
        {/* Mobile logo */}
        <div className="header-mobile-logo">
          <h1 className="header-logo-text">
            <span className="header-logo-accent">Health</span>Metrics
          </h1>
        </div>

        {/* Search bar */}
        <div className="header-search-container">
          <div className="header-search-wrapper">
            <Search className="header-search-icon" />
            <input
              type="search"
              placeholder="Search foods, exercises..."
              className="header-search-input"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="header-actions">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="header-mobile-search-button"
            aria-label="Search"
          >
            <Search className="header-icon" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="header-icon" />
          </Button>

          {/* Profile Menu */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
