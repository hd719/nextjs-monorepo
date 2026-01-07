/**
 * Achievements & Streaks Page (Lazy Loaded)
 *
 * Gamification dashboard showing user progress.
 *
 * Features:
 * - Current and best streaks
 * - Achievement gallery with progress
 * - Total points and unlock history
 */

import { createLazyFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout";
import {
  StreaksDashboard,
  AchievementsGallery,
  AchievementsSummary,
} from "@/components/achievements";

export const Route = createLazyFileRoute("/achievements/")({
  component: AchievementsPage,
});

function AchievementsPage() {
  const { user } = Route.useRouteContext();

  return (
    <AppLayout>
      <div className="achievements-page">
        {/* Page Header */}
        <div className="achievements-page-header animate-fade-slide-in">
          <h1 className="achievements-page-title">Achievements & Streaks</h1>
          <p className="achievements-page-subtitle">
            Track your progress and unlock rewards
          </p>
        </div>

        {/* Summary Stats */}
        <div className="animate-fade-slide-in animate-stagger-1">
          <AchievementsSummary userId={user.id} />
        </div>

        {/* Streaks Dashboard */}
        <div className="animate-fade-slide-in animate-stagger-2">
          <StreaksDashboard userId={user.id} />
        </div>

        {/* Achievements Gallery */}
        <div className="animate-fade-slide-in animate-stagger-3">
          <AchievementsGallery userId={user.id} />
        </div>
      </div>
    </AppLayout>
  );
}
