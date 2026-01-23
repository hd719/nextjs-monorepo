import { createLazyFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Activity, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToastContainer, useToast } from "@/components/ui/toast";
import {
  startWhoopOAuth,
  getWhoopIntegrationStatus,
  triggerWhoopSync,
  disconnectWhoop,
} from "@/server/integrations";
import { formatDate } from "@/utils";

export const Route = createLazyFileRoute("/integrations/")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { toasts, toast, removeToast } = useToast();
  const statusQuery = useQuery({
    queryKey: ["whoop-integration-status"],
    queryFn: async () => getWhoopIntegrationStatus(),
  });

  const startWhoopMutation = useMutation({
    mutationFn: async () => startWhoopOAuth(),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => disconnectWhoop(),
    onSuccess: () => {
      statusQuery.refetch();
    },
  });

  const syncWhoopMutation = useMutation({
    mutationFn: async () => triggerWhoopSync(),
    onSuccess: () => {
      toast.success(
        "WHOOP sync finished",
        "Your latest WHOOP data is now available."
      );
      setTimeout(() => {
        statusQuery.refetch();
      }, 2000);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to sync WHOOP.";
      toast.error("WHOOP sync failed", message);
    },
  });

  const status = statusQuery.data?.status ?? "disconnected";
  const isConnected = status === "connected";
  const isDisconnecting = disconnectMutation.isPending;
  const isSyncing = syncWhoopMutation.isPending;
  const lastSyncLabel = statusQuery.data?.lastSyncAt
    ? formatDate(statusQuery.data.lastSyncAt)
    : "—";
  const nextSyncLabel =
    isConnected && statusQuery.data?.lastSyncAt
      ? new Date(
          new Date(statusQuery.data.lastSyncAt).getTime() + 12 * 60 * 60 * 1000
        ).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Manual";

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
              <span className="integrations-card-status">
                {statusQuery.isLoading
                  ? "Loading..."
                  : isConnected
                    ? "Connected"
                    : "Not connected"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="integrations-card-content">
            <div className="integrations-card-meta">
              <div>
                <p className="integrations-card-label">Last sync</p>
                <p className="integrations-card-value">
                  {statusQuery.isLoading ? "—" : lastSyncLabel}
                </p>
              </div>
              <div>
                <p className="integrations-card-label">Next sync</p>
                <p className="integrations-card-value">
                  {statusQuery.isLoading ? "—" : nextSyncLabel}
                </p>
              </div>
            </div>

            <div className="integrations-card-actions">
              <Button
                className="integrations-card-button"
                variant={isConnected ? "outline" : "default"}
                onClick={() =>
                  isConnected
                    ? disconnectMutation.mutate()
                    : startWhoopMutation.mutate()
                }
                disabled={
                  startWhoopMutation.isPending ||
                  statusQuery.isLoading ||
                  isDisconnecting
                }
              >
                {isConnected
                  ? isDisconnecting
                    ? "Disconnecting..."
                    : "Disconnect"
                  : "Connect WHOOP"}
              </Button>
              <Button
                variant="outline"
                onClick={() => syncWhoopMutation.mutate()}
                disabled={!isConnected || statusQuery.isLoading || isSyncing}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isSyncing ? "Syncing..." : "Sync now"}
              </Button>
            </div>

            {statusQuery.data?.lastError ? (
              <div className="integrations-card-error">
                <p className="integrations-card-error-title">
                  Last sync error
                </p>
                <p className="integrations-card-error-message">
                  {statusQuery.data.lastError}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
