import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  autoComplete?: string;
}

export function AuthFormField({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
}: AuthFormFieldProps) {
  return (
    <div className="auth-form-field-container">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="auth-form-field-error-message">
          {error}
        </p>
      )}
    </div>
  );
}
