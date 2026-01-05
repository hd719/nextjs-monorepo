import { Trophy, Target, Star, Dumbbell, Plus, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { Achievement, Milestone } from "@/types/progress";

interface AchievementsCardProps {
  achievements: Achievement[];
  milestones: Milestone[];
}

// Map icon names to Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  trophy: Trophy,
  target: Target,
  star: Star,
  dumbbell: Dumbbell,
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Individual achievement badge
 */
function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const Icon = ICON_MAP[achievement.icon] || Trophy;

  return (
    <div className="progress-achievement-item">
      <div className="progress-achievement-icon">
        <Icon className="progress-achievement-icon-inner" />
      </div>
      <div className="progress-achievement-content">
        <div className="progress-achievement-title">{achievement.title}</div>
        <div className="progress-achievement-date">
          {formatDate(achievement.earnedAt)}
        </div>
      </div>
    </div>
  );
}

/**
 * Milestone progress indicator
 */
function MilestoneItem({ milestone }: { milestone: Milestone }) {
  const progressPercent = Math.round(
    (milestone.progress / milestone.target) * 100
  );
  const remaining = milestone.target - milestone.progress;
  const isComplete = progressPercent >= 100;

  return (
    <div
      className="progress-milestone-item"
      role="group"
      aria-label={`${milestone.title}: ${progressPercent}% complete, ${remaining > 0 ? `${remaining.toFixed(1)} remaining` : "completed"}`}
    >
      {/* Progress ring indicator */}
      <div className="progress-milestone-ring-wrapper">
        <svg
          className="progress-milestone-ring"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
          {/* Background ring */}
          <circle
            className="progress-milestone-ring-bg"
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            strokeWidth="3"
          />
          {/* Progress ring */}
          <circle
            className={cn(
              "progress-milestone-ring-progress",
              isComplete && "progress-milestone-ring-complete"
            )}
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            strokeWidth="3"
            strokeDasharray={`${progressPercent}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="progress-milestone-ring-text">{progressPercent}%</span>
      </div>
      <div className="progress-milestone-content">
        <div className="progress-milestone-title">{milestone.title}</div>
        <div className="progress-milestone-progress">
          {remaining <= 0 ? (
            <span className="progress-text-success">Complete!</span>
          ) : (
            <>
              <span className="progress-milestone-remaining">
                {remaining.toFixed(1)}
              </span>{" "}
              to go
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AchievementsCard({
  achievements,
  milestones,
}: AchievementsCardProps) {
  // Show most recent achievements first
  const sortedAchievements = [...achievements].sort(
    (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
  );

  return (
    <Card variant="supporting" className="h-full">
      <CardContent className="progress-chart-card-fill">
        <div className="progress-achievements-section">
          <h3 className="progress-chart-title">
            <Trophy
              className="progress-chart-title-icon progress-icon-trophy"
              aria-hidden="true"
            />
            Achievements
          </h3>

          {/* Recent Achievements */}
          <div className="progress-achievements-recent">
            <h4 className="progress-achievements-heading">
              Recent Achievements
            </h4>
            <div className="progress-achievements-grid">
              {sortedAchievements.slice(0, 4).map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </div>

          {/* Upcoming Milestones */}
          {milestones.length > 0 && (
            <div className="progress-section-divider progress-milestones-section">
              <h4 className="progress-achievements-heading">
                Upcoming Milestones
              </h4>
              <div className="progress-milestones-list">
                {milestones.map((milestone, index) => (
                  <MilestoneItem key={index} milestone={milestone} />
                ))}
              </div>
            </div>
          )}

          {/* Motivational Footer + Set New Goal */}
          <div className="progress-achievements-footer">
            <div className="progress-achievements-motivation">
              <Sparkles
                className="progress-achievements-motivation-icon"
                aria-hidden="true"
              />
              <span>You're making great progress! Keep it up.</span>
            </div>
            <button className="progress-achievements-new-goal-btn">
              <Plus
                className="progress-achievements-new-goal-icon"
                aria-hidden="true"
              />
              Set New Goal
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
