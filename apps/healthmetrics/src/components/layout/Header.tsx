import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfileMenu } from "./ProfileMenu";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center h-16 px-4 lg:px-6">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center flex-1">
          <h1 className="text-lg font-bold text-foreground">
            <span className="text-accent">Health</span>Metrics
          </h1>
        </div>

        {/* Search bar */}
        <div className="hidden lg:flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search foods, exercises..."
              className={cn(
                "w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background",
                "text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </Button>

          {/* Profile Menu */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
