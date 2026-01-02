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

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors hover:bg-accent/10 text-muted-foreground"
              activeProps={{
                className:
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors text-accent",
              }}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
