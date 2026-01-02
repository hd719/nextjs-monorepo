import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "@/components/forms/AuthLayout";
import { AuthCard } from "@/components/forms/AuthCard";
import { AuthFormField } from "@/components/forms/AuthFormField";
import { loginSchema, type LoginFormData } from "@/lib/validation";
import { getErrorMessage } from "@/utils/auth-helpers";
import styles from "@/components/forms/AuthCard.module.css";

export const Route = createFileRoute("/login/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field: keyof LoginFormData, value: string) => {
    try {
      loginSchema.shape[field].parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, [field]: error.errors[0]?.message }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setIsLoading(true);

    try {
      // Validate form
      loginSchema.parse(formData);

      // Call auth client
      const result = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        setServerError(getErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard on success
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      if (error.errors) {
        // Validation errors
        const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        setServerError(getErrorMessage(error));
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Log In"
        description="Enter your credentials to access your account"
      >
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          {serverError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          <AuthFormField
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, email: value }));
              validateField("email", value);
            }}
            error={errors.email}
            autoComplete="email"
          />

          <AuthFormField
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, password: value }));
              validateField("password", value);
            }}
            error={errors.password}
            autoComplete="current-password"
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>

          <div className={styles.linkSection}>
            <div>
              <Link to="/auth/forgot-password" className={styles.link}>
                Forgot password?
              </Link>
            </div>
            <div>
              <span className={styles.linkText}>Don't have an account? </span>
              <Link to="/signup" className={styles.link}>
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
