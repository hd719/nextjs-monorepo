import { Link } from "@tanstack/react-router";
import { Home, Book, Dumbbell, TrendingUp, User } from "lucide-react";

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

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:border-r lg:border-border lg:bg-card">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">
          <span className="text-accent">Health</span>Metrics
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              activeProps={{
                className:
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-accent text-accent-foreground",
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
