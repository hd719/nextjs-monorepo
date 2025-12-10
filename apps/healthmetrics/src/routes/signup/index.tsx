import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "@/components/forms/AuthLayout";
import { AuthCard } from "@/components/forms/AuthCard";
import { AuthFormField } from "@/components/forms/AuthFormField";
import { signupSchema, type SignupFormData } from "@/lib/validation";
import { AUTH_ERRORS } from "@/constants/errors";
import { getErrorMessage } from "@/utils/auth-helpers";

export const Route = createFileRoute("/signup/")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field: keyof SignupFormData, value: string) => {
    try {
      if (field === "confirmPassword") {
        // For confirmPassword, validate the whole object to check if passwords match
        signupSchema.parse({ ...formData, [field]: value });
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      } else {
        signupSchema.shape[field].parse(value);
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    } catch (error: any) {
      const message = error.errors?.[0]?.message || AUTH_ERRORS.UNKNOWN_ERROR;
      setErrors((prev) => ({ ...prev, [field]: message }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Validate form
      signupSchema.parse(formData);

      // Call auth client
      const result = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.email.split("@")[0],
      });

      if (result.error) {
        setServerError(getErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      // Show success message
      setSuccessMessage(
        "Account created! Check your console for the verification link."
      );
      setIsLoading(false);

      // Redirect to login after showing success message
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (error: any) {
      if (error.errors) {
        // Validation errors
        const newErrors: Partial<Record<keyof SignupFormData, string>> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof SignupFormData] = err.message;
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
        title="Create Account"
        description="Enter your details to get started"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            autoComplete="new-password"
          />

          <AuthFormField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, confirmPassword: value }));
              validateField("confirmPassword", value);
            }}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-accent hover:underline font-medium"
            >
              Log in
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
