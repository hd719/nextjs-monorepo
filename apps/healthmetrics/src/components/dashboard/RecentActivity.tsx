import { Dumbbell, Scale, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity } from "@/types/nutrition";
import styles from "./RecentActivity.module.css";

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
    <section className={styles.section}>
      <h2 className={styles.heading}>Recent Activity</h2>

      <Card>
        <CardHeader>
          <CardTitle className={styles.title}>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.content}>
            {isLoading ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.loadingItem}>
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className={styles.loadingContent}>
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
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.iconContainer}>
                      <Icon className={styles.icon} />
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.description}>
                        {activity.description}
                      </p>
                      <div className={styles.metadata}>
                        <span className={styles.metaText}>
                          {activity.timeAgo}
                        </span>
                        {activity.duration && (
                          <>
                            <span className={styles.metaText}>•</span>
                            <span className={styles.metaText}>
                              {activity.duration}
                            </span>
                          </>
                        )}
                        {activity.calories && (
                          <>
                            <span className={styles.metaText}>•</span>
                            <span className={styles.calories}>
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
