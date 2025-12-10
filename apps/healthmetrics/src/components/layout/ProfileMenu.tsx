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

export function ProfileMenu() {
  const { theme, setTheme } = useTheme();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Profile menu">
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`w-56 shadow-lg ${
          isDarkMode
            ? "bg-[#020617] text-white border-slate-700"
            : "bg-white text-slate-900 border-slate-200"
        }`}
      >
        <DropdownMenuLabel
          className={isDarkMode ? "text-white" : "text-slate-900"}
        >
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator
          className={isDarkMode ? "bg-slate-700" : "bg-slate-200"}
        />
        <DropdownMenuItem
          className={`cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleToggleTheme}
          className={`cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          {isDarkMode ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator
          className={isDarkMode ? "bg-slate-700" : "bg-slate-200"}
        />
        <DropdownMenuItem
          className={`cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
