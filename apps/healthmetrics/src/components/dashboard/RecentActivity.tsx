import { Dumbbell, Scale, Target } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity } from "@/types";
import { ROUTES } from "@/constants/routes";

export interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
}

const activityIcons = {
  exercise: Dumbbell,
  weight: Scale,
  goal: Target,
};

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  const navigate = useNavigate();

  return (
    <section className="dashboard-activity-section">
      <h2 className="dashboard-activity-heading">Recent Activity</h2>

      <Card variant="supporting">
        <CardContent>
          <div className="dashboard-activity-content">
            {isLoading ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="dashboard-activity-loading-item">
                    <Skeleton className="skeleton-avatar" />
                    <div className="dashboard-activity-loading-content">
                      <Skeleton className="skeleton-md" />
                      <Skeleton className="skeleton-sm" />
                    </div>
                  </div>
                ))}
              </>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const Icon = activityIcons[activity.type];
                return (
                  <div
                    key={activity.id}
                    className="dashboard-activity-item row-hover"
                  >
                    <div className="dashboard-activity-icon-container">
                      <Icon className="dashboard-activity-icon" />
                    </div>
                    <div className="dashboard-activity-item-content">
                      <p className="dashboard-activity-description">
                        {activity.description}
                      </p>
                      <div className="dashboard-activity-metadata">
                        <span className="dashboard-activity-meta-text">
                          {activity.timeAgo}
                        </span>
                        {activity.duration && (
                          <>
                            <span className="dashboard-activity-meta-text">
                              •
                            </span>
                            <span className="dashboard-activity-meta-text">
                              {activity.duration}
                            </span>
                          </>
                        )}
                        {activity.calories && (
                          <>
                            <span className="dashboard-activity-meta-text">
                              •
                            </span>
                            <span className="dashboard-activity-calories">
                              {activity.calories} cal
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon={Dumbbell}
                title="No recent activity"
                description="Start your health journey by logging a workout"
                action={{
                  label: "Log Your First Workout",
                  onClick: () => navigate({ to: ROUTES.EXERCISE }),
                }}
                framed={false}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
