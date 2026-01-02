import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

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
        setTimeout(() => navigate({ to: "/login" }), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
        setStatus("error");
      }
    };

    verify();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Activity className="w-8 h-8 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email verified!"}
            {status === "error" && "Verification failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <p className="text-center text-muted-foreground">
                Please wait while we verify your email...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Success!</p>
                <p className="text-muted-foreground">
                  Your email has been verified. Redirecting to login...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Verification failed</p>
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" asChild>
                  <Link to="/">Go to Home</Link>
                </Button>
                <Button asChild>
                  <Link to="/login">Log In</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
