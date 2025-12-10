import { Dumbbell, Clock, Flame, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExerciseSummary as ExerciseSummaryType } from "@/types/nutrition";

export interface ExerciseSummaryProps {
  data: ExerciseSummaryType | null;
  isLoading?: boolean;
}

export function ExerciseSummary({ data, isLoading }: ExerciseSummaryProps) {
  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!data || data.exercisesCompleted === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Today's Exercise</h2>
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Dumbbell}
              title="No exercises logged today"
              description="Start your fitness journey by logging your first workout"
              action={{
                label: "Log Exercise",
                onClick: () => console.log("Log exercise clicked"),
              }}
            />
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Today's Exercise</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workout Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Time */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold">{data.totalMinutes}</div>
              <div className="text-sm text-muted-foreground">minutes</div>
            </div>

            {/* Calories Burned */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                <Flame className="w-6 h-6 text-destructive" />
              </div>
              <div className="text-2xl font-bold">{data.caloriesBurned}</div>
              <div className="text-sm text-muted-foreground">
                calories burned
              </div>
            </div>

            {/* Exercises Completed */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">
                {data.exercisesCompleted}
              </div>
              <div className="text-sm text-muted-foreground">
                {data.exercisesCompleted === 1 ? "exercise" : "exercises"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
