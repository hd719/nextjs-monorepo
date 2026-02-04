/**
 * Sleep Tracking Page (Lazy Loaded)
 *
 * Comprehensive sleep tracking with logging table and analytics.
 *
 * Features:
 * - Sleep logging table (add/edit/delete entries)
 * - Weekly and monthly analytics
 * - Sleep quality insights
 * - Trend visualization
 */

import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout";
import {
  SleepLogTable,
  SleepAnalytics,
  SleepInsights,
  LogSleepDialog,
} from "@/components/sleep";
import { getWhoopIntegrationStatus } from "@/server/integrations";

export const Route = createLazyFileRoute("/sleep/")({
  component: SleepPage,
});

function SleepPage() {
  const { user } = Route.useRouteContext();
  const statusQuery = useQuery({
    queryKey: ["whoop-integration-status"],
    queryFn: async () => getWhoopIntegrationStatus(),
  });

  const isWhoopConnected = statusQuery.data?.status === "connected";

  return (
    <AppLayout>
      <div className="sleep-page">
        {/* Page Header */}
        <div className="sleep-page-header animate-fade-slide-in">
          <div className="sleep-page-header-content">
            <h1 className="sleep-page-title">Sleep Tracking</h1>
            <p className="sleep-page-subtitle">
              Track your sleep patterns and improve your rest
            </p>
            <div className="sleep-page-source">
              {statusQuery.isLoading ? (
                <span className="sleep-source-badge sleep-source-badge--loading">
                  Checking source…
                </span>
              ) : isWhoopConnected ? (
                <span className="sleep-source-badge sleep-source-badge--whoop">
                  WHOOP Connected • Using wearable data
                </span>
              ) : (
                <span className="sleep-source-badge sleep-source-badge--manual">
                  Manual sleep tracking
                </span>
              )}
            </div>
          </div>
          <LogSleepDialog userId={user.id} />
        </div>

        {/* Analytics Cards */}
        <div className="animate-fade-slide-in animate-stagger-1">
          <SleepAnalytics userId={user.id} />
        </div>

        {/* Insights */}
        <div className="animate-fade-slide-in animate-stagger-2">
          <SleepInsights userId={user.id} />
        </div>

        {/* Sleep Log Table */}
        <div className="animate-fade-slide-in animate-stagger-3">
          <SleepLogTable userId={user.id} />
        </div>
      </div>
    </AppLayout>
  );
}
