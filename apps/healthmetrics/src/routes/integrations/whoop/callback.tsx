import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { completeWhoopOAuth } from "@/server/integrations";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/integrations/whoop/callback")({
  component: WhoopCallback,
});

function WhoopCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finishLink = async () => {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get("error");
      const oauthErrorDescription = params.get("error_description");

      if (oauthError) {
        setError(
          oauthErrorDescription
            ? `${oauthError}: ${oauthErrorDescription}`
            : oauthError
        );
        setStatus("error");
        return;
      }

      const code = params.get("code");
      const state = params.get("state");

      if (!code || !state) {
        setError("Missing OAuth code or state.");
        setStatus("error");
        return;
      }

      try {
        await completeWhoopOAuth({ data: { code, state } });
        setStatus("success");
        setTimeout(() => navigate({ to: ROUTES.INTEGRATIONS }), 2000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to connect WHOOP."
        );
        setStatus("error");
      }
    };

    finishLink();
  }, [navigate]);

  return (
    <div className="auth-verify-container">
      <Card className="auth-card">
        <CardHeader>
          <div className="auth-verify-content">
            <div className="auth-verify-logo-container">
              <Activity className="auth-verify-logo-icon" aria-hidden="true" />
            </div>
          </div>
          <CardTitle className="auth-verify-title">
            {status === "loading" && "Connecting WHOOP..."}
            {status === "success" && "WHOOP connected!"}
            {status === "error" && "WHOOP connection failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="auth-text-space-y">
          {status === "loading" && (
            <div className="auth-verify-content">
              <Loader2 className="auth-verify-spinner" aria-hidden="true" />
              <p className="auth-verify-text">
                Finishing your WHOOP connection...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="auth-verify-content">
              <div className="auth-verify-logo-container">
                <CheckCircle
                  className="auth-verify-success-icon"
                  aria-hidden="true"
                />
              </div>
              <div className="auth-text-center-sm auth-text-space-y">
                <p className="auth-verify-success-title">Success!</p>
                <p className="auth-verify-text">
                  Your WHOOP account is connected. Redirecting to integrations...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="auth-verify-content">
              <div className="auth-verify-error-container">
                <XCircle className="auth-verify-error-icon" aria-hidden="true" />
              </div>
              <div className="auth-text-center-sm auth-text-space-y">
                <p className="auth-verify-success-title">Connection failed</p>
                <p className="auth-verify-error-text">{error}</p>
              </div>
              <div className="auth-verify-actions">
                <Button variant="outline" asChild>
                  <Link to={ROUTES.INTEGRATIONS}>Back to Integrations</Link>
                </Button>
                <Button asChild>
                  <Link to={ROUTES.DASHBOARD}>Go to Dashboard</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
