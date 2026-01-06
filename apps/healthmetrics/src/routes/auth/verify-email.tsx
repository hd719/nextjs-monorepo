import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/auth/verify-email")({
  component: VerifyEmail,
});

function VerifyEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          setError("No verification token found");
          setStatus("error");
          return;
        }

        const result = await authClient.verifyEmail({
          query: { token },
        });

        if (result.error) {
          throw new Error(result.error.message || "Verification failed");
        }

        setStatus("success");
        setTimeout(() => navigate({ to: ROUTES.AUTH.LOGIN }), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
        setStatus("error");
      }
    };

    verify();
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
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email verified!"}
            {status === "error" && "Verification failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="auth-text-space-y">
          {status === "loading" && (
            <div className="auth-verify-content">
              <Loader2 className="auth-verify-spinner" aria-hidden="true" />
              <p className="auth-verify-text">
                Please wait while we verify your email...
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
                  Your email has been verified. Redirecting to login...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="auth-verify-content">
              <div className="auth-verify-error-container">
                <XCircle
                  className="auth-verify-error-icon"
                  aria-hidden="true"
                />
              </div>
              <div className="auth-text-center-sm auth-text-space-y">
                <p className="auth-verify-success-title">Verification failed</p>
                <p className="auth-verify-error-text">{error}</p>
              </div>
              <div className="auth-verify-actions">
                <Button variant="outline" asChild>
                  <Link to={ROUTES.HOME}>Go to Home</Link>
                </Button>
                <Button asChild>
                  <Link to={ROUTES.AUTH.LOGIN}>Log In</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
