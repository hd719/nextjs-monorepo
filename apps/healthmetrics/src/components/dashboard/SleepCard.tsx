import { Moon, Clock, Star, BedDouble } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "@/constants/routes";
import type { SleepCardData } from "@/types";

export interface SleepCardProps {
  data: SleepCardData | null;
  isLoading?: boolean;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function QualityStars({ quality }: { quality: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= quality
              ? "fill-warning text-warning"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function SleepCard({ data, isLoading }: SleepCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="dashboard-sleep-section">
        <Skeleton className="skeleton-xl" />
        <Card variant="supporting">
          <CardHeader>
            <Skeleton className="skeleton-lg" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-sleep-loading-grid">
              {["hours", "quality", "bedtime"].map((stat) => (
                <div key={stat} className="dashboard-sleep-loading-item">
                  <Skeleton className="skeleton-icon-lg" />
                  <Skeleton className="skeleton-value-sm" />
                  <Skeleton className="skeleton-label" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!data || !data.hasEntry) {
    return (
      <section className="dashboard-sleep-section">
        <h2 className="dashboard-sleep-heading">Last Night&apos;s Sleep</h2>
        <EmptyState
          icon={Moon}
          title="No sleep logged"
          description="Track your sleep to improve your rest and recovery"
          action={{
            label: "Log Sleep",
            onClick: () => navigate({ to: ROUTES.SLEEP }),
          }}
          clickable
        />
      </section>
    );
  }

  return (
    <section className="dashboard-sleep-section">
      <h2 className="dashboard-sleep-heading">Last Night&apos;s Sleep</h2>
      <Card variant="supporting" className="dashboard-card-stretch">
        <CardHeader>
          <CardTitle className="dashboard-sleep-title">Sleep Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="dashboard-sleep-grid">
            {/* Hours Slept */}
            <div className="dashboard-sleep-stat-item">
              <div className="dashboard-sleep-icon-container">
                <Clock className="dashboard-sleep-icon" />
              </div>
              <div className="dashboard-sleep-value">
                {data.hoursSlept.toFixed(1)}
              </div>
              <div className="dashboard-sleep-label">hours</div>
            </div>

            {/* Quality */}
            <div className="dashboard-sleep-stat-item">
              <div className="dashboard-sleep-icon-container-warning">
                <Star className="dashboard-sleep-icon-warning" />
              </div>
              <div className="dashboard-sleep-value-stars">
                <QualityStars quality={data.quality} />
              </div>
              <div className="dashboard-sleep-label">quality</div>
            </div>

            {/* Bedtime */}
            <div className="dashboard-sleep-stat-item">
              <div className="dashboard-sleep-icon-container-accent">
                <BedDouble className="dashboard-sleep-icon-accent" />
              </div>
              <div className="dashboard-sleep-value-small">
                {formatTime(data.bedtime)}
              </div>
              <div className="dashboard-sleep-label">bedtime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
