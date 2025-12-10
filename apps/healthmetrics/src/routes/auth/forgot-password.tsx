import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/forms/AuthLayout";
import { AuthCard } from "@/components/forms/AuthCard";
import { AuthFormField } from "@/components/forms/AuthFormField";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validation";
import { AUTH_ERRORS } from "@/constants/errors";
import { getErrorMessage } from "@/utils/auth-helpers";

export const Route = createFileRoute("/auth/forgot-password" as any)({
  component: ForgotPasswordComponent,
});

function ForgotPasswordComponent() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ForgotPasswordFormData, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setSuccessMessage(null);

    // Validate form
    const result = forgotPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ForgotPasswordFormData, string>> =
        {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ForgotPasswordFormData] =
            err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      await authClient.requestPasswordReset({
        email: formData.email,
        redirectTo: "/auth/reset-password",
      });

      // Show success message (for security, we show this even if email doesn't exist)
      setSuccessMessage(AUTH_ERRORS.RESET_EMAIL_SENT);
      setFormData({ email: "" });
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot Password"
        description="Enter your email address and we'll send you a link to reset your password"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
              {successMessage}
            </div>
          )}

          <AuthFormField
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            onBlur={() => {
              const result = forgotPasswordSchema.safeParse(formData);
              if (!result.success) {
                const emailError = result.error.errors.find(
                  (err) => err.path[0] === "email"
                );
                setErrors({
                  ...errors,
                  email: emailError?.message,
                });
              } else {
                setErrors({ ...errors, email: undefined });
              }
            }}
            error={errors.email}
            autoComplete="email"
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center text-sm space-y-2">
            <div>
              <Link
                to="/login"
                className="text-accent hover:underline font-medium"
              >
                Back to Login
              </Link>
            </div>
            <div>
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <Link
                to="/signup"
                className="text-accent hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
