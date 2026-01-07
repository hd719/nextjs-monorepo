import { useState, useRef, useEffect } from "react";
import { Search, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfileMenu } from "./ProfileMenu";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSearchOpen]);

  return (
    <header className="header-container">
      <div className="header-inner">
        {/* Mobile logo - hidden when search is open */}
        <div
          className={`header-mobile-logo ${isSearchOpen ? "header-mobile-logo-hidden" : ""}`}
        >
          <h1 className="header-logo-text">
            <span className="header-logo-accent">Health</span>Metrics
          </h1>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mobile search overlay */}
        <div
          className={`header-mobile-search-overlay ${isSearchOpen ? "header-mobile-search-overlay-open" : ""}`}
        >
          <div className="header-mobile-search-input-wrapper">
            <Search className="header-mobile-search-input-icon" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search foods, exercises..."
              className="header-mobile-search-input"
              onBlur={() => {
                // Small delay to allow click events to fire
                setTimeout(() => setIsSearchOpen(false), 150);
              }}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="header-mobile-search-close"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
          >
            <X className="header-icon" />
          </Button>
        </div>

        {/* Right side actions */}
        <div
          className={`header-actions ${isSearchOpen ? "header-actions-hidden" : ""}`}
        >
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="header-mobile-search-button"
            onClick={() => setIsSearchOpen(true)}
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
