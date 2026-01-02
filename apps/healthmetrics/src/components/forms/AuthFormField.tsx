import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./AuthFormField.module.css";

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
    <div className={styles.fieldContainer}>
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
        <p id={`${name}-error`} className={styles.errorMessage}>
          {error}
        </p>
      )}
    </div>
  );
}
