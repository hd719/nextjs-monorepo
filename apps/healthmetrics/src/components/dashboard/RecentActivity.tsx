import { Dumbbell, Scale, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity } from "@/types/nutrition";

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
  return (
    <section className="dashboard-activity-section">
      <h2 className="dashboard-activity-heading">Recent Activity</h2>

      <Card>
        <CardHeader>
          <CardTitle className="dashboard-activity-title">
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="dashboard-activity-content">
            {isLoading ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="dashboard-activity-loading-item">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="dashboard-activity-loading-content">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const Icon = activityIcons[activity.type];
                return (
                  <div key={activity.id} className="dashboard-activity-item">
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
                icon={TrendingUp}
                title="No recent activity"
                description="Log meals and exercises to see your activity here"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
