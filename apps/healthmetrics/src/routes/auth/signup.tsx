import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "@/components/forms/AuthLayout";
import { AuthCard } from "@/components/forms/AuthCard";
import { signupSchema } from "@/lib/validation";
import { getErrorMessage } from "@/utils/auth-helpers";
import { getFieldError } from "@/utils/form-errors";

export const Route = createFileRoute("/auth/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setSuccessMessage(null);

      try {
        // Call auth client
        const result = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.email.split("@")[0],
        });

        if (result.error) {
          setServerError(getErrorMessage(result.error));
          return;
        }

        // Show success message
        setSuccessMessage(
          "Account created! Check your console for the verification link."
        );

        // Redirect to login after showing success message
        setTimeout(() => {
          navigate({ to: "/auth/login" });
        }, 2000);
      } catch (error: any) {
        setServerError(getErrorMessage(error));
      }
    },
  });

  return (
    <AuthLayout>
      <AuthCard
        title="Create Account"
        description="Enter your details to get started"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="auth-form-container"
        >
          {successMessage && (
            <div className="p-3 rounded-md bg-accent/10 border border-accent/20">
              <p className="text-sm text-accent">{successMessage}</p>
            </div>
          )}

          {serverError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{serverError}</p>
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
                <Label htmlFor={field.name}>Confirm Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="••••••••"
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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            )}
          </form.Subscribe>

          <div className="auth-form-link-section">
            <div>
              <span className="auth-form-link-text">
                Already have an account?{" "}
              </span>
              <Link to="/auth/login" className="auth-form-link">
                Log in
              </Link>
            </div>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
