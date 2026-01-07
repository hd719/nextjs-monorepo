import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout, AuthCard } from "@/components/auth";
import { resetPasswordSchema } from "@/utils/validation";
import { getErrorMessage } from "@/utils/auth-helpers";
import { getFieldError } from "@/utils/form-errors";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordComponent,
});

function ResetPasswordComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch() as { token?: string };

  const [serverError, setServerError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

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
        const response = await authClient.resetPassword({
          token: search.token,
          newPassword: value.password,
        });

        if (response.error) {
          setServerError(getErrorMessage(response.error));
          return;
        }

        navigate({ to: ROUTES.AUTH.LOGIN });
      } catch (error) {
        setServerError(getErrorMessage(error));
      }
    },
  });

  if (tokenError) {
    return (
      <AuthLayout>
        <AuthCard title="Invalid Reset Link" description="">
          <div className="auth-text-space-y">
            <div className="auth-alert-error">{tokenError}</div>

            <div className="auth-text-center-sm auth-text-space-y">
              <div>
                <Link
                  to={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="auth-form-link"
                >
                  Request a new reset link
                </Link>
              </div>
              <div>
                <Link to={ROUTES.AUTH.LOGIN} className="auth-form-link">
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
          className="auth-form-container"
        >
          {serverError && <div className="auth-alert-error">{serverError}</div>}

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

          <div className="auth-text-center-xs auth-text-space-y">
            <p>Password must:</p>
            <ul className="auth-list">
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
              <Button
                type="submit"
                className="auth-submit-btn"
                disabled={!canSubmit}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            )}
          </form.Subscribe>

          <div className="auth-text-center-sm">
            <Link to={ROUTES.AUTH.LOGIN} className="auth-form-link">
              Back to Login
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
