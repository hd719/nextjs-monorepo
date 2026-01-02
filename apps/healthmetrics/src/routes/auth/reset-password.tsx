import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/forms/AuthLayout";
import { AuthCard } from "@/components/forms/AuthCard";
import { AuthFormField } from "@/components/forms/AuthFormField";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validation";
import { getErrorMessage } from "@/utils/auth-helpers";

export const Route = createFileRoute("/auth/reset-password" as any)({
  component: ResetPasswordComponent,
});

function ResetPasswordComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch() as { token?: string };

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Check if token is present
  useEffect(() => {
    if (!search.token) {
      setTokenError(
        "No reset token provided. Please request a new reset link."
      );
    }
  }, [search.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (!search.token) {
      setServerError(
        "No reset token provided. Please request a new reset link."
      );
      return;
    }

    // Validate form
    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordFormData, string>> =
        {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ResetPasswordFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Call Better-Auth reset password API
      const response = await authClient.resetPassword({
        token: search.token,
        newPassword: formData.password,
      });

      if (response.error) {
        setServerError(getErrorMessage(response.error));
        return;
      }

      // Success! Redirect to login
      navigate({ to: "/login" as any });
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

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
                  to="/login"
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <AuthFormField
            name="password"
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            value={formData.password}
            onChange={(value) => setFormData({ ...formData, password: value })}
            onBlur={() => {
              const result = resetPasswordSchema.safeParse(formData);
              if (!result.success) {
                const passwordError = result.error.errors.find(
                  (err) => err.path[0] === "password"
                );
                setErrors({
                  ...errors,
                  password: passwordError?.message,
                });
              } else {
                setErrors({ ...errors, password: undefined });
              }
            }}
            error={errors.password}
            autoComplete="new-password"
          />

          <AuthFormField
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={(value) =>
              setFormData({ ...formData, confirmPassword: value })
            }
            onBlur={() => {
              const result = resetPasswordSchema.safeParse(formData);
              if (!result.success) {
                const confirmError = result.error.errors.find(
                  (err) => err.path[0] === "confirmPassword"
                );
                setErrors({
                  ...errors,
                  confirmPassword: confirmError?.message,
                });
              } else {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Password must:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Be at least 8 characters long</li>
              <li>Contain at least one uppercase letter</li>
              <li>Contain at least one lowercase letter</li>
              <li>Contain at least one number</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>

          <div className="text-center text-sm">
            <Link
              to="/login"
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
