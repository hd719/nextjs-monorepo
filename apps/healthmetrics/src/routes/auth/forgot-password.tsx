import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout, AuthCard } from "@/components/auth";
import { AUTH_ERRORS } from "@/constants/errors";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/utils/auth-helpers";
import { getFieldError } from "@/utils/form-errors";
import { forgotPasswordSchema } from "@/utils/validation";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordComponent,
});

function ForgotPasswordComponent() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setSuccessMessage(null);

      try {
        await authClient.requestPasswordReset({
          email: value.email,
          redirectTo: "/auth/reset-password",
        });

        // Show success message (for security, we show this even if email doesn't exist)
        setSuccessMessage(AUTH_ERRORS.RESET_EMAIL_SENT);
        form.reset();
      } catch (error) {
        setServerError(getErrorMessage(error));
      }
    },
  });

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot Password"
        description="Enter your email address and we'll send you a link to reset your password"
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

          {successMessage && (
            <div className="auth-alert-success">{successMessage}</div>
          )}

          <form.Field name="email">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="you@example.com"
                  autoComplete="email"
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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="auth-submit-btn"
                disabled={!canSubmit}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            )}
          </form.Subscribe>

          <div className="auth-form-link-section">
            <div>
              <Link to={ROUTES.AUTH.LOGIN} className="auth-form-link">
                Back to Login
              </Link>
            </div>
            <div>
              <span className="auth-form-link-text">
                Don't have an account?{" "}
              </span>
              <Link to={ROUTES.AUTH.SIGNUP} className="auth-form-link">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
