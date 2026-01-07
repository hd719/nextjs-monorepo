import { useState } from "react";
import {
  Trophy,
  Flame,
  Utensils,
  Target,
  Dumbbell,
  Droplets,
  Medal,
  Zap,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAchievementDefinitions, useUserAchievements } from "@/hooks";
import type { AchievementCategory } from "@/types";

interface AchievementsGalleryProps {
  userId: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  utensils: <Utensils className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />,
  trophy: <Trophy className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  dumbbell: <Dumbbell className="w-6 h-6" />,
  droplets: <Droplets className="w-6 h-6" />,
  medal: <Medal className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
};

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  logging: "Logging",
  streaks: "Streaks",
  goals: "Goals",
  exercise: "Exercise",
};

// Mock data toggle - uses environment variable for consistency with dashboard
const useMockAchievements =
  import.meta.env.VITE_USE_MOCK_ACHIEVEMENTS === "true";
const MOCK_DEFINITIONS = [
  {
    key: "first_log",
    name: "First Steps",
    description: "Log your first meal",
    icon: "utensils",
    category: "logging",
    points: 10,
  },
  {
    key: "week_streak",
    name: "Week Warrior",
    description: "Maintain a 7-day logging streak",
    icon: "flame",
    category: "streaks",
    points: 50,
  },
  {
    key: "month_streak",
    name: "Monthly Master",
    description: "Maintain a 30-day logging streak",
    icon: "trophy",
    category: "streaks",
    points: 200,
  },
  {
    key: "calorie_goal",
    name: "Goal Getter",
    description: "Hit your calorie goal 5 days in a row",
    icon: "target",
    category: "goals",
    points: 75,
  },
  {
    key: "first_workout",
    name: "Gym Starter",
    description: "Log your first workout",
    icon: "dumbbell",
    category: "exercise",
    points: 15,
  },
  {
    key: "10_workouts",
    name: "Fitness Fan",
    description: "Complete 10 workouts",
    icon: "medal",
    category: "exercise",
    points: 100,
  },
  {
    key: "hydration_hero",
    name: "Hydration Hero",
    description: "Log 8 glasses of water for 7 days",
    icon: "droplets",
    category: "goals",
    points: 60,
  },
  {
    key: "quick_logger",
    name: "Quick Logger",
    description: "Log 50 meals",
    icon: "zap",
    category: "logging",
    points: 80,
  },
];
const MOCK_USER_ACHIEVEMENTS = [
  { key: "first_log", unlockedAt: "2024-12-15T10:00:00Z" },
  { key: "week_streak", unlockedAt: "2024-12-22T08:30:00Z" },
  { key: "first_workout", unlockedAt: "2024-12-18T14:00:00Z" },
  { key: "calorie_goal", unlockedAt: "2024-12-28T09:00:00Z" },
  { key: "quick_logger", unlockedAt: "2025-01-02T11:00:00Z" },
];

export function AchievementsGallery({ userId }: AchievementsGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    AchievementCategory | "all"
  >("all");
  const { data: definitions, isLoading: loadingDefs } =
    useAchievementDefinitions();
  const { data: userAchievements, isLoading: loadingUser } =
    useUserAchievements(userId);

  const isLoading = (loadingDefs || loadingUser) && !useMockAchievements;

  // Use mock data or real data
  const displayDefinitions = useMockAchievements
    ? MOCK_DEFINITIONS
    : definitions;
  const displayUserAchievements = useMockAchievements
    ? MOCK_USER_ACHIEVEMENTS
    : userAchievements;

  // Create set of unlocked achievement keys
  const unlockedKeys = new Set(
    displayUserAchievements?.map((ua) => ua.key) ?? []
  );

  // Filter by category
  const filteredDefs =
    displayDefinitions?.filter((def) =>
      selectedCategory === "all" ? true : def.category === selectedCategory
    ) ?? [];

  // Get unlock date for an achievement
  const getUnlockDate = (key: string) => {
    const ua = displayUserAchievements?.find((a) => a.key === key);
    if (!ua) return null;
    return new Date(ua.unlockedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card variant="supporting" className="achievements-gallery-card">
        <CardContent className="achievements-gallery-loading">
          <div className="loading-spinner" />
          <span>Loading achievements...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="supporting" className="achievements-gallery-card">
      <CardContent className="achievements-gallery-content">
        <div className="achievements-gallery-header">
          <h3 className="achievements-gallery-title">
            <Trophy className="w-5 h-5 text-amber-400" />
            Achievements
          </h3>

          {/* Category Filter */}
          <div className="achievements-category-filter">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`achievements-filter-btn ${selectedCategory === "all" ? "active" : ""}`}
            >
              All
            </button>
            {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`achievements-filter-btn ${selectedCategory === cat ? "active" : ""}`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              )
            )}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="achievements-grid">
          {filteredDefs.map((def) => {
            const isUnlocked = unlockedKeys.has(def.key);
            const unlockDate = getUnlockDate(def.key);

            return (
              <div
                key={def.key}
                className={`achievement-card ${isUnlocked ? "achievement-unlocked" : "achievement-locked"}`}
              >
                <div
                  className={`achievement-icon ${isUnlocked ? "achievement-icon-unlocked" : ""}`}
                >
                  {isUnlocked ? (
                    ICON_MAP[def.icon] || <Trophy className="w-6 h-6" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
                <div className="achievement-info">
                  <span className="achievement-name">{def.name}</span>
                  <span className="achievement-description">
                    {def.description}
                  </span>
                  {isUnlocked && unlockDate && (
                    <span className="achievement-unlock-date">
                      Unlocked {unlockDate}
                    </span>
                  )}
                </div>
                <div className="achievement-points">
                  <span className="achievement-points-value">{def.points}</span>
                  <span className="achievement-points-label">pts</span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDefs.length === 0 && (
          <div className="achievements-empty">
            <Trophy className="w-12 h-12 text-gray-500 mb-4" />
            <p>No achievements in this category yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
