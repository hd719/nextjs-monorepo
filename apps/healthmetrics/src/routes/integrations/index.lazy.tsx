import { createLazyFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Activity, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startWhoopOAuth } from "@/server/integrations";

export const Route = createLazyFileRoute("/integrations/")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const startWhoopMutation = useMutation({
    mutationFn: async () => startWhoopOAuth(),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  return (
    <AppLayout>
      <div className="integrations-page-layout">
        <div className="integrations-page-header animate-fade-slide-in">
          <div>
            <h1 className="integrations-page-title">Integrations</h1>
            <p className="integrations-page-subtitle">
              Connect external services to enrich your HealthMetrics data
            </p>
          </div>
        </div>

        <Card className="integrations-card">
          <CardHeader className="integrations-card-header">
            <div className="integrations-card-title-row">
              <div className="integrations-card-brand">
                <div className="integrations-card-icon">
                  <Activity className="integrations-card-icon-svg" />
                </div>
                <div>
                  <CardTitle>WHOOP</CardTitle>
                  <p className="integrations-card-subtitle">
                    Recovery, sleep, workout, and cycle data
                  </p>
                </div>
              </div>
              <span className="integrations-card-status">Not connected</span>
            </div>
          </CardHeader>

          <CardContent className="integrations-card-content">
            <div className="integrations-card-meta">
              <div>
                <p className="integrations-card-label">Last sync</p>
                <p className="integrations-card-value">—</p>
              </div>
              <div>
                <p className="integrations-card-label">Next sync</p>
                <p className="integrations-card-value">—</p>
              </div>
            </div>

            <div className="integrations-card-actions">
              <Button
                className="integrations-card-button"
                onClick={() => startWhoopMutation.mutate()}
                disabled={startWhoopMutation.isPending}
              >
                Connect WHOOP
              </Button>
              <Button variant="outline" disabled>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
