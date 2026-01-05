import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { AuthLayout, AuthCard } from "@/components/auth";
import { getErrorMessage } from "@/utils/auth-helpers";
import { getFieldError } from "@/utils/form-errors";
import { loginSchema } from "@/utils/validation";
import { ROUTES } from "@/constants/routes";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);

      try {
        // Call auth client
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });

        if (result.error) {
          setServerError(getErrorMessage(result.error));
          return;
        }

        // Redirect to dashboard on success
        navigate({ to: ROUTES.DASHBOARD });
      } catch (error: unknown) {
        setServerError(getErrorMessage(error as Error));
      }
    },
  });

  return (
    <AuthLayout>
      <AuthCard
        title="Log In"
        description="Enter your credentials to access your account"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="auth-form-container"
        >
          {serverError && (
            <div className="auth-alert-container auth-alert-container-error">
              <p className="auth-alert-text-error">{serverError}</p>
            </div>
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

          <form.Field name="password">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="loader-icon" aria-hidden="true" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            )}
          </form.Subscribe>

          <div className="auth-form-link-section">
            <div>
              <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="auth-form-link">
                Forgot password?
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
