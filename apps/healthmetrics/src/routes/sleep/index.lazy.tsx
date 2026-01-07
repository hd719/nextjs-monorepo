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
import { AppLayout } from "@/components/layout";
import {
  SleepLogTable,
  SleepAnalytics,
  SleepInsights,
  LogSleepDialog,
} from "@/components/sleep";

export const Route = createLazyFileRoute("/sleep/")({
  component: SleepPage,
});

function SleepPage() {
  const { user } = Route.useRouteContext();

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
