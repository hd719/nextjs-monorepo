import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./ProfileForm.module.css";

// Helper function to format dates
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

interface ProfileAccountSettingsProps {
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean;
}

export function ProfileAccountSettings({
  timezone,
  onTimezoneChange,
  createdAt,
  updatedAt,
  isAdmin,
}: ProfileAccountSettingsProps) {
  return (
    <Card className={styles.formSection}>
      <h2 className={styles.sectionHeading}>Account Settings</h2>
      <div className={styles.fieldGrid}>
        {/* Timezone */}
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className={styles.selectInput}
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Anchorage">Alaska Time (AKT)</option>
            <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
          </select>
        </div>

        {/* Account Created (read-only) */}
        <div>
          <Label htmlFor="createdAt">Account Created</Label>
          <Input
            id="createdAt"
            type="text"
            value={formatDate(createdAt)}
            disabled
            className={styles.readOnlyInput}
          />
        </div>

        {/* Last Updated (read-only) */}
        <div>
          <Label htmlFor="updatedAt">Last Updated</Label>
          <Input
            id="updatedAt"
            type="text"
            value={formatDate(updatedAt)}
            disabled
            className={styles.readOnlyInput}
          />
        </div>

        {/* Admin Status (read-only) */}
        {isAdmin && (
          <div className={styles.emailField}>
            <Label htmlFor="isAdmin">Account Type</Label>
            <Input
              id="isAdmin"
              type="text"
              value="Administrator"
              disabled
              className={styles.readOnlyInput}
            />
            <p className={styles.helperText}>
              You have administrator privileges.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
