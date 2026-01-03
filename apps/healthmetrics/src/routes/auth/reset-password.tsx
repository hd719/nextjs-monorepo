import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/forms/AuthLayout";
import { AuthCard } from "@/components/forms/AuthCard";
import { resetPasswordSchema } from "@/lib/validation";
import { getErrorMessage } from "@/utils/auth-helpers";
import { getFieldError } from "@/utils/form-errors";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordComponent,
});

function ResetPasswordComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch() as { token?: string };

  const [serverError, setServerError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Check if token is present
  useEffect(() => {
    if (!search.token) {
      setTokenError(
        "No reset token provided. Please request a new reset link."
      );
    }
  }, [search.token]);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);

      if (!search.token) {
        setServerError(
          "No reset token provided. Please request a new reset link."
        );
        return;
      }

      try {
        // Call Better-Auth reset password API
        const response = await authClient.resetPassword({
          token: search.token,
          newPassword: value.password,
        });

        if (response.error) {
          setServerError(getErrorMessage(response.error));
          return;
        }

        // Success! Redirect to login
        navigate({ to: "/auth/login" as any });
      } catch (error) {
        setServerError(getErrorMessage(error));
      }
    },
  });

  if (tokenError) {
    return (
      <AuthLayout>
        <AuthCard title="Invalid Reset Link" description="">
          <div className="space-y-4">
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {tokenError}
            </div>

            <div className="text-center text-sm space-y-2">
              <div>
                <Link
                  to="/auth/forgot-password"
                  className="text-accent hover:underline font-medium"
                >
                  Request a new reset link
                </Link>
              </div>
              <div>
                <Link
                  to="/auth/login"
                  className="text-accent hover:underline font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Reset Password"
        description="Enter your new password below"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {serverError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <form.Field name="password">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>New Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="util-field-error">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Confirm New Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="util-field-error">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Password must:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Be at least 8 characters long</li>
              <li>Contain at least one uppercase letter</li>
              <li>Contain at least one lowercase letter</li>
              <li>Contain at least one number</li>
            </ul>
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            )}
          </form.Subscribe>

          <div className="text-center text-sm">
            <Link
              to="/auth/login"
              className="text-accent hover:underline font-medium"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
