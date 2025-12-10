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
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Activity</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-4 border-b last:border-0"
                  >
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
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
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {activity.timeAgo}
                        </span>
                        {activity.duration && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {activity.duration}
                            </span>
                          </>
                        )}
                        {activity.calories && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-accent font-medium">
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
