import { Link } from "@tanstack/react-router";
import { Home, Book, Dumbbell, TrendingUp, User } from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Book, label: "Diary", href: "/diary" },
  { icon: Dumbbell, label: "Exercise", href: "/exercise" },
  { icon: TrendingUp, label: "Progress", href: "/progress" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function Sidebar() {
  return (
    <aside className="sidebar-container">
      {/* Logo */}
      <div className="sidebar-logo">
        <h1 className="sidebar-logo-text">
          <span className="sidebar-logo-accent">Health</span>Metrics
        </h1>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="sidebar-nav-link"
              activeProps={{
                className: "sidebar-nav-link-active",
              }}
            >
              <Icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
