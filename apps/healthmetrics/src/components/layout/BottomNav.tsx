import { Link } from "@tanstack/react-router";
import {
  Home,
  Book,
  Dumbbell,
  TrendingUp,
  User,
  Moon,
  Trophy,
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Book, label: "Diary", href: "/diary" },
  { icon: Dumbbell, label: "Exercise", href: "/exercise" },
  { icon: Moon, label: "Sleep", href: "/sleep" },
  { icon: Trophy, label: "Achievements", href: "/achievements" },
  { icon: TrendingUp, label: "Progress", href: "/progress" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav-container">
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="bottom-nav-link"
              activeProps={{
                className: "bottom-nav-link-active",
              }}
            >
              <Icon className="bottom-nav-icon" />
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
